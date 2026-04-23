export function encodeTeam(ids: (number | null)[]): string {
  return ids.map((id) => (id ? String(id).padStart(3, '0') : '000')).join('-');
}

export function decodeTeam(code: string): number[] {
  return code.split('-').map(Number).filter((n) => n > 0);
}
