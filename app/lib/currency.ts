export const EUR_PER_BGN = 1 / 1.95583;

export function bgnToEur(value: number) {
  return Number((value * EUR_PER_BGN).toFixed(2));
}

export function formatMoney(
  value: number,
  language: "bg" | "en",
  options: { showBgn?: boolean } = {},
) {
  const eur = new Intl.NumberFormat(language === "bg" ? "bg-BG" : "en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  if (!options.showBgn) return eur;
  const bgn = new Intl.NumberFormat(language === "bg" ? "bg-BG" : "en-IE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / EUR_PER_BGN);
  return `${eur} (${bgn} BGN)`;
}
