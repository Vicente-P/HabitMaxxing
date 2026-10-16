export type HabitRequestError = { status: number; code: string; message: string };

export const habitInternalError: HabitRequestError = {
  status: 500, code: "INTERNAL_ERROR", message: "Error interno del servidor",
};
export const habitValidationError: HabitRequestError = {
  status: 400, code: "VALIDATION_ERROR", message: "Datos de entrada inválidos",
};
const bodyLimit = 8192;
const tooLarge: HabitRequestError = {
  status: 413, code: "PAYLOAD_TOO_LARGE", message: "La solicitud es demasiado grande",
};

function configuredOrigin(value: string | undefined): string | null {
  if (!value || value !== value.trim() || /[\\\s*]/.test(value)) return null;
  // Check the original path too: URL normalization can hide dot segments.
  if (!/^https?:\/\/[^/?#]+\/?$/.test(value)) return null;
  try {
    const url = new URL(value);
    if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) return null;
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function checkHabitRequest(request: Request, config: string | undefined): HabitRequestError | null {
  const expected = configuredOrigin(config);
  if (!expected) return habitInternalError;
  const origin = request.headers.get("origin");
  // A serialized browser origin is one canonical origin, not a URL or a list.
  if (!origin || origin !== expected) {
    return { status: 403, code: "FORBIDDEN", message: "Solicitud no permitida" };
  }
  const contentType = request.headers.get("content-type") ?? "";
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?\s*$/i.test(contentType)) {
    return { status: 415, code: "UNSUPPORTED_MEDIA_TYPE", message: "Se requiere contenido JSON" };
  }
  return null;
}

export async function readHabitBody(request: Request): Promise<
  { data: Record<string, unknown> } | { error: HabitRequestError }
> {
  const length = request.headers.get("content-length");
  if (length && /^\d+$/.test(length) && Number(length) > bodyLimit) {
    await request.body?.cancel().catch(() => undefined);
    return { error: tooLarge };
  }
  if (!request.body) return { error: habitValidationError };
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > bodyLimit) {
        await reader.cancel().catch(() => undefined);
        return { error: tooLarge };
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const body: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (typeof body !== "object" || body === null || Array.isArray(body)) return { error: habitValidationError };
    return { data: body as Record<string, unknown> };
  } catch {
    return { error: habitValidationError };
  } finally {
    reader.releaseLock();
  }
}
