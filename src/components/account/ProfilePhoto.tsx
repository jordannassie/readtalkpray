"use client";

import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export function ProfilePhoto({
  userId,
  name,
  email,
  photoUrl,
  googlePhotoUrl,
  fullName,
  phone,
  size = 140,
  onSaved,
}: {
  userId: string;
  name: string | null;
  email: string;
  photoUrl: string | null;
  googlePhotoUrl: string | null;
  fullName: string | null;
  phone: string | null;
  size?: number;
  onSaved?: (url: string) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const saved = photoUrl || googlePhotoUrl;
  const [src, setSrc] = useState(saved);
  const [message, setMessage] = useState("");
  const initial = (name || email || "You").slice(0, 1).toUpperCase();

  useEffect(() => {
    setSrc(photoUrl || googlePhotoUrl);
  }, [photoUrl, googlePhotoUrl]);

  async function choose(file: File | null) {
    if (!file) return;
    const previous = src;
    if (!ACCEPT.includes(file.type)) {
      setMessage("Use a JPG, PNG, or WebP photo.");
      return;
    }
    if (file.size > 2_000_000) {
      setMessage("Use a photo under 2 MB.");
      return;
    }
    if (!isSupabaseConfigured()) {
      setMessage("Photo storage is not available.");
      return;
    }
    setMessage("");
    const preview = URL.createObjectURL(file);
    setSrc(preview);
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `profiles/${userId}/${crypto.randomUUID()}.${ext}`;
    const supabase = createClient();
    const { error } = await supabase.storage.from("rtp-photos").upload(path, file, { contentType: file.type, upsert: false });
    if (error) {
      setSrc(previous);
      setMessage("The photo did not upload. Your current photo is unchanged.");
      return;
    }
    const publicUrl = supabase.storage.from("rtp-photos").getPublicUrl(path).data.publicUrl;
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fullName, phone, photoUrl: publicUrl }),
    });
    if (!response.ok) {
      setSrc(previous);
      setMessage("The photo did not save. Your current photo is unchanged.");
      return;
    }
    setSrc(publicUrl);
    onSaved?.(publicUrl);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <div className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-[#e7f0ff] text-3xl font-semibold text-[#1976F3]">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <button
          type="button"
          aria-label="Change profile photo"
          onClick={() => inputRef.current?.click()}
          className="absolute -right-1 -bottom-1 grid h-10 w-10 place-items-center rounded-full bg-[#1976F3] text-white shadow-md"
        >
          <Camera size={18} aria-hidden />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => {
            void choose(event.target.files?.[0] ?? null);
            event.target.value = "";
          }}
        />
      </div>
      {message ? <p className="mt-3 text-center text-sm text-[#9a3412]">{message}</p> : null}
    </div>
  );
}
