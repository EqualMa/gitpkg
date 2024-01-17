declare global {
  interface NodeRequire {
    (path: `${string}.svg`): {
      default: React.ComponentType<React.ComponentProps<"svg">>;
    };
  }
}

export {};
