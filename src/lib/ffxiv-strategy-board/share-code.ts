import { StrategyBoardScene } from './strategy-board'
import { deserializeSceneData, serializeScene } from './serialization'
import { transformStreamToUint8ArrayTransformer, crc32 } from './utils'

const alphabet = 'fReAFBudk63KL+Y-zT5DnHhQU9GZIjNr1maOpoMXiJlg8Cxcv0sy2w7qStEV4PbW'

async function encodeShareCode(data: Uint8Array): Promise<string> {

  const dataLength = data.length

  // 压缩
  const compressionStream = new CompressionStream('deflate')
  const compressedData = await transformStreamToUint8ArrayTransformer(compressionStream)(data)

  // 打包，加长度头
  const packedData = new Uint8Array(compressedData.length + 6)
  const packedDataView = new DataView(packedData.buffer)
  packedData.set(compressedData, 6)
  packedDataView.setUint16(4, dataLength, true)

  // 加校验码
  const checksumContent = packedData.slice(4)
  const checksum = crc32(checksumContent)
  packedDataView.setUint32(0, checksum, true)

  // 切分为6bit的单元
  const values = new Uint8Array(Math.ceil(packedData.length * 4 / 3))
  for (let index = 0; index < packedData.length / 3; index++) {
    const tripleBytes = (packedData[index * 3] << 16) | (packedData[index * 3 + 1] << 8) | (packedData[index * 3 + 2])
    values[index * 4] = (tripleBytes >> 18) & 0x3f
    values[index * 4 + 1] = (tripleBytes >> 12) & 0x3f
    values[index * 4 + 2] = (tripleBytes >> 6) & 0x3f
    values[index * 4 + 3] = tripleBytes & 0x3f
  }

  // 混淆，并用类似Base64的方式编码
  const maskValue = 0
  const mask = alphabet[maskValue]
  const charArray: string[] = []
  for (let index = 0; index < values.length; index++) {
    const value = (values[index] + maskValue + index) % 64
    charArray[index] = alphabet[value]
  }
  const content = charArray.join('')

  // 格式化为分享码
  const shareCode = `[stgy:a${mask}${content}]`

  return shareCode
}

async function decodeShareCode(shareCode: string): Promise<Uint8Array> {

  // 从分享码提取信息
  const matchResult = shareCode.replace(/\s/g, '').match(/^\[stgy:a([a-zA-Z0-9+-])([a-zA-Z0-9+-]+)]$/)
  if (matchResult === null) throw new Error('分享码格式不正确')
  const [, mask, content] = matchResult

  // 用类似Base64的方式解码，处理混淆
  const maskValue = alphabet.indexOf(mask)
  if (maskValue < 0) throw new Error('分享码包含异常字符')
  const values = new Uint8Array(content.length)
  for (let index = 0; index < content.length; index++) {
    const value = alphabet.indexOf(content[index])
    if (value < 0) throw new Error('分享码包含异常字符')
    values[index] = value - maskValue - index
    values[index] = values[index] % 64
  }

  // 将6bit的单元组合为完整数据
  const packedData = new Uint8Array(Math.floor(values.length * 3 / 4))
  for (let index = 0; index < values.length / 4; index++) {
    const tripleBytes = (values[index * 4] << 18) | (values[index * 4 + 1] << 12) | (values[index * 4 + 2] << 6) | (values[index * 4 + 3])
    packedData[index * 3] = tripleBytes >> 16
    packedData[index * 3 + 1] = tripleBytes >> 8
    packedData[index * 3 + 2] = tripleBytes
  }

  // 解包，提取长度头和校验码
  const packedDataView = new DataView(packedData.buffer)
  const checksum = packedDataView.getUint32(0, true)
  const dataLength = packedDataView.getUint16(4, true)
  const compressedData = packedData.slice(6)

  // 校验校验码
  const checksumContent = packedData.slice(4)
  const actualChecksum = crc32(checksumContent)
  if (actualChecksum !== checksum) throw new Error('分享码校验失败')

  // 解压缩
  const decompressionStream = new DecompressionStream('deflate')
  const data = await transformStreamToUint8ArrayTransformer(decompressionStream)(compressedData)

  // 校验长度
  const actualDataLength = data.length
  if (actualDataLength !== dataLength) throw new Error('分享码长度校验失败')

  return data
}

export async function shareCodeToScene(shareCode: string): Promise<StrategyBoardScene> {
  const data = await decodeShareCode(shareCode)
  const scene = deserializeSceneData(data)
  return scene
}

export async function sceneToShareCode(scene: StrategyBoardScene): Promise<string> {
  const data = serializeScene(scene)
  const shareCode = await encodeShareCode(data)
  return shareCode
}
