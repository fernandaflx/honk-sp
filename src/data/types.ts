export type DayId = "2026-11-26" | "2026-11-27" | "2026-11-28" | "2026-11-29";
export type ActivityType = "workshop" | "opening" | "show" | "music";
export interface Band {
  id: string;
  name: string;
  state?: string;
  instagram: string[];
}
export interface Venue {
  id: string;
  name: string;
  address: string;
  instagram?: string;
}
export interface Stage {
  id: string;
  name: string;
  color: "yellow" | "green" | "pink";
  opensAt: string;
}
export interface Activity {
  id: string;
  type: ActivityType;
  name?: string;
  bandId?: string;
  instagram?: string[];
  start?: string;
  end?: string;
  timing?: "confirmed" | "estimated";
  stageId?: string;
}
export interface Party {
  start?: string;
  venueId: string;
  ticketUrl: string;
  activities: Activity[];
}
export interface FestivalDay {
  id: DayId;
  weekday: string;
  date: string;
  title: string;
  pending: boolean;
  venueId?: string;
  note?: string;
  activities: Activity[];
  party?: Party;
}
