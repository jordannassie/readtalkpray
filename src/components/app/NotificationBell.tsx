"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Notice = {
  id: string;
  kind: string;
  title: string;
  body: string;
  group_id: string | null;
  join_request_id: string | null;
  read_at: string | null;
  created_at: string;
};

export function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notice[]>([]);
  const [ringing, setRinging] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let alive = true;
    supabase
      .from("rtp_notifications")
      .select("id, kind, title, body, group_id, join_request_id, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (alive && data) setItems(data as Notice[]);
      });
    const channel = supabase
      .channel(`rtp-notifications-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rtp_notifications", filter: `recipient_id=eq.${userId}` }, (payload) => {
        const row = (payload.eventType === "DELETE" ? payload.old : payload.new) as Notice;
        if (!row?.id) return;
        setItems((current) => {
          if (payload.eventType === "DELETE") return current.filter((item) => item.id !== row.id);
          const next = current.some((item) => item.id === row.id)
            ? current.map((item) => (item.id === row.id ? { ...item, ...row } : item))
            : [row, ...current];
          return next.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 30);
        });
        if (payload.eventType === "INSERT") {
          setRinging(true);
          window.setTimeout(() => setRinging(false), 800);
        }
      })
      .subscribe();
    return () => {
      alive = false;
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    function onPointer(event: PointerEvent) {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, []);

  const unread = items.filter((item) => !item.read_at).length;

  async function markRead(ids: string[]) {
    if (ids.length === 0) return;
    const readAt = new Date().toISOString();
    setItems((current) => current.map((item) => (ids.includes(item.id) && !item.read_at ? { ...item, read_at: readAt } : item)));
    await createClient().from("rtp_notifications").update({ read_at: readAt }).in("id", ids).is("read_at", null);
  }

  function openNotice(item: Notice) {
    void markRead(item.read_at ? [] : [item.id]);
    setOpen(false);
    const request = item.join_request_id ? `?request=${item.join_request_id}` : "";
    router.push(`/app/group${request}`);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative grid h-11 w-11 place-items-center rounded-full text-[#142033] transition hover:bg-[#f4f7fb]"
      >
        <Bell size={22} aria-hidden className={ringing ? "rtp-bell-ring" : ""} />
        {unread > 0 ? (
          <span className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-[#1976F3] px-1 text-[10px] font-bold leading-4 text-white">{unread > 9 ? "9+" : unread}</span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg max-sm:fixed max-sm:inset-x-3 max-sm:top-16 max-sm:mt-0 max-sm:w-auto">
          <div className="flex items-center justify-between gap-3 border-b border-black/5 px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            {unread > 0 ? (
              <button type="button" onClick={() => void markRead(items.filter((item) => !item.read_at).map((item) => item.id))} className="text-xs font-semibold text-[#1976F3]">Mark all as read</button>
            ) : null}
          </div>
          {items.length === 0 ? <p className="px-4 py-6 text-sm text-[#667085]">No notifications yet.</p> : (
            <ul className="max-h-80 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => openNotice(item)} className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-[#f4f7fb] ${item.read_at ? "" : "bg-[#f3f8ff]"}`}>
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.read_at ? "bg-transparent" : "bg-[#1976F3]"}`} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{item.title}</span>
                      <span className="mt-0.5 block text-sm text-[#344054]">{item.body}</span>
                      <span className="mt-1 block text-xs text-[#667085]">{relativeTime(item.created_at)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function relativeTime(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}
