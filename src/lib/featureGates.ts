/**
 * Per-user feature gates for connectors still in private testing.
 * Checked server-side (OAuth start routes) and client-side (Connections UI).
 */
const QUICKBOOKS_ALLOWLIST = ["bryce@choquer.agency"];

export function isQuickbooksAllowed(email: string | null | undefined): boolean {
  return !!email && QUICKBOOKS_ALLOWLIST.includes(email.toLowerCase());
}
