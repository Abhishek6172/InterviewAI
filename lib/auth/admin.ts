export const ADMIN_EMAIL = "abhishekkumardaspattanayak444@gmail.com";

export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
