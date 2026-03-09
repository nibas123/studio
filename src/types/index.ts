export interface TimeEntry {
  id: string;
  clockIn: string; // ISO Date string
  clockOut: string | null; // ISO Date string or null
  wfhType?: 'full' | 'half';
}

export interface AppSettings {
  dailyWorkHourLimit: number;
  monthlyWfhLimit?: number;
}

export interface BreakEntry {
  start: string;
  end: string;
  duration: number; // in milliseconds
}

export interface DailySummaryData {
  totalWork: number;
  totalBreak: number;
  firstClockIn: string | null;
  lastClockOut: string | null;
  breaks: BreakEntry[];
  workPercentage: number;
  breakPercentage: number;
  entries: TimeEntry[];
}
