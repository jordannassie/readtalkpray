import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { PublicGroup } from "./types";

/**
 * Local preview groups. They are not Supabase rows.
 * The live switch is rtp_settings.show_demo_groups. The env flag is only a fallback.
 */
const DEMO_GROUPS: PublicGroup[] = [
  {
    id: "demo-franklin",
    name: "Franklin Bible Study",
    description: "A neighborhood Bible study in Franklin.",
    city: "Franklin",
    state: "TN",
    country: "USA",
    location_type: "other",
    public_location: "Franklin neighborhood",
    address: null,
    latitude: 35.925,
    longitude: -86.869,
    meeting_day: "Sunday",
    meeting_time: "9:00 AM",
    leader_name: "Caleb Brooks",
    leader_photo_url: "/demo/leaders/caleb.jpg",
    is_demo: true,
  },
  {
    id: "demo-downtown",
    name: "Downtown Nashville",
    description: "A downtown gathering to read, talk, and pray.",
    city: "Nashville",
    state: "TN",
    country: "USA",
    location_type: "other",
    public_location: "Downtown Nashville area",
    address: null,
    latitude: 36.162,
    longitude: -86.777,
    meeting_day: "Sunday",
    meeting_time: "10:00 AM",
    leader_name: "Maya Chen",
    leader_photo_url: "/demo/leaders/maya.jpg",
    is_demo: true,
  },
  {
    id: "demo-east",
    name: "East Nashville Group",
    description: "An East Nashville neighborhood Bible study.",
    city: "East Nashville",
    state: "TN",
    country: "USA",
    location_type: "other",
    public_location: "East Nashville neighborhood",
    address: null,
    latitude: 36.178,
    longitude: -86.735,
    meeting_day: "Sunday",
    meeting_time: "11:00 AM",
    leader_name: "Andre Williams",
    leader_photo_url: "/demo/leaders/andre.jpg",
    is_demo: true,
  },
  {
    id: "demo-brentwood",
    name: "Brentwood Bible Study",
    description: "A Brentwood-area Bible study.",
    city: "Brentwood",
    state: "TN",
    country: "USA",
    location_type: "other",
    public_location: "Brentwood area",
    address: null,
    latitude: 36.033,
    longitude: -86.783,
    meeting_day: "Sunday",
    meeting_time: "9:00 AM",
    leader_name: "Sofia Reyes",
    leader_photo_url: "/demo/leaders/sofia.jpg",
    is_demo: true,
  },
  {
    id: "demo-thompsons",
    name: "Thompson's Station Group",
    description: "A neighborhood Bible study in Thompson's Station.",
    city: "Thompson's Station",
    state: "TN",
    country: "USA",
    location_type: "other",
    public_location: "Thompson's Station neighborhood",
    address: null,
    latitude: 35.802,
    longitude: -86.907,
    meeting_day: "Sunday",
    meeting_time: "10:00 AM",
    leader_name: "Hannah Cole",
    leader_photo_url: "/demo/leaders/hannah.jpg",
    is_demo: true,
  },
  {
    id: "demo-12-south",
    name: "12 South Group",
    description: "A weeknight Bible study in the 12 South neighborhood.",
    city: "Nashville",
    state: "TN",
    country: "USA",
    location_type: "other",
    public_location: "12 South neighborhood",
    address: null,
    latitude: 36.121,
    longitude: -86.79,
    meeting_day: "Wednesday",
    meeting_time: "7:00 PM",
    leader_name: "Priya Shah",
    leader_photo_url: "/demo/leaders/priya.jpg",
    is_demo: true,
  },
  {
    id: "demo-spring-hill",
    name: "Spring Hill Group",
    description: "A Spring Hill-area Bible study.",
    city: "Spring Hill",
    state: "TN",
    country: "USA",
    location_type: "other",
    public_location: "Spring Hill area",
    address: null,
    latitude: 35.751,
    longitude: -86.93,
    meeting_day: "Sunday",
    meeting_time: "10:00 AM",
    leader_name: "Marcus Hale",
    leader_photo_url: "/demo/leaders/marcus.jpg",
    is_demo: true,
  },
  {
    id: "demo-murfreesboro",
    name: "Murfreesboro Group",
    description: "A weeknight Bible study in Murfreesboro.",
    city: "Murfreesboro",
    state: "TN",
    country: "USA",
    location_type: "other",
    public_location: "Murfreesboro neighborhood",
    address: null,
    latitude: 35.846,
    longitude: -86.39,
    meeting_day: "Thursday",
    meeting_time: "7:00 PM",
    leader_name: "Elena Vasquez",
    leader_photo_url: "/demo/leaders/elena.jpg",
    is_demo: true,
  },
];

export async function demoGroupsEnabled() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from("rtp_settings").select("enabled").eq("key", "show_demo_groups").maybeSingle();
      if (!error && data && typeof data.enabled === "boolean") return data.enabled;
    } catch {
      // Fall through to the env flag when the setting table is not available yet.
    }
  }
  if (process.env.NEXT_PUBLIC_SHOW_DEMO_GROUPS === "false") return false;
  return true;
}

export async function demoGroups(): Promise<PublicGroup[]> {
  return (await demoGroupsEnabled()) ? DEMO_GROUPS : [];
}

export async function getDemoGroup(id: string): Promise<PublicGroup | null> {
  if (!(await demoGroupsEnabled())) return null;
  return DEMO_GROUPS.find((group) => group.id === id) ?? null;
}
