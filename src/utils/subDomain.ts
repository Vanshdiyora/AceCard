export function getBaseDomain() {
  const host = window.location.hostname;

  // ✅ localhost & *.localhost
  if (host === "localhost" || host.endsWith(".localhost")) {
    return "localhost";
  }

  // local test domain (*.test)
  if (host.endsWith(".test")) {
    return host.split(".").slice(-2).join(".");
  }

  // production
  if (host.endsWith("theacecard.co")) {
    return "theacecard.co";
  }

  return host;
}



export function isOnSubdomain() {
  return window.location.hostname !== getBaseDomain();
}

export function redirectToSubdomain(subdomain: string, path: string) {
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
