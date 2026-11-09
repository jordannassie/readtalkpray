import type { SendingLocation } from "./types";

export const FRISCO_LOCATION: SendingLocation = {
  location_id: "frisco-star",
  location_name: "Frisco, TX — The Star",
  city: "Frisco",
  state: "TX",
  country: "USA",
  zip_code: "75034",
  latitude: 33.1046,
  longitude: -96.8201,
  venue_name: "Omni Frisco Hotel",
  address: "11 Cowboys Way, Frisco, TX 75034",
  map_url: "https://maps.google.com/?q=11+Cowboys+Way,+Frisco,+TX+75034",
  leader_id: "jordan-nassie",
  leader_name: "Jordan Nassie",
  leader_title: "Pastor & Founder",
  leader_photo_url:
    "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/images/Jordan/Jordan2.png",
  status: "active",
  training_day: "Sunday",
  training_start_time: "8:00 AM",
  training_end_time: "9:00 AM",
  training_price: 497,
  training_capacity: 40,
  training_current_enrollment: 0,
  training_start_date: "2026-10-04",
  church_day: "Sunday",
  church_start_time: "9:00 AM",
  church_end_time: "10:00 AM",
  church_capacity: 80,
  join_training_url: "/login",
  attend_church_url: "/#sunday",
  generation: 1,
  parent_location_id: null,
};

export const LOCATIONS: SendingLocation[] = [FRISCO_LOCATION];

export function getLocations(): SendingLocation[] {
  return LOCATIONS.filter((location) => location.status !== "paused");
}
