// src/config/telemetry.js
// Temporary no-op telemetry initializer (until stable SDKs support Node 22)

console.log('⚙️  Telemetry placeholder active — real tracing disabled for now');

// Dummy tracer shim so imports don’t break later
export const telemetry = {
  startSpan: (name) => ({
    name,
    addEvent: () => {},
    end: () => {},
  }),
};
