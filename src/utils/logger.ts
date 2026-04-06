/**
 * Safe stringify to handle potential circular structures or DOM elements
 */
export const safeStringify = (obj: any) => {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) return '[Circular]';
      if (value instanceof HTMLElement) return `[HTMLElement: ${value.tagName}]`;
      // Handle React Fiber nodes which often cause circularity
      if (key.startsWith('__reactFiber') || key.startsWith('__reactProps')) return '[ReactInternal]';
      cache.add(value);
    }
    return value;
  });
};

/**
 * Safe logging that prevents circular structure errors
 */
export const safeLog = {
  log: (...args: any[]) => {
    const safeArgs = args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.parse(safeStringify(arg));
        } catch (e) {
          return '[Unserializable Object]';
        }
      }
      return arg;
    });
    console.log(...safeArgs);
  },
  error: (...args: any[]) => {
    const safeArgs = args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.parse(safeStringify(arg));
        } catch (e) {
          return '[Unserializable Object]';
        }
      }
      return arg;
    });
    console.error(...safeArgs);
  },
  warn: (...args: any[]) => {
    const safeArgs = args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.parse(safeStringify(arg));
        } catch (e) {
          return '[Unserializable Object]';
        }
      }
      return arg;
    });
    console.warn(...safeArgs);
  }
};
