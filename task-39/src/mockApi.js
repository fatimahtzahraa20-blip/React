// Simulated backend endpoints with configurable failure profiles, used to
// exercise the error-handling layer against realistic HTTP-ish failure modes.

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ApiError extends Error {
  constructor(message, { status, code, retryable }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

const ENDPOINT_PROFILES = {
  "/api/users": { failRate: 0.35, kinds: ["network", "500", "429"] },
  "/api/orders": { failRate: 0.5, kinds: ["timeout", "500"] },
  "/api/profile": { failRate: 0.2, kinds: ["404"] },
  "/api/settings": { failRate: 0.15, kinds: ["network"] },
};

const DATA = {
  "/api/users": [
    { id: 1, name: "Amina Yusuf", role: "Admin" },
    { id: 2, name: "Ben Carter", role: "Editor" },
    { id: 3, name: "Priya Nair", role: "Viewer" },
  ],
  "/api/orders": [
    { id: "ORD-1042", total: "$129.00", status: "Shipped" },
    { id: "ORD-1043", total: "$58.50", status: "Processing" },
  ],
  "/api/profile": { name: "You", plan: "Business" },
  "/api/settings": { theme: "dark", notifications: true },
};

function makeError(kind) {
  switch (kind) {
    case "network":
      return new ApiError("Network request failed", { status: 0, code: "NETWORK_ERROR", retryable: true });
    case "timeout":
      return new ApiError("Request timed out", { status: 0, code: "TIMEOUT", retryable: true });
    case "500":
      return new ApiError("Internal server error", { status: 500, code: "SERVER_ERROR", retryable: true });
    case "429":
      return new ApiError("Too many requests", { status: 429, code: "RATE_LIMITED", retryable: true });
    case "404":
      return new ApiError("Resource not found", { status: 404, code: "NOT_FOUND", retryable: false });
    default:
      return new ApiError("Unknown error", { status: 500, code: "UNKNOWN", retryable: true });
  }
}

/** Simulated fetch. Resolves with data or rejects with a classified ApiError. */
export async function mockFetch(endpoint, { latency = [300, 900] } = {}) {
  const [min, max] = latency;
  await wait(min + Math.random() * (max - min));

  const profile = ENDPOINT_PROFILES[endpoint] || { failRate: 0.2, kinds: ["network"] };
  if (Math.random() < profile.failRate) {
    const kind = profile.kinds[Math.floor(Math.random() * profile.kinds.length)];
    throw makeError(kind);
  }
  return DATA[endpoint];
}
