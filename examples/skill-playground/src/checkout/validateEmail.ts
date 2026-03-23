export function validateEmail(email: string): boolean {
  return email.includes("@") && email.length > 3;
}
