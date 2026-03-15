export interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

export const fetchCountryCodes = async (): Promise<CountryCode[]> => {
  const res = await fetch(
    "https://restcountries.com/v3.1/all?fields=name,idd,flag"
  );

  const data = await res.json();

  const countries: CountryCode[] = data
    .filter((c: any) => c.idd?.root && c.idd?.suffixes?.length)
    .map((c: any) => ({
      code: c.idd.root + c.idd.suffixes[0],
      country: c.name.common,
      flag: c.flag,
    }))
    .sort((a: CountryCode, b: CountryCode) =>
      a.country.localeCompare(b.country)
    );

  return countries;
};