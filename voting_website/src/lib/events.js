const events = {};

export function on(event, callback) {
  if (!events[event]) events[event] = [];
  events[event].push(callback);
  return () => {
    events[event] = events[event].filter((cb) => cb !== callback);
  };
}

export function emit(event, data) {
  if (!events[event]) return;
  events[event].forEach((cb) => cb(data));
}