import { bands } from "@/data/schedule";
import type { Activity } from "@/data/types";
export const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};
export const activityName = (activity: Activity) =>
  activity.name ?? (activity.bandId ? bands[activity.bandId].name : "");
export const activityInstagram = (activity: Activity) =>
  activity.instagram ??
  (activity.bandId ? bands[activity.bandId].instagram : []);
export function groupByStart(activities: Activity[]) {
  const groups = new Map<string, Activity[]>();
  for (const activity of [...activities].sort((a, b) =>
    (a.start ?? "99").localeCompare(b.start ?? "99"),
  )) {
    const key = activity.start ?? "unscheduled";
    groups.set(key, [...(groups.get(key) ?? []), activity]);
  }
  return [...groups];
}
