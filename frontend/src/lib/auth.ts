const PASSWORD = "itxc-2026";

export function checkPassword(input: string): boolean {
  return input.trim().toLowerCase() === PASSWORD;
}
