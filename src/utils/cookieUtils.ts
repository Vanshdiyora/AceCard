export function setCookie(name: string, value: string, days = 7) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

  const host = location.hostname;
  const isProd = host.endsWith("theacecard.co");
  const isLocal = host === "localhost" || host.endsWith(".localhost");

  const parts = [
    `${name}=${value}`,
    `expires=${date.toUTCString()}`,
    "path=/",
  ];

  if (isProd) {
    parts.push("domain=.theacecard.co");
    parts.push("SameSite=None");
    parts.push("Secure"); // required
  } else if (isLocal) {
    parts.push("SameSite=Lax"); // allow non-secure
  }

  document.cookie = parts.join("; ");
}


export function getCookie(name: string) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export function eraseCookie(name: string) {
  const host = location.hostname;
  const isProd = host.endsWith("theacecard.co");

  const base = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;

  document.cookie = isProd
    ? base + " domain=.theacecard.co"
    : base;
}
