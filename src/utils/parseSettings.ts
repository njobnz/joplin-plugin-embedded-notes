export default <T>(name: string, value: T) => {
  // The tag setting is only supported as a tag-specific filter, but it can be overridden with a custom filter
  if (name === 'tag' && typeof value === 'string' && value && !value.includes(':')) return `tag:"${value}"` as T;
  return value as T;
};
