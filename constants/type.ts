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

export interface FoodDetail {
  recordId: string;
  name: string;
  tag: string;
  calories: number;
  protein: number;
  fat: number;
  fiber: number;
  starch: number;
  imageUrl: string;
  time: string;
  loggedAt?:string
}

export interface FoodRecord {
  currentCalories: number;
  date: string;
  history: FoodDetail[];
}

export interface FoodRecordResponse {
  success: boolean;
  data: FoodRecord;
}

export interface SaveFoodRecordResponse {
  success: boolean;
  message?: string;
  error?: string;
  recordId: string;
  imageUrl: string;
  name: string;
  tag: string;
  protein: number;
  fiber: number;
  fat: number;
  starch: number;
  calories: number;
}

export interface UpdateFoodRecordResponse {
  success: boolean;
  message?: string;
  error?: string;
  recordId: string;
  imageUrl: string;
  name: string;
  tag: string;
  protein: number;
  fiber: number;
  fat: number;
  starch: number;
  calories: number;
}

export interface DailyFoodIntake {
  date: string;
  dayOfWeek: string;
  totalCalories: number;
}

export interface FoodStatistic {
  success: boolean;
  data: {
    weekStart: string;
    weekEnd: string;
    dailyIntake: DailyFoodIntake[];
  }
}

export interface FindFoodById {
  success: boolean;
  message?: string;
  error?: string;
  data: FoodDetail;
}

export interface DeleteFoodRecordResponse {
  success: boolean;
  message?: string;
  error?: string;
  recordId?: string;
}
