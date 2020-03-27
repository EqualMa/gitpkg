export function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    const data = (chunk: Buffer) => chunks.push(chunk);

    const end = () => {
      stream.removeListener("data", data);
      stream.removeListener("error", reject);
      stream.removeListener("end", end);
      resolve(Buffer.concat(chunks));
    };

    stream.on("data", data);
    stream.on("error", reject);
    stream.on("end", end);
  });
}

export async function streamToString(
  stream: NodeJS.ReadableStream,
  encoding = "utf8",
) {
  const buffer = await streamToBuffer(stream);
  return buffer.toString(encoding);
}
