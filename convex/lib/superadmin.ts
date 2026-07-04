/**
 * Super-admin allowlist — pure, dependency-free so both the membership guard
 * (currentUser) and the admin console (admin) can use it without a circular
 * import. Override with SUPERADMIN_EMAILS (comma-separated) on the deployment.
 */
const DEFAULT_SUPERADMINS = [
  "bryce@choquer.agency",
  "hello@choquer.agency",
  "bryce@choquercreative.com",
];

export function superAdminEmails(): string[] {
  const env = process.env.SUPERADMIN_EMAILS;
  const list = env ? env.split(",").map((e) => e.trim()) : DEFAULT_SUPERADMINS;
  return list.map((e) => e.toLowerCase()).filter(Boolean);
}

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return superAdminEmails().includes(email.toLowerCase());
}
