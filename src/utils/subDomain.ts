export function getBaseDomain() {
  const host = window.location.hostname;

  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith("vercel.app")
  ) {
    return host; // 🚀 no base extraction for vercel
  }

  if (host.endsWith(".test")) {
    return host.split(".").slice(-2).join(".");
  }

  if (host.endsWith("theacecard.co")) {
    return "theacecard.co";
  }

  return host;
}



export function isOnSubdomain() {
  const host = window.location.hostname;

  if (host.endsWith("vercel.app")) return false; // 🚀 force disable

  return host !== getBaseDomain();
}


export function redirectToSubdomain(subdomain: string, path: string) {
  const host = window.location.hostname;

  if (host.endsWith("vercel.app")) return; // 🚀 no redirect on preview

  const { protocol, port } = window.location;
  const base = getBaseDomain();
  const url = `${protocol}//${subdomain}.${base}${port ? `:${port}` : ""}${path}`;

  if (window.location.href !== url) {
    window.location.href = url;
  }
}


export function getSubdomainFromHost(): string | null {
  const host = window.location.hostname;
  const base = getBaseDomain();

  if (host === base) return null;

  return host.replace(`.${base}`, "");
}
