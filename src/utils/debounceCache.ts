export default function debounceCache(callback, delay) {
  let timers = {};

  return (key: string, ...args: any[]): void => {
    if (timers[key]) clearTimeout(timers[key]);

    timers[key] = setTimeout(() => {
      callback(key, ...args);
    }, delay);
  };
}
