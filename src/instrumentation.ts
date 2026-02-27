export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEnv } = await import("@/lib/env");
    // Only validate in production or if explicitly requested
    // This prevents build failures in environments like Amplify where
    // some secrets might be missing during the build phase
    if (process.env.NODE_ENV === "production" && !process.env.SKIP_ENV_VALIDATION) {
      try {
        validateEnv();
      } catch (e) {
        console.warn("Env validation failed:", e);
      }
    }
  }
}
