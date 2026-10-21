export interface MonedaConfig {
  locale: string;
  currency: string;
}

const cache = new Map<string, Intl.NumberFormat>();

/** Formatea un monto entero (sin decimales) según la moneda configurada por el restaurante. */
export function formatMoney(amount: number, { locale, currency }: MonedaConfig): string {
  const key = `${locale}|${currency}`;
  let fmt = cache.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0, minimumFractionDigits: 0 });
    cache.set(key, fmt);
  }
  return fmt.format(Math.round(amount)).replace(/ /g, ' ');
}
