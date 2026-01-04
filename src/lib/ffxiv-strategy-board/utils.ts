
export function transformStreamToUint8ArrayTransformer(transformStream: TransformStream): (input: Uint8Array) => Promise<Uint8Array> {
  return async (input: Uint8Array) => {
    const writer = transformStream.writable.getWriter()
    writer.write(input)
    writer.close()

    const reader = transformStream.readable.getReader()
    const chunks: Uint8Array[] = []
    let chunksTotalLength = 0
    while (true) {
      const result = await reader.read()
      if (result.value) {
        chunks.push(result.value)
        chunksTotalLength += result.value.length
      }
      if (result.done) break
    }

    const output = new Uint8Array(chunksTotalLength)
    let offset = 0
    for (const chunk of chunks) {
      output.set(chunk, offset)
      offset += chunk.length
    }

    return output
  }
}

const crc32Table = (() => {
  const polynomial = 0xedb88320

  const table: number[] = []
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (c >>> 1) ^ polynomial : (c >>> 1)
    }
    table[i] = c
  }

  return table
})()

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff

  for (let i = 0; i < data.length; i++) {
    const byte = data[i]
    const index = (crc ^ byte) & 0xff
    crc = (crc >>> 8) ^ crc32Table[index]
  }

  crc = crc ^ 0xffffffff
  return crc >>> 0
}
