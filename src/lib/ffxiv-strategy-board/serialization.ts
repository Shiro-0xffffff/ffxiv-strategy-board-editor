import {
  StrategyBoardScene,
  StrategyBoardBackground,
  StrategyBoardObjectType,
  StrategyBoardObject,
  sceneWidth,
  sceneHeight,
  normalizeStrategyBoardName,
  normalizePosition,
  normalizeRotation,
  normalizeSize,
  normalizeWidth,
  normalizeHeight,
  normalizeLineEndPoint,
  normalizeLineWidth,
  normalizeInnerRadius,
  normalizeArcAngle,
  normalizeDisplayCount,
  normalizeText,
  normalizeColor,
  normalizeTransparency,
  createObject,
} from './strategy-board'

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
        const nameData = utf8Encoder.encode(normalizeStrategyBoardName(scene.name))

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
          const textContentData = utf8Encoder.encode(normalizeText(object.text))

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
            items.push(scene.background)
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
                object.type !== StrategyBoardObjectType.Rectangle &&
                object.type !== StrategyBoardObjectType.MechanicCircleAoE
              ) {
                if (object.flipped) flags |= 0x0002
              }
              items.push(flags)
            })
            break

          // 图形位置区段
          case 0x0005:
            scene.objects.forEach(object => {
              let position = { x: 0, y: 0 }
              if (object.type === StrategyBoardObjectType.Line) {
                const endPoint1 = {
                  x: object.position.x - object.endPointOffset.x,
                  y: object.position.y - object.endPointOffset.y,
                }
                const endPoint2 = {
                  x: object.position.x + object.endPointOffset.x,
                  y: object.position.y + object.endPointOffset.y,
                }
                ;[position] = normalizeLineEndPoint(endPoint1, endPoint2)
              } else {
                position = normalizePosition(object.position)
              }
              position = {
                x: Math.round(position.x + sceneWidth / 2),
                y: Math.round(position.y + sceneHeight / 2),
              }
              items.push([position.x, position.y])
            })
            break

          // 图形角度区段
          case 0x0006:
            scene.objects.forEach(object => {
              let rotation = 0
              if (
                object.type !== StrategyBoardObjectType.Text &&
                object.type !== StrategyBoardObjectType.Line &&
                object.type !== StrategyBoardObjectType.MechanicCircleAoE
              ) {
                rotation = normalizeRotation(object.rotation)
                rotation = rotation < 0 ? rotation + 0xffff : rotation
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
                size = normalizeSize(object.size)
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
                transparency = normalizeTransparency(object.transparency)
              }
              if (
                object.type === StrategyBoardObjectType.Text ||
                object.type === StrategyBoardObjectType.Line ||
                object.type === StrategyBoardObjectType.Rectangle
              ) {
                const color = normalizeColor(object.color)
                ;[r, g, b] = color.match(/[^#]{2}/g)!.map(channel => parseInt(channel, 16))
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
                  const endPoint1 = {
                    x: object.position.x - object.endPointOffset.x,
                    y: object.position.y - object.endPointOffset.y,
                  }
                  const endPoint2 = {
                    x: object.position.x + object.endPointOffset.x,
                    y: object.position.y + object.endPointOffset.y,
                  }
                  const [, position] = normalizeLineEndPoint(endPoint1, endPoint2)
                  param1 = Math.round(position.x + sceneWidth / 2)
                  break
                case StrategyBoardObjectType.Rectangle:
                  param1 = Math.round(normalizeWidth(object.size.width) / 10)
                  break
                case StrategyBoardObjectType.MechanicConeAoE:
                case StrategyBoardObjectType.MechanicDonutAoE:
                  param1 = normalizeArcAngle(object.arcAngle)
                  break
                case StrategyBoardObjectType.MechanicLineStack:
                  param1 = 1
                  break
                case StrategyBoardObjectType.MechanicLinearKnockback:
                  param1 = normalizeDisplayCount(object.displayCount.horizontal)
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
                  const endPoint1 = {
                    x: object.position.x - object.endPointOffset.x,
                    y: object.position.y - object.endPointOffset.y,
                  }
                  const endPoint2 = {
                    x: object.position.x + object.endPointOffset.x,
                    y: object.position.y + object.endPointOffset.y,
                  }
                  const [, position] = normalizeLineEndPoint(endPoint1, endPoint2)
                  param2 = Math.round(position.y + sceneHeight / 2)
                  break
                case StrategyBoardObjectType.Rectangle:
                  param2 = Math.round(normalizeHeight(object.size.height) / 10)
                  break
                case StrategyBoardObjectType.MechanicDonutAoE:
                  param2 = normalizeInnerRadius(object.innerRadius)
                  break
                case StrategyBoardObjectType.MechanicLineStack:
                  param2 = normalizeDisplayCount(object.displayCount)
                  break
                case StrategyBoardObjectType.MechanicLinearKnockback:
                  param2 = normalizeDisplayCount(object.displayCount.vertical)
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
                  param3 = Math.round(normalizeLineWidth(object.lineWidth) / 10)
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
        const object: StrategyBoardObject = createObject(type)

        // 对于文字，需要额外读取文本内容
        if (object.type === StrategyBoardObjectType.Text) {

          // 前缀，2字节
          offset += 2

          // 文本长度，2字节
          const textContentLength = dataView.getUint16(offset, true)
          offset += 2

          // 文本内容，需要去除末尾的空字符
          const textContentData = data.slice(offset, offset + textContentLength)
          object.text = utf8Decoder.decode(textContentData).replace(/\0*$/, '')
          offset += textContentLength
        }

        // 添加图形
        scene.objects.push(object)

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
            scene.background = items[0] as number
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
                object.type !== StrategyBoardObjectType.Rectangle &&
                object.type !== StrategyBoardObjectType.MechanicCircleAoE
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

              object.position.x = Math.round(x - sceneWidth / 2)
              object.position.y = Math.round(y - sceneHeight / 2)
            })
            break

          // 图形角度区段
          case 0x0006:
            ;(items as number[]).forEach((rotation, index) => {
              const object = scene.objects[index]
              if (!object) throw new Error('战术板图形角度区段存在无法识别的数据')

              if (
                object.type !== StrategyBoardObjectType.Text &&
                object.type !== StrategyBoardObjectType.Line &&
                object.type !== StrategyBoardObjectType.MechanicCircleAoE
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
                object.color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
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
                  object.endPointOffset.x = Math.round((param1 - sceneWidth / 2 - object.position.x) / 2)
                  object.position.x = Math.round(object.position.x + object.endPointOffset.x)
                  break
                case StrategyBoardObjectType.Rectangle:
                  object.size.width = Math.round(param1 * 10)
                  break
                case StrategyBoardObjectType.MechanicConeAoE:
                case StrategyBoardObjectType.MechanicDonutAoE:
                  object.arcAngle = param1
                  break
                case StrategyBoardObjectType.MechanicLinearKnockback:
                  object.displayCount.horizontal = param1
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
                  object.endPointOffset.y = Math.round((param2 - sceneHeight / 2 - object.position.y) / 2)
                  object.position.y = Math.round(object.position.y + object.endPointOffset.y)
                  break
                case StrategyBoardObjectType.Rectangle:
                  object.size.height = Math.round(param2 * 10)
                  break
                case StrategyBoardObjectType.MechanicDonutAoE:
                  object.innerRadius = param2
                  break
                case StrategyBoardObjectType.MechanicLineStack:
                  object.displayCount = param2
                  break
                case StrategyBoardObjectType.MechanicLinearKnockback:
                  object.displayCount.vertical = param2
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
                  object.lineWidth = Math.round(param3 * 10)
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
