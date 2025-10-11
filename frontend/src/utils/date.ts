export function toDDMMYYYY(iso: string): string {
  if (!iso) return "";
  const [y,m,d] = iso.split("-");
  return `${d.padStart(2,"0")}/${m.padStart(2,"0")}/${y}`;
}
