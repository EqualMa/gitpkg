export function drain(writable: import("stream").Writable) {
  if (writable.destroyed) {
    return Promise.reject(new Error("premature close"));
  }

  return new Promise((resolve, reject) => {
    const done = () => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      writable.removeListener("close", onClose);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      writable.removeListener("drain", onDrain);
    };
    const onClose = () => {
      done();
      reject(new Error("premature close"));
    };
    const onDrain = () => {
      done();
      resolve();
    };
    writable.on("close", onClose);
    writable.on("drain", onDrain);
  });
}
