declare module "tar-stream" {
  interface Headers {
    pax?: {
      comment: string;
      path: string;
    };
  }
}

export type TarEntryHeaders = Readonly<import("tar-stream").Headers>;

export function headersWithNewName(headers: TarEntryHeaders, newName: string) {
  const newHeader = { ...headers, name: newName };

  if (newHeader.pax) {
    newHeader.pax.path = newName;
  }
  return newHeader;
}
