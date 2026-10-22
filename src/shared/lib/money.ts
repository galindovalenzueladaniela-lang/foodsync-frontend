export interface MonedaConfig {
  locale: string;
  currency: string;
}

const cache = new Map<string, Intl.NumberFormat>();

/** Formatea un monto con los decimales propios de la moneda del restaurante (MXN: $1,250.00). */
export function formatMoney(amount: number, { locale, currency }: MonedaConfig): string {
  const key = `${locale}|${currency}`;
  let fmt = cache.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, { style: 'currency', currency });
    cache.set(key, fmt);
  }
  return fmt.format(amount).replace(/ /g, ' ');
}
