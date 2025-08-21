export interface TimeEntry {
  id: string;
  clockIn: string; // ISO Date string
  clockOut: string | null; // ISO Date string or null
}

export interface AppSettings {
  dailyWorkHourLimit: number;
}
