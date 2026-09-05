export async function getFunctionErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "context" in error) {
    const context = (error as { context?: Response }).context;
    if (context instanceof Response) {
      try {
        const body = await context.clone().json() as { error?: string; message?: string };
        if (body.error) return body.error;
        if (body.message) return body.message;
      } catch {
        // Fall back to the SDK message when the response is not JSON.
      }
    }
  }
  return error instanceof Error ? error.message : "The account service request failed.";
}
