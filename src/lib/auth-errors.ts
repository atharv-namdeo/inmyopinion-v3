/**
 * Maps raw Firebase auth errors to human readable messages and
 * detects missing or invalid Firebase configuration.
 */

export type AuthErrorKind =
  | "config"
  | "rules"
  | "duplicate"
  | "credentials"
  | "network"
  | "generic";

export function classifyAuthError(error: unknown): AuthErrorKind {
  if (typeof window !== "undefined") {
    console.error("Auth error details:", error);
  }
  const msg =
    (typeof error === "object" && error && "message" in error
      ? String((error as any).message)
      : String(error)) || "";
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as any).code)
      : "";
  const hay = `${code} ${msg}`.toLowerCase();

  if (
    hay.includes("api-key-not-valid") ||
    hay.includes("api key not valid") ||
    hay.includes("invalid-api-key") ||
    hay.includes("configuration-not-found") ||
    hay.includes("auth/configuration-not-found") ||
    hay.includes("operation-not-allowed") ||
    hay.includes("project-not-found")
  ) {
    return "config";
  }
  if (
    hay.includes("permission-denied") ||
    hay.includes("insufficient permissions") ||
    hay.includes("missing or insufficient")
  ) {
    return "rules";
  }
  if (hay.includes("email-already-in-use") || hay.includes("username already taken")) {
    return "duplicate";
  }
  if (
    hay.includes("wrong-password") ||
    hay.includes("user-not-found") ||
    hay.includes("invalid-credential") ||
    hay.includes("invalid-login")
  ) {
    return "credentials";
  }
  if (hay.includes("network-request-failed") || hay.includes("network")) {
    return "network";
  }
  return "generic";
}

const CONFIG_MESSAGE =
  "Firebase is not configured properly. The API key or project credentials in environment settings are invalid.";

const RULES_MESSAGE =
  "The database is locked. Publish the security rules in the Firebase console (Firestore > Rules > Publish), then try again.";

export function registerErrorMessage(error: unknown): string {
  switch (classifyAuthError(error)) {
    case "config":
      return CONFIG_MESSAGE;
    case "rules":
      return RULES_MESSAGE;
    case "duplicate":
      return "That username is already taken. Please choose another one.";
    case "network":
      return "Network error. Check your connection and try again.";
    default:
      return "Something went wrong creating your account. Please try again.";
  }
}

export function loginErrorMessage(error: unknown): string {
  switch (classifyAuthError(error)) {
    case "config":
      return CONFIG_MESSAGE;
    case "rules":
      return RULES_MESSAGE;
    case "credentials":
    case "generic":
      return "No account with those details, or the password is wrong. Try registering.";
    case "network":
      return "Network error. Check your connection and try again.";
    default:
      return "Could not log you in. Please try again.";
  }
}
