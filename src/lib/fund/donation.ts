export const COST_PER_CLICK_CENTS = 500;
export const MIN_GIFT_CENTS = 500;
export const MAX_GIFT_CENTS = 100_000_00;

export const PRESET_GIFT_CENTS = [2500, 5000, 10000, 25000, 50000] as const;
export const DEFAULT_GIFT_CENTS = 10000;
export const IMPACT_EXAMPLE_CENTS = [2500, 5000, 10000, 25000, 50000, 100000] as const;

export type DonationFrequency = "once" | "monthly";
export type PresetGiftCents = (typeof PRESET_GIFT_CENTS)[number];

/** Whole-dollar presets plus an explicit custom amount. Amounts stay in integer cents. */
export type GiftSelection =
  | { source: "preset"; amountCents: PresetGiftCents }
  | { source: "custom"; amountCents: number | null };

export function estimatedClicks(amountCents: number): number {
  if (!Number.isInteger(amountCents) || amountCents < 0) return 0;
  return Math.floor(amountCents / COST_PER_CLICK_CENTS);
}

export function isValidGiftCents(amountCents: number): boolean {
  return Number.isInteger(amountCents) && amountCents >= MIN_GIFT_CENTS && amountCents <= MAX_GIFT_CENTS;
}

/**
 * Parse a dollar entry into integer cents without floating-point math.
 * Accepts "25", "25.50", "$1,000", and a trailing decimal while typing.
 */
export function parseGiftCents(raw: string): number | null {
  const cleaned = raw.trim().replace(/[$,\s]/g, "");
  if (!cleaned || cleaned === ".") return null;
  const match = /^(\d{1,7})(?:\.(\d{0,2}))?$/.exec(cleaned);
  if (!match) return null;
  const dollars = Number(match[1]);
  const fraction = match[2] ?? "";
  if (!Number.isInteger(dollars)) return null;
  const centsPart = fraction.length === 0 ? 0 : fraction.length === 1 ? Number(fraction) * 10 : Number(fraction);
  const cents = dollars * 100 + centsPart;
  if (!Number.isSafeInteger(cents)) return null;
  return cents;
}

export function formatGiftAmount(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  const dollars = Math.floor(absolute / 100);
  const remainder = absolute % 100;
  const dollarText = new Intl.NumberFormat("en-US").format(dollars);
  if (remainder === 0) return `${sign}$${dollarText}`;
  return `${sign}$${dollarText}.${String(remainder).padStart(2, "0")}`;
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function impactSummary(amountCents: number, frequency: DonationFrequency): string {
  const amount = formatGiftAmount(amountCents);
  const clicks = formatCount(estimatedClicks(amountCents));
  const noun = estimatedClicks(amountCents) === 1 ? "visitor" : "visitors";
  if (frequency === "monthly") {
    return `Your ${amount} monthly gift could help bring approximately ${clicks} ${noun} to local Bible Group pages each month.`;
  }
  return `Your ${amount} gift could help bring approximately ${clicks} ${noun} to local Bible Group pages.`;
}

export function giveButtonLabel(amountCents: number, frequency: DonationFrequency): string {
  const amount = formatGiftAmount(amountCents);
  return frequency === "monthly" ? `Give ${amount} Monthly` : `Give ${amount}`;
}

export const REACH_DISCLAIMER =
  "Estimated reach is based on a $5 advertising cost per click. Actual campaign costs and results will vary.";
