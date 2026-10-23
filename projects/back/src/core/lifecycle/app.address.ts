export type Address = { host: string; port: number };
export function listeningAddress(address: Address): string {
  const all = ["0.0.0.0", "::", ""].includes(address.host);
  const host = all ? "localhost" : address.host;
  const ipv6 = host.includes(":");
  return `http://${ipv6 ? `[${host}]` : host}:${address.port}`;
}
