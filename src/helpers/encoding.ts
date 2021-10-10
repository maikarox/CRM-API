export function base64ToBinary(data: string): Buffer {
  const base64 = data.split(",")[1]
  return Buffer.from(base64, 'base64');
}

export function binaryToBase64(data: Buffer): string {
  return Buffer.from(data).toString('base64');
}