type CallbackFunction = (key: string, ...args: any[]) => void | Promise<void>;

interface DebouncedFunction {
  (key: string, ...args: any[]): void;
  cancel: (key: string) => void;
}

export default (callback: CallbackFunction, delay: number): DebouncedFunction => {
  const timers: Record<string, ReturnType<typeof setTimeout>> = {};

  const debounced: DebouncedFunction = (key: string, ...args: any[]): void => {
    if (timers[key]) return;
    timers[key] = setTimeout(() => {
      callback(key, ...args);
      delete timers[key];
    }, delay);
  };

  debounced.cancel = (key: string): void => {
    if (!timers[key]) return;
    clearTimeout(timers[key]);
    delete timers[key];
  };

  return debounced;
};
