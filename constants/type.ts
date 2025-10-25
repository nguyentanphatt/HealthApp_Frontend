export interface User {
  userId: string;
  email: string;
  createdAt: string;
}
export interface OtpData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export type NewTokens = {
  accessToken: string;
  refreshToken: string;
}

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
  temp: number;
  humidity: number;
  recommended: number
}

export interface DailyIntake {
  date: string,
  dayOfWeek: string,
  totalMl: number
}

export interface WaterWeeklyResponse {
  success: boolean,
  data: {
    weekStart: string,
    weekEnd: string,
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
  message?: string;
  data: WaterReminder[];
}

export interface UpdateWaterReminderResponse {
  success: boolean;
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
  loggedAt?: string
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

export interface SleepHistory {
  recordId: string,
  startAt: string,
  endedAt: string,
  duration: number,
  qualityScore: string,
  attribute: string | null
}

export interface SleepStatus {
  totalHours: number,
  date: string,
  history: SleepHistory[]
}

export interface SleepStatusResponse {
  success: boolean,
  data: SleepStatus
}

export interface CreateSleepRecord {
  recordsCreated: number,
  mainRecord: {
    id: string,
    startAt: string,
    endedAt: string
  }
}

export interface CreateSleepRecordResponse {
  success: boolean,
  message: string,
  data: CreateSleepRecord
}

export interface UpdateSleepRecord {
  id: string,
  startAt: string,
  endedAt: string,
  qualityScore: number,
  attribute: string
}

export interface UpdateSleepRecordResponse {
  success: boolean,
  message: string,
  data: UpdateSleepRecord
}

export interface UserSetting {
  userId: string,
  height: string
  weight: string,
  water: string,
  temp: string,
  language: string
}

export interface UserProfile {
  userId: string,
  fullName: string,
  dob: string,
  gender: string,
  height: number,
  weight: number,
  imageUrl: string
}

export interface CreateBlog {
  id: number,
  title: string,
  image: string,
  content: string,
  createAt: string,
  updateAt: string,
  userId: string
  userName: string,
  category: string
  likes: number,
  liked: boolean
}

export interface GetBlogsResponse {
  success: boolean
  blogs: CreateBlog[]
  pagination?: {
    page: number,
    totalPages: number,
    totalItems: number,
  }
}

export interface WeeklyGoal {
  weekStart: string,
  weekEnd: string,
  targets: {
    water: number,
    work: number,
    sleep: number,
    steps: number,
    calories: number
  },
  current: {
    water: number,
    work: number,
    sleep: number,
    steps: number,
    calories: number
  }
}

export interface VideoType {
  videoId: string;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
  title: string;
  description: string;
  thumbnail: string;
}

export interface Activity {
  sessionId: string;
  startTime: number;
  endTime: number;
  distanceKm: number;
  stepCount: number;
  kcal: number;
  avgSpeed: number;
  activeTime: number;
  userId: string;
  type: string;
  maxSpeed: number;
  totalTime: number;
  routeId: number;
}

export interface TrackedPoint {
  latitude: number;
  longitude: number;
  time: number;
}