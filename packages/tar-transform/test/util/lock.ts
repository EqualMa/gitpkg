export class Locker {
  previousPromise: Promise<void> | undefined = undefined;

  async lock() {
    const previousPromise = this.previousPromise;
    let resolve!: () => void;

    const promise = new Promise<void>(r => {
      resolve = r;
    });
    this.previousPromise = promise;

    if (previousPromise) await previousPromise;

    return resolve;
  }
}
