export const LOCATION_TYPES = ["public_venue", "home", "other"] as const;

export type LocationType = (typeof LOCATION_TYPES)[number];

export type PublicGroup = {
  id: string;
  name: string;
  description: string | null;
  city: string;
  state: string | null;
  country: string;
  location_type: LocationType;
  public_location: string;
  address: string | null;
  latitude: number;
  longitude: number;
  meeting_day: string | null;
  meeting_time: string | null;
  leader_name: string;
  leader_photo_url: string | null;
  is_demo?: boolean;
};

export const PUBLIC_GROUP_COLUMNS =
  "id, name, description, city, state, country, location_type, public_location, address, latitude, longitude, meeting_day, meeting_time, leader_name, leader_photo_url";

export type GroupApplicationInput = {
  leaderName: string;
  email: string;
  mobile: string;
  city: string;
  state: string;
  country: string;
  locationType: LocationType;
  meetingLocation: string;
  meetingDay: string;
  meetingTime: string;
  description: string;
  leaderPhotoUrl: string | null;
};

export function placeLabel(group: Pick<PublicGroup, "city" | "state" | "country">) {
  return [group.city, group.state, group.country].filter(Boolean).join(", ");
}

export function meetingWhen(group: Pick<PublicGroup, "meeting_day" | "meeting_time">) {
  return [group.meeting_day, group.meeting_time].filter(Boolean).join(" · ");
}
