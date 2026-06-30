const PASSWORD = "itxc";

export function checkPassword(input: string): boolean {
  return input.trim().toLowerCase() === PASSWORD;
}
