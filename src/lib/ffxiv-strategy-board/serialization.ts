import {
  StrategyBoardScene,
  StrategyBoardBackground,
  StrategyBoardObjectType,
  StrategyBoardObjectBase,
  StrategyBoardCommonObject,
  StrategyBoardConeObject,
  StrategyBoardArcObject,
  StrategyBoardMechanicLineStackObject,
  StrategyBoardMechanicLinearKnockbackObject,
  StrategyBoardRectangleObject,
  StrategyBoardLineObject,
  StrategyBoardTextObject,
} from './strategy-board'
import { uuid } from '@/lib/utils'
import { reverseMap } from './utils'

const backgroundValues = new Map<StrategyBoardBackground, number>()
backgroundValues.set(StrategyBoardBackground.None, 0x01)
backgroundValues.set(StrategyBoardBackground.Checkered, 0x02)
backgroundValues.set(StrategyBoardBackground.CheckeredCircleField, 0x03)
backgroundValues.set(StrategyBoardBackground.CheckeredSquareField, 0x04)
backgroundValues.set(StrategyBoardBackground.Gray, 0x05)
backgroundValues.set(StrategyBoardBackground.GrayCircleField, 0x06)
backgroundValues.set(StrategyBoardBackground.GraySquareField, 0x07)
const mapValuesToBackground = reverseMap(backgroundValues)

const utf8Decoder = new TextDecoder()
const utf8Encoder = new TextEncoder()

export function serializeScene(scene: StrategyBoardScene): Uint8Array {
  const buffer = new ArrayBuffer(4096)
  const dataView = new DataView(buffer)
  let offset = 0

  // 魔数，4字节
  const magic = 0x00000002
  dataView.setUint32(offset, magic, true)
  offset += 4

  // 内容长度，4字节，因长度未知暂时留空
  offset += 4

  // 预留空白，8字节
  offset += 8

  // 预留空白，2字节
  offset += 2

  // 动态部分长度，4字节，因长度未知暂时留空
  offset += 4

  // 字节对齐，2字节
  offset += 2

  // 区段顺序
  const sections: { type: number, objectIndex?: number }[] = [
    { type: 0x0001 },
    ...scene.objects.map((object, index) => ({ type: 0x0002, objectIndex: index })),
    { type: 0x0004 },
    { type: 0x0005 },
    { type: 0x0006 },
    { type: 0x0007 },
    { type: 0x0008 },
    { type: 0x000a },
    { type: 0x000b },
    { type: 0x000c },
    { type: 0x0003 },
  ]

  // 按顺序依次写入各区段数据
  for (const { type: sectionType, objectIndex } of sections) {

    // 区段类型，4字节
    dataView.setUint16(offset, sectionType, true)
    offset += 2

    // 按不同区段类型区分处理
    switch (sectionType) {

      // 战术板名称区段
      case 0x0001:

        // 战术板名称
        const nameData = utf8Encoder.encode(scene.name)

        // 名称数据长度，2字节，需要补0并对齐字节
        const nameLength = nameData.length + 4 - nameData.length % 4
        dataView.setUint16(offset, nameLength, true)
        offset += 2

        // 写入战术板名称
        const nameBlank = new Uint8Array(buffer, offset, nameLength)
        nameBlank.set(nameData)
        offset += nameLength

        break

      // 图形区段
      case 0x0002:

        // 图形信息
        const object = scene.objects[objectIndex!]

        // 图形类型，2字节
        const type = object.type
        dataView.setUint16(offset, type, true)
        offset += 2
        
        // 对于文字类型，需要额外写入文本内容
        if (type === StrategyBoardObjectType.Text) {

          // 文本内容
          const textContentData = utf8Encoder.encode(object.content)

          // 前缀，2字节
          dataView.setUint16(offset, 0x0003, true)
          offset += 2

          // 文本长度，2字节，需要补0并对齐字节
          const textContentLength = textContentData.length + 4 - textContentData.length % 4
          dataView.setUint16(offset, textContentLength, true)
          offset += 2

          // 写入文本内容
          const textContentBlank = new Uint8Array(buffer, offset, textContentLength)
          textContentBlank.set(textContentData)
          offset += textContentLength
        }

        break

      // 划分为单元的区段
      case 0x0003:
      case 0x0004:
      case 0x0005:
      case 0x0006:
      case 0x0007:
      case 0x0008:
      case 0x000a:
      case 0x000b:
      case 0x000c:

        // 按不同区段类型封装数据
        const items: (number | [number, number] | [number, number, number, number])[] = []
        switch (sectionType) {

          // 背景区段
          case 0x0003:
            items.push(backgroundValues.get(scene.background)!)
            break

          // 图形标志位区段
          case 0x0004:
            scene.objects.forEach(object => {
              let flags = 0
              if (object.visible) flags |= 0x0001
              if (object.locked) flags |= 0x0008
              if (
                object.type !== StrategyBoardObjectType.Text &&
                object.type !== StrategyBoardObjectType.Line &&
                object.type !== StrategyBoardObjectType.Rectangle
              ) {
                if (object.flipped) flags |= 0x0002
              }
              items.push(flags)
            })
            break

          // 图形位置区段
          case 0x0005:
            scene.objects.forEach(object => {
              const x = object.position.x
              const y = object.position.y
              items.push([x, y])
            })
            break

          // 图形角度区段
          case 0x0006:
            scene.objects.forEach(object => {
              let rotation = 0
              if (
                object.type !== StrategyBoardObjectType.Text &&
                object.type !== StrategyBoardObjectType.Line
              ) {
                rotation = object.rotation < 0 ? object.rotation + 0xffff : object.rotation
              }
              items.push(rotation)
            })
            break

          // 图形尺寸区段
          case 0x0007:
            scene.objects.forEach(object => {
              let size = 100
              if (
                object.type !== StrategyBoardObjectType.Text &&
                object.type !== StrategyBoardObjectType.Line &&
                object.type !== StrategyBoardObjectType.Rectangle
              ) {
                size = object.size
              }
              items.push(size)
            })
            break

          // 图形颜色区段
          case 0x0008:
            scene.objects.forEach(object => {
              let transparency = 0
              let r = 255, g = 255, b = 255
              if (object.type !== StrategyBoardObjectType.Text) {
                transparency = object.transparency
              }
              if (
                object.type === StrategyBoardObjectType.Text ||
                object.type === StrategyBoardObjectType.Line ||
                object.type === StrategyBoardObjectType.Rectangle
              ) {
                r = object.color.r
                g = object.color.g
                b = object.color.b
              }
              items.push([r, g, b, transparency])
            })
            break

          // 图形额外参数1区段
          case 0x000a:
            scene.objects.forEach(object => {
              let param1 = 0
              switch (object.type) {
                case StrategyBoardObjectType.Line:
                  param1 = object.endPoint.x
                  break
                case StrategyBoardObjectType.Rectangle:
                  param1 = Math.round(object.width / 10)
                  break
                case StrategyBoardObjectType.MechanicConeAoE:
                case StrategyBoardObjectType.MechanicDonutAoE:
                  param1 = object.arcAngle
                  break
                case StrategyBoardObjectType.MechanicLinearKnockback:
                  param1 = object.horizontalCount
                  break
              }
              items.push(param1)
            })
            break

          // 图形额外参数2区段
          case 0x000b:
            scene.objects.forEach(object => {
              let param2 = 0
              switch (object.type) {
                case StrategyBoardObjectType.Line:
                  param2 = object.endPoint.y
                  break
                case StrategyBoardObjectType.Rectangle:
                  param2 = Math.round(object.height / 10)
                  break
                case StrategyBoardObjectType.MechanicDonutAoE:
                  param2 = object.innerRadius
                  break
                case StrategyBoardObjectType.MechanicLineStack:
                  param2 = object.displayCount
                  break
                case StrategyBoardObjectType.MechanicLinearKnockback:
                  param2 = object.verticalCount
                  break
              }
              items.push(param2)
            })
            break

          // 图形额外参数3区段
          case 0x000c:
            scene.objects.forEach(object => {
              let param3 = 0
              switch (object.type) {
                case StrategyBoardObjectType.Line:
                  param3 = Math.round(object.width / 10)
                  break
              }
              items.push(param3)
            })
            break
        }

        // 数据单元类型，2字节
        const itemType = new Map([
          [0x0003, 0x0001],
          [0x0004, 0x0001],
          [0x0005, 0x0003],
          [0x0006, 0x0001],
          [0x0007, 0x0000],
          [0x0008, 0x0002],
          [0x000a, 0x0001],
          [0x000b, 0x0001],
          [0x000c, 0x0001],
        ]).get(sectionType)!
        dataView.setUint16(offset, itemType, true)
        offset += 2

        // 数据单元数量，2字节
        const count = items.length
        dataView.setUint16(offset, count, true)
        offset += 2

        // 按数据单元类型写入数据
        switch (itemType) {

          // 单字节（需要字节对齐）
          case 0x0000:
            for (const item of items as number[]) {
              dataView.setUint8(offset, item)
              offset += 1
            }
            offset += count % 2
            break

          // 双字节
          case 0x0001:
            for (const item of items as number[]) {
              dataView.setUint16(offset, item, true)
              offset += 2
            }
            break

          // 单字节四元组
          case 0x0002:
            for (const item of items as [number, number, number, number][]) {
              dataView.setUint8(offset, item[0])
              dataView.setUint8(offset + 1, item[1])
              dataView.setUint8(offset + 2, item[2])
              dataView.setUint8(offset + 3, item[3])
              offset += 4
            }
            break

          // 双字节二元组
          case 0x0003:
            for (const item of items as [number, number][]) {
              dataView.setUint16(offset, item[0], true)
              dataView.setUint16(offset + 2, item[1], true)
              offset += 4
            }
            break
        }

        break
    }
  }

  // 补充写入内容长度，偏移量4，4字节
  const contentLength = offset - 16
  dataView.setUint32(4, contentLength, true)

  // 补充写入动态部分长度，偏移量18，4字节
  const dynamicLength = offset - 28
  dataView.setUint32(18, dynamicLength, true)

  const data = new Uint8Array(buffer, 0, offset)
  return data
}

export function deserializeSceneData(data: Uint8Array): StrategyBoardScene {

  const scene: StrategyBoardScene = {
    name: '',
    background: StrategyBoardBackground.None,
    objects: [],
  }

  const dataView = new DataView(data.buffer)
  let offset = 0

  // 魔数，4字节
  const magic = dataView.getUint32(offset, true)
  offset += 4
  if (magic !== 0x00000002) throw new Error('战术板数据格式不正确')

  // 内容长度，4字节
  const contentLength = dataView.getUint32(offset, true)
  offset += 4
  if (contentLength !== data.length - 16) throw new Error('战术板数据校验失败')

  // 预留空白，8字节
  offset += 8

  // 预留空白，2字节
  offset += 2

  // 动态部分长度，4字节
  const dynamicLength = dataView.getUint32(offset, true)
  offset += 4
  if (dynamicLength !== data.length - 28) throw new Error('战术板数据校验失败')

  // 字节对齐，2字节
  offset += 2

  // 对区段按依次解析
  while (offset < data.length) {

    // 区段类型，4字节
    const sectionType = dataView.getUint16(offset, true)
    offset += 2

    // 按不同区段类型区分处理
    switch (sectionType) {

      // 战术板名称区段
      case 0x0001:

        // 名称数据长度，2字节
        const nameLength = dataView.getUint16(offset, true)
        offset += 2

        // 战术板名称，需要去除末尾的空字符
        const nameData = data.slice(offset, offset + nameLength)
        scene.name = utf8Decoder.decode(nameData).replace(/\0*$/, '')
        offset += nameLength

        break

      // 图形区段
      case 0x0002:

        // 图形类型，2字节
        const type = dataView.getUint16(offset, true)
        offset += 2

        // 图形基本信息
        const objectBase: StrategyBoardObjectBase = {
          id: uuid(),
          type,
          visible: true,
          locked: false,
          position: {
            x: 0,
            y: 0,
          },
        }

        // 添加图形，按不同图形类型区分处理
        switch (type) {

          // 扇形范围攻击
          case StrategyBoardObjectType.MechanicConeAoE:
            const MechanicConeAoEObject: StrategyBoardConeObject = {
              ...objectBase,
              size: 50,
              flipped: false,
              rotation: 0,
              transparency: 0,
              arcAngle: 90,
            }
            scene.objects.push(MechanicConeAoEObject)
            break

          // 环形范围攻击
          case StrategyBoardObjectType.MechanicDonutAoE:
            const arcObject: StrategyBoardArcObject = {
              ...objectBase,
              size: 50,
              flipped: false,
              rotation: 0,
              transparency: 30,
              arcAngle: 360,
              innerRadius: 50,
            }
            scene.objects.push(arcObject)
            break

          // 分摊伤害攻击：直线型
          case StrategyBoardObjectType.MechanicLineStack:
            const MechanicLineStackObject: StrategyBoardMechanicLineStackObject = {
              ...objectBase,
              size: 100,
              flipped: false,
              rotation: 0,
              transparency: 0,
              displayCount: 1,
            }
            scene.objects.push(MechanicLineStackObject)
            break

          // 击退攻击：直线型
          case StrategyBoardObjectType.MechanicLinearKnockback:
            const MechanicLinearKnockbackObject: StrategyBoardMechanicLinearKnockbackObject = {
              ...objectBase,
              size: 100,
              flipped: false,
              rotation: 0,
              transparency: 0,
              horizontalCount: 1,
              verticalCount: 1,
            }
            scene.objects.push(MechanicLinearKnockbackObject)
            break

          // 直线范围攻击
          case StrategyBoardObjectType.Rectangle:
            const RectangleObject: StrategyBoardRectangleObject = {
              ...objectBase,
              width: 128,
              height: 128,
              rotation: 0,
              transparency: 0,
              color: {
                r: 255,
                g: 128,
                b: 0,
              },
            }
            scene.objects.push(RectangleObject)
            break

          // 线
          case StrategyBoardObjectType.Line:
            const lineObject: StrategyBoardLineObject = {
              ...objectBase,
              width: 6,
              endPoint: {
                x: 0,
                y: 0,
              },
              transparency: 0,
              color: {
                r: 255,
                g: 128,
                b: 0,
              },
            }
            scene.objects.push(lineObject)
            break

          // 文字，需要额外读取文本内容
          case StrategyBoardObjectType.Text:

            // 前缀，2字节
            offset += 2

            // 文本长度，2字节
            const textContentLength = dataView.getUint16(offset, true)
            offset += 2

            // 文本内容，需要去除末尾的空字符
            const textContentData = data.slice(offset, offset + textContentLength)
            const textContent = utf8Decoder.decode(textContentData).replace(/\0*$/, '')
            offset += textContentLength

            const textObject: StrategyBoardTextObject = {
              ...objectBase,
              content: textContent,
              color: {
                r: 255,
                g: 255,
                b: 255,
              },
            }
            scene.objects.push(textObject)
            break

          // 其他一般图形
          default:
            const commonObject: StrategyBoardCommonObject = {
              ...objectBase,
              size: 100,
              flipped: false,
              rotation: 0,
              transparency: 0,
            }
            scene.objects.push(commonObject)
        }

        break

      // 划分为单元的区段
      case 0x0003:
      case 0x0004:
      case 0x0005:
      case 0x0006:
      case 0x0007:
      case 0x0008:
      case 0x000a:
      case 0x000b:
      case 0x000c:

        // 数据单元类型，2字节
        const itemType = dataView.getUint16(offset, true)
        offset += 2

        // 数据单元数量，2字节
        const count = dataView.getUint16(offset, true)
        offset += 2

        // 按数据单元类型读取数据
        const items: (number | [number, number] | [number, number, number, number])[] = []
        switch (itemType) {

          // 单字节（需要字节对齐）
          case 0x0000:
            for (let index = 0; index < count; index++) {
              const item = dataView.getUint8(offset)
              offset += 1
              items.push(item)
            }
            offset += count % 2
            break

          // 双字节
          case 0x0001:
            for (let index = 0; index < count; index++) {
              const item = dataView.getUint16(offset, true)
              offset += 2
              items.push(item)
            }
            break

          // 单字节四元组
          case 0x0002:
            for (let index = 0; index < count; index++) {
              const item = [
                dataView.getUint8(offset),
                dataView.getUint8(offset + 1),
                dataView.getUint8(offset + 2),
                dataView.getUint8(offset + 3),
              ] as [number, number, number, number]
              offset += 4
              items.push(item)
            }
            break

          // 双字节二元组
          case 0x0003:
            for (let index = 0; index < count; index++) {
              const item = [
                dataView.getUint16(offset, true),
                dataView.getUint16(offset + 2, true),
              ] as [number, number]
              offset += 4
              items.push(item)
            }
            break

          default:
            throw new Error('战术板数据区段数据单元类型无法识别')
        }

        // 按不同区段类型区分处理
        switch (sectionType) {

          // 背景区段
          case 0x0003:
            scene.background = mapValuesToBackground.get(items[0] as number)!
            break

          // 图形标志位区段
          case 0x0004:
            ;(items as number[]).forEach((flags, index) => {
              const object = scene.objects[index]
              if (!object) throw new Error('战术板图形标志位区段存在无法识别的数据')

              object.visible = Boolean(flags & 0x0001)
              object.locked = Boolean(flags & 0x0008)

              const horizontalFlipped = Boolean(flags & 0x0002)
              const verticalFlipped = Boolean(flags & 0x0004)
              if (
                object.type !== StrategyBoardObjectType.Text &&
                object.type !== StrategyBoardObjectType.Line &&
                object.type !== StrategyBoardObjectType.Rectangle
              ) {
                object.flipped = horizontalFlipped !== verticalFlipped
                object.rotation += verticalFlipped ? 180 : 0
                object.rotation = object.rotation > 180 ? object.rotation - 360 : object.rotation
              }
            })
            break

          // 图形位置区段
          case 0x0005:
            ;(items as [number, number][]).forEach(([x, y], index) => {
              const object = scene.objects[index]
              if (!object) throw new Error('战术板图形位置区段存在无法识别的数据')

              object.position.x = x
              object.position.y = y
            })
            break

          // 图形角度区段
          case 0x0006:
            ;(items as number[]).forEach((rotation, index) => {
              const object = scene.objects[index]
              if (!object) throw new Error('战术板图形角度区段存在无法识别的数据')

              if (
                object.type !== StrategyBoardObjectType.Text &&
                object.type !== StrategyBoardObjectType.Line
              ) {
                object.rotation += rotation > 180 ? rotation - 0xffff : rotation
                object.rotation = object.rotation > 180 ? object.rotation - 360 : object.rotation
              }
            })
            break

          // 图形尺寸区段
          case 0x0007:
            ;(items as number[]).forEach((size, index) => {
              const object = scene.objects[index]
              if (!object) throw new Error('战术板图形尺寸区段存在无法识别的数据')

              if (
                object.type !== StrategyBoardObjectType.Text &&
                object.type !== StrategyBoardObjectType.Line &&
                object.type !== StrategyBoardObjectType.Rectangle
              ) {
                object.size = size
              }
            })
            break

          // 图形颜色区段
          case 0x0008:
            ;(items as [number, number, number, number][]).forEach(([r, g, b, transparency], index) => {
              const object = scene.objects[index]
              if (!object) throw new Error('战术板图形颜色区段存在无法识别的数据')

              if (object.type !== StrategyBoardObjectType.Text) {
                object.transparency = transparency
              }

              if (
                object.type === StrategyBoardObjectType.Text ||
                object.type === StrategyBoardObjectType.Line ||
                object.type === StrategyBoardObjectType.Rectangle
              ) {
                object.color.r = r
                object.color.g = g
                object.color.b = b
              }
            })
            break

          // 图形额外参数1区段
          case 0x000a:
            ;(items as number[]).forEach((param1, index) => {
              const object = scene.objects[index]
              if (!object) throw new Error('战术板图形额外参数1区段存在无法识别的数据')

              switch (object.type) {
                case StrategyBoardObjectType.Line:
                  object.endPoint.x = param1
                  break
                case StrategyBoardObjectType.Rectangle:
                  object.width = Math.round(param1 * 10)
                  break
                case StrategyBoardObjectType.MechanicConeAoE:
                case StrategyBoardObjectType.MechanicDonutAoE:
                  object.arcAngle = param1
                  break
                case StrategyBoardObjectType.MechanicLinearKnockback:
                  object.horizontalCount = param1
                  break
              }
            })
            break

          // 图形额外参数2区段
          case 0x000b:
            ;(items as number[]).forEach((param2, index) => {
              const object = scene.objects[index]
              if (!object) throw new Error('战术板图形额外参数2区段存在无法识别的数据')

              switch (object.type) {
                case StrategyBoardObjectType.Line:
                  object.endPoint.y = param2
                  break
                case StrategyBoardObjectType.Rectangle:
                  object.height = Math.round(param2 * 10)
                  break
                case StrategyBoardObjectType.MechanicDonutAoE:
                  object.innerRadius = param2
                  break
                case StrategyBoardObjectType.MechanicLineStack:
                  object.displayCount = param2
                  break
                case StrategyBoardObjectType.MechanicLinearKnockback:
                  object.verticalCount = param2
                  break
              }
            })
            break

          // 图形额外参数3区段
          case 0x000c:
            ;(items as number[]).forEach((param3, index) => {
              const object = scene.objects[index]
              if (!object) throw new Error('战术板图形额外参数3区段存在无法识别的数据')

              switch (object.type) {
                case StrategyBoardObjectType.Line:
                  object.width = Math.round(param3 * 10)
                  break
              }
            })
            break
        }

        break

      // 未识别的区段
      default:
        throw new Error(`战术板数据中存在无法识别的区段类型: 0x${sectionType.toString(16).padStart(4, '0')}`)
    }
  }

  return scene
}
