export interface WaterStatusResponse {
  success: boolean;
  data: WaterStatus
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
    success:boolean,
    message:string,
    data?:WaterRecords
}
