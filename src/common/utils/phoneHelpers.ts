export const combinePhoneNumber = (
  code: string,
  number: string
): string => {
  const cleanNumber = number?.replace(/[^\d]/g, "") || "";
  return `${code}${cleanNumber}`;
};

export const splitPhoneNumber = (
  fullNumber: string,
  countries: { code: string }[]
) => {
  if (!fullNumber) {
    return { code: "+91", number: "" };
  }

  const sorted = [...countries].sort(
    (a, b) => b.code.length - a.code.length
  );

  const match = sorted.find((c) =>
    fullNumber.startsWith(c.code)
  );

  if (match) {
    return {
      code: match.code,
      number: fullNumber.slice(match.code.length),
    };
  }

  return {
    code: "+91",
    number: fullNumber.replace(/^\+\d+/, ""),
  };
};