export type LocationStatus = "active" | "launching" | "paused";

export type LocationFilter = "nearest" | "training" | "church";

export type SendingLocation = {
  location_id: string;
  location_name: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  venue_name: string;
  address: string;
  map_url: string;
  leader_id: string;
  leader_name: string;
  leader_title: string;
  leader_photo_url: string;
  status: LocationStatus;
  training_day: string;
  training_start_time: string;
  training_end_time: string;
  training_price: number;
  training_capacity: number;
  training_current_enrollment: number;
  training_start_date: string;
  church_day: string;
  church_start_time: string;
  church_end_time: string;
  church_capacity: number;
  join_training_url: string;
  attend_church_url: string;
  generation: number;
  parent_location_id: string | null;
};

export type LocationSearchResult = {
  locations: SendingLocation[];
  nearestFallback: boolean;
};
