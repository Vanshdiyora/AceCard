export function setCookie(name: string, value: string, days = 7) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

  const host = location.hostname;

  const isProd = host.endsWith("theacecard.co");
  const isTest = host.endsWith(".test");
  // const isVercel = host.endsWith("vercel.app");

  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `expires=${date.toUTCString()}`,
    "path=/",
  ];

  if (isProd) {
    parts.push("domain=.theacecard.co");
    parts.push("SameSite=None");
    parts.push("Secure");
  } else if (isTest) {
    parts.push("domain=.theacecard.test");
    parts.push("SameSite=Lax");
  }
  // 🚀 Vercel → no domain attribute (host-only cookie)

  document.cookie = parts.join("; ");
}

export function getCookie(name: string) {
  const match = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[2]) : null;
}

export function eraseCookie(name: string) {
  const base = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

  // 1️⃣ host-only cookie (localhost, preview, etc)
  document.cookie = base;

  // 2️⃣ production root + subdomains
  document.cookie = base + " domain=.theacecard.co;";

  // 3️⃣ test domains
  document.cookie = base + " domain=.theacecard.test;";
}
