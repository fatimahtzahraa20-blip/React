function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Simulated server submit endpoint. Fails ~20% of the time to exercise retry paths. */
export async function submitToServer(payload) {
  await wait(600 + Math.random() * 700);
  if (Math.random() < 0.2) {
    throw new Error("Server rejected submission — please retry.");
  }
  return { ok: true, receivedAt: Date.now() };
}
