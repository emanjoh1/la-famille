export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: "guest" | "host" | "admin";
    };
  }
}
