"use client";

import { FormEvent, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isWebsitePhone } from "@/lib/leads/website";
import { LOCATION_TYPES } from "@/lib/groups/types";

const fieldClass =
  "mt-2 h-[52px] w-full rounded-2xl border border-[#e6e6e6] bg-[#f7f7f7] px-4 text-sm outline-none focus:border-[var(--sending-blue)] focus:bg-white";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function StartGroupForm() {
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const lock = useRef(false);

  async function uploadPhoto(file: File) {
    if (!isSupabaseConfigured()) return null;
    if (file.size > 2_000_000) throw new Error("Use a photo under 2 MB.");
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    if (!["jpg", "jpeg", "png", "webp"].includes(ext)) throw new Error("Use a JPG, PNG, or WebP photo.");
    const path = `applications/${crypto.randomUUID()}.${ext}`;
    const supabase = createClient();
    const { error: uploadError } = await supabase.storage.from("rtp-photos").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) return null;
    return supabase.storage.from("rtp-photos").getPublicUrl(path).data.publicUrl;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const form = new FormData(event.currentTarget);
    const mobile = String(form.get("mobile") ?? "");
    if (!isWebsitePhone(mobile)) {
      setError("Enter a valid mobile number, including the country code outside the US.");
      return;
    }
    lock.current = true;
    setSubmitting(true);
    setError("");
    try {
      const photo = form.get("photo");
      let leaderPhotoUrl: string | null = null;
      if (photo instanceof File && photo.size > 0) {
        leaderPhotoUrl = await uploadPhoto(photo);
      }
      const response = await fetch("/api/groups/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          leaderName: form.get("name"),
          email: form.get("email"),
          mobile,
          city: form.get("city"),
          state: form.get("state"),
          country: form.get("country"),
          locationType: form.get("locationType"),
          meetingLocation: form.get("meetingLocation"),
          meetingDay: form.get("meetingDay"),
          meetingTime: form.get("meetingTime"),
          description: form.get("description"),
          leaderPhotoUrl,
        }),
      });
      const body = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !body.ok) {
        setError(body.error || "Something went wrong. Please try again.");
        lock.current = false;
        setSubmitting(false);
        return;
      }
      setSaved(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
      lock.current = false;
      setSubmitting(false);
    }
  }

  if (saved) {
    return (
      <p role="status" className="rounded-[28px] bg-white p-8 text-lg font-medium shadow-sm">
        Thank you. Your group is pending approval. It will appear on the map after it is reviewed.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-[28px] bg-white p-6 shadow-sm sm:p-8" noValidate>
      <Field label="Name" name="name" required autoComplete="name" />
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      <Field label="Mobile number" name="mobile" type="tel" required autoComplete="tel" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="City" name="city" required />
        <Field label="State" name="state" />
        <Field label="Country" name="country" required placeholder="United States" />
      </div>
      <label className="block text-sm font-medium">
        Location type
        <select name="locationType" required className={fieldClass} defaultValue="public_venue">
          {LOCATION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type === "public_venue" ? "Public place" : type === "home" ? "Home" : "Other"}
            </option>
          ))}
        </select>
      </label>
      <Field label="Meeting location" name="meetingLocation" required placeholder="Coffee shop, workplace, or home" />
      <p className="-mt-2 text-sm text-[#666]">For a home group, the public map shows the city area. The street address stays private until you confirm someone is coming.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Meeting day
          <select name="meetingDay" required className={fieldClass} defaultValue="Sunday">
            {DAYS.map((day) => (
              <option key={day}>{day}</option>
            ))}
          </select>
        </label>
        <Field label="Meeting time" name="meetingTime" required placeholder="9:00 AM" />
      </div>
      <label className="block text-sm font-medium">
        Group description
        <textarea name="description" rows={4} className="mt-2 w-full rounded-2xl border border-[#e6e6e6] bg-[#f7f7f7] px-4 py-3 text-sm outline-none focus:border-[var(--sending-blue)] focus:bg-white" placeholder="Who the group is for, and what you read together." />
      </label>
      <label className="block text-sm font-medium">
        Leader photo, optional
        <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm" />
      </label>
      {error ? <p role="alert" className="text-sm text-[#c2410c]">{error}</p> : null}
      <button type="submit" disabled={submitting} className="inline-flex h-[52px] w-full items-center justify-center rounded-full bg-[var(--sending-blue)] font-semibold text-white disabled:opacity-70">
        {submitting ? "Sending…" : "Submit group"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input name={name} type={type} required={required} placeholder={placeholder} autoComplete={autoComplete} className={fieldClass} />
    </label>
  );
}
