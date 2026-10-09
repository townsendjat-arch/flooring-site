export class EstimateError extends Error {
  constructor(code) {
    super(code);
    this.name = "EstimateError";
    this.code = code;
  }
}

export function isConfigured(endpoint) {
  // A public form ID is expected, never a legacy email-address endpoint.
  return typeof endpoint === "string" && /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint);
}

export async function sendEstimate(payload, config, fetchImpl = globalThis.fetch) {
  if (!isConfigured(config.endpoint)) throw new EstimateError("unconfigured");
  const controller = new AbortController();
  const timeoutMs = Number.isFinite(config.timeoutMs) && config.timeoutMs > 0 ? config.timeoutMs : 15000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(config.endpoint, {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "omit",
      redirect: "error",
      referrerPolicy: "strict-origin-when-cross-origin",
      signal: controller.signal,
    });
    // A resolved fetch alone is not success (e.g. 422, 429, or a server error).
    if (!response.ok) {
      throw new EstimateError(response.status >= 500 ? "unconfirmed" : response.status === 429 ? "rate-limit" : "rejected");
    }
    // Formspree's successful JSON response must explicitly confirm acceptance.
    const result = await response.json();
    if (result?.ok !== true || (Array.isArray(result.errors) && result.errors.length)) {
      throw new EstimateError("unconfirmed");
    }
    return result;
  } catch (error) {
    if (error instanceof EstimateError) throw error;
    if (controller.signal.aborted) throw new EstimateError("timeout");
    throw new EstimateError("network");
  } finally {
    clearTimeout(timeout);
  }
}
