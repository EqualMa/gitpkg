type Overwrite<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U
    ? U[K]
    : K extends keyof T
    ? T[K]
    : never;
};

export type PkgOptionsParserPlugin<T, U> = (
  url: string,
  query: import("@now/node").NowRequestQuery,
  previousOptions: T,
) => U;

export class PkgOptionsParser<T = {}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private plugins: PkgOptionsParserPlugin<any, any>[] = [];

  public withPlugin<U>(
    plugin: PkgOptionsParserPlugin<T, U>,
  ): PkgOptionsParser<Overwrite<T, U>> {
    const p = new PkgOptionsParser<Overwrite<T, U>>();
    p.plugins.push(...this.plugins, plugin);
    return p;
  }

  public parse(
    requestUrl: string,
    query: import("@now/node").NowRequestQuery,
  ): T {
    return this.plugins.reduce<unknown>((options, plugin) => {
      return {
        ...(options as object),
        ...plugin(requestUrl, query, options),
      };
    }, {}) as T;
  }
}
