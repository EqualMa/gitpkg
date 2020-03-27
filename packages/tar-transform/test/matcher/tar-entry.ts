import { TarEntry, isTarEntry } from "../../src";
import { binaryStreamsAreSame } from "../util/compare-bin-stream";
import { Readable } from "stream";
function streamOfTarEntry(e: TarEntry): Readable {
  if (e.stream) {
    return e.stream;
  } else if (e.content instanceof Buffer || typeof e.content === "string") {
    const buf =
      typeof e.content === "string" ? Buffer.from(e.content) : e.content;
    return Readable.from([buf]);
  } else {
    throw new Error("both stream and content of TarEntry are invalid");
  }
}

expect.extend({
  async toBeTarEntry(e1, e2) {
    if (!isTarEntry(e1)) {
      return {
        message: () => `expect ${e1} to be a TarEntry`,
        pass: false,
      };
    }

    if (!isTarEntry(e2)) {
      return {
        message: () => `expect ${e2} to be a TarEntry`,
        pass: false,
      };
    }

    // path
    const headersPass = this.equals(e1.headers, e2.headers);
    if (!headersPass) {
      return {
        message: () =>
          `expect headers are same\n${this.utils.diff(e1.headers, e2.headers)}`,
        pass: false,
      };
    }

    // content
    let contentPass = true;
    if (e1.headers.type !== "directory") {
      if (e1.stream || e2.stream) {
        const s1 = streamOfTarEntry(e1);
        const s2 = streamOfTarEntry(e2);
        contentPass = await binaryStreamsAreSame([s1, s2]);
      } else {
        // both use content
        contentPass =
          typeof e1.content === "string" && typeof e2.content === "string"
            ? e1.content === e2.content
            : e1.content instanceof Buffer && e2.content instanceof Buffer
            ? this.equals(e1.content.toJSON(), e2.content.toJSON())
            : false;
      }
    }

    if (!contentPass) {
      return {
        message: () =>
          `expect contents are same\n${this.utils.diff(
            e1.content,
            e2.content,
          )}`,
        pass: false,
      };
    } else {
      return {
        message: () => `expect e1 not to be an TarEntry same as e2`,
        pass: true,
      };
    }
  },
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeTarEntry(tarEntry: TarEntry): Promise<R>;
    }
  }
}
