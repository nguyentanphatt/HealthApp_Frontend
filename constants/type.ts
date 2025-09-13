export interface WaterStatusResponse {
  success: boolean;
  data: WaterStatus;
}

export interface WaterStatus {
  dailyGoal: number;
  currentIntake: number;
  date: string;
  history: WaterRecords[];
}

export interface WaterRecords {
  id: string;
  amount: number;
  time: string;
}

export interface SaveWaterRecordsResponse {
  success: boolean;
  message: string;
  data?: WaterRecords;
}

export interface UpdateWaterRecordResponse {
  success: boolean;
  message: string;
}

export interface UpdateWaterDailyGoalResponse {
  success: boolean;
  message: string;
  data: {
    goalId: string;
    amount: number;
    date: string;
  };
}

export interface WeatherResponse {
  success: boolean;
  message: string;
  temp:number;
  humidity:number;
  recommended:number
}

export interface DailyIntake {
  date: string,
  dayOfWeek: string,
  totalMl: number
}

export interface WaterWeeklyResponse {
  success:boolean,
  data: {
    weekStart:string,
    weekEnd:string,
    dailyIntake: DailyIntake[]
  }
}

export interface WaterReminder {
  id: string;
  type: string;
  message: string;
  expiresIn: number;
  enabled: boolean;
}

export interface WaterReminderResponse {
  success: boolean;
  message?:string;
  data: WaterReminder[];
}

export interface UpdateWaterReminderResponse {
  success:boolean;
  data: WaterReminder
}