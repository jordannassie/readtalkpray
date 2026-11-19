"use client";

import { CreditCard, Lock } from "lucide-react";
import { useId, useState } from "react";
import {
  DEFAULT_GIFT_CENTS,
  MAX_GIFT_CENTS,
  MIN_GIFT_CENTS,
  PRESET_GIFT_CENTS,
  REACH_DISCLAIMER,
  estimatedClicks,
  formatCount,
  formatGiftAmount,
  giveButtonLabel,
  impactSummary,
  isValidGiftCents,
  parseGiftCents,
  type DonationFrequency,
} from "@/lib/fund/donation";
import { STRIPE_INTEGRATION } from "@/lib/fund/stripe-contract";

const fieldClass =
  "mt-2 h-[52px] w-full rounded-2xl border border-[#e6ebf2] bg-[#f7f9fc] px-4 text-base text-[#142033] outline-none placeholder:text-[#8aa0b8] disabled:cursor-not-allowed disabled:text-[#8aa0b8]";

export function GivingForm() {
  const [frequency, setFrequency] = useState<DonationFrequency>("once");
  const [presetCents, setPresetCents] = useState<number | "custom">(DEFAULT_GIFT_CENTS);
  const [customInput, setCustomInput] = useState("");
  const customId = useId();
  const nameId = useId();
  const emailId = useId();
  const customCents = parseGiftCents(customInput);
  const amountCents = presetCents === "custom" ? customCents : presetCents;
  const valid = amountCents != null && isValidGiftCents(amountCents);
  const clicks = valid ? estimatedClicks(amountCents) : 0;
  const period = frequency === "monthly" ? " each month" : "";

  return (
    <form
      id="give"
      aria-label="Fund local Bible groups"
      data-stripe-ready={STRIPE_INTEGRATION.ready ? "yes" : "no"}
      className="scroll-mt-28 rounded-3xl border border-[#e6ebf2] bg-white p-5 shadow-sm sm:p-7"
      onSubmit={(event) => event.preventDefault()}
      noValidate
    >
      <h2 className="text-2xl font-semibold tracking-tight text-[#142033]">Fund Local Bible Groups</h2>
      <p className="mt-2 text-base leading-relaxed text-[#52627a]">Give to help people discover Bible-reading communities.</p>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-[#142033]">Frequency</legend>
        <div className="mt-2 grid grid-cols-2 rounded-full bg-[#f2f4f7] p-1" role="radiogroup" aria-label="Giving frequency">
          <FrequencyButton selected={frequency === "once"} onSelect={() => setFrequency("once")}>
            Give Once
          </FrequencyButton>
          <FrequencyButton selected={frequency === "monthly"} onSelect={() => setFrequency("monthly")}>
            Give Monthly
          </FrequencyButton>
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-[#142033]">Amount</legend>
        <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-label="Gift amount">
          {PRESET_GIFT_CENTS.map((cents) => (
            <button
              key={cents}
              type="button"
              aria-pressed={presetCents === cents}
              onClick={() => setPresetCents(cents)}
              className={amountClass(presetCents === cents)}
            >
              {formatGiftAmount(cents)}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={presetCents === "custom"}
            onClick={() => setPresetCents("custom")}
            className={amountClass(presetCents === "custom")}
          >
            Other
          </button>
        </div>
        {presetCents === "custom" ? (
          <label className="mt-3 block text-sm font-medium text-[#142033]" htmlFor={customId}>
            Other amount
            <span className="relative mt-2 block">
              <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-base text-[#52627a]">$</span>
              <input
                id={customId}
                inputMode="decimal"
                autoComplete="off"
                value={customInput}
                placeholder="25.00"
                onChange={(event) => setCustomInput(event.target.value)}
                className={`${fieldClass} bg-white pl-8`}
              />
            </span>
          </label>
        ) : null}
        {presetCents === "custom" && customInput.trim() && !valid ? (
          <p className="mt-2 text-sm text-[#9a3412]">{customAmountMessage(customCents)}</p>
        ) : null}
      </fieldset>

      <div className="mt-6 rounded-2xl bg-[#f4f8ff] px-4 py-4" aria-live="polite">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#1976F3]">ESTIMATED ADVERTISING CLICKS</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-[#142033]" data-testid="impact-clicks">
          {valid ? `Approximately ${formatCount(clicks)} ${clicks === 1 ? "click" : "clicks"}${period}` : "Enter at least $5"}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[#334155]">
          {valid
            ? impactSummary(amountCents, frequency)
            : "Estimated clicks update from the amount you select. The minimum gift for future checkout is $5."}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[#52627a]">{REACH_DISCLAIMER}</p>
      </div>

      <fieldset className="mt-6" disabled>
        <legend className="text-sm font-semibold text-[#142033]">Your information</legend>
        <p className="mt-1 text-sm leading-relaxed text-[#52627a]">These fields stay inactive until secure checkout is connected. This preview does not save a name or email.</p>
        <label className="mt-3 block text-sm font-medium text-[#142033]" htmlFor={nameId}>
          Full name
          <input id={nameId} disabled autoComplete="off" placeholder="Not collected yet" className={fieldClass} />
        </label>
        <label className="mt-3 block text-sm font-medium text-[#142033]" htmlFor={emailId}>
          Email address
          <input id={emailId} type="email" disabled autoComplete="off" placeholder="Not collected yet" className={fieldClass} />
        </label>
      </fieldset>

      <section className="mt-6 rounded-2xl border border-dashed border-[#c5d9fb] bg-[#f8fbff] p-4" aria-label="Payment preview">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#142033]">
          <Lock size={16} aria-hidden className="text-[#1976F3]" />
          Secure checkout
          <span className="ml-auto rounded-full bg-[#e7f0ff] px-2.5 py-1 text-xs font-semibold text-[#1976F3]">Coming soon</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[#52627a]">
          Credit and debit card payment will open in Stripe Checkout. This preview has no card number, expiration, or security code field.
        </p>
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#e6ebf2] bg-white px-3 py-3 text-sm text-[#8aa0b8]">
          <CreditCard size={18} aria-hidden />
          Card payment coming soon
        </div>
      </section>

      <button
        type="button"
        disabled
        aria-disabled="true"
        className="mt-6 inline-flex min-h-14 w-full cursor-not-allowed flex-wrap items-center justify-center gap-2 rounded-full bg-[#16A34A] px-5 py-3 text-base font-semibold text-white opacity-70"
      >
        {valid ? giveButtonLabel(amountCents, frequency) : frequency === "monthly" ? "Give Monthly" : "Give"}
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">Coming soon</span>
      </button>
      <p className="mt-3 text-center text-sm font-medium text-[#142033]" role="status">
        Payment setup pending. Checkout is not connected, and this form cannot submit a gift.
      </p>
    </form>
  );
}

function customAmountMessage(cents: number | null) {
  if (cents == null) return "Enter a dollar amount, such as 25 or 25.50.";
  if (cents < MIN_GIFT_CENTS) return "Enter at least $5.00.";
  if (cents > MAX_GIFT_CENTS) return "Enter $100,000 or less.";
  return "Enter at least $5.00.";
}

function FrequencyButton({ selected, onSelect, children }: { selected: boolean; onSelect: () => void; children: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`inline-flex h-11 items-center justify-center rounded-full px-3 text-sm font-semibold ${selected ? "bg-[#1976F3] text-white" : "text-[#52627a]"}`}
    >
      {children}
    </button>
  );
}

function amountClass(selected: boolean) {
  return `inline-flex h-12 items-center justify-center rounded-2xl border text-sm font-semibold ${selected ? "border-[#1976F3] bg-[#1976F3] text-white" : "border-[#e6ebf2] bg-white text-[#142033]"}`;
}
