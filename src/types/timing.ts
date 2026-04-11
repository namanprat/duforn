export type DebouncedFunction<TArgs extends unknown[]> = ((
  ...args: TArgs
) => void) & {
  cancel: () => void;
};
