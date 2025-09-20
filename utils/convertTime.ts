// Convert time from VN to UTC timestamp (24-hour format)
export function vnTimeToUtcTimestamp(hours: number, minutes: number, isNextDay: boolean = false): number {
    const now = new Date();
    const vnOffset = 7 * 60 * 60 * 1000;
    const vnNow = new Date(now.getTime() + vnOffset);
    
    // For 24-hour format: use hours directly (no conversion needed)
    // 20:36 -> 20:36, 0:00 -> 0:00, 23:59 -> 23:59
    vnNow.setUTCHours(hours, minutes, 0, 0);
    
    // If it's next day, add 24 hours
    if (isNextDay) {
        vnNow.setTime(vnNow.getTime() + 24 * 60 * 60 * 1000);
    }
    
    const utcDate = new Date(vnNow.getTime() - vnOffset);
    return utcDate.getTime();
  }

//convert utc time to vn time with hour and minute
export function utcTimeToVnTime(utcTime: number): { hour: number, minute: number } {
    const date = new Date(utcTime);
    const utcHour = date.getUTCHours();
    const utcMinute = date.getUTCMinutes();
    
    // Convert UTC to VN time (UTC+7)
    let vnHour = utcHour + 7;
    let vnMinute = utcMinute;
    
    // Handle day overflow
    if (vnHour >= 24) {
        vnHour = vnHour - 24;
    }
    
    return { hour: vnHour, minute: vnMinute };
}

// Format time for display (12-hour format)
export function formatTimeForDisplay(hour: number, minute: number): string {
    const formattedMinute = minute.toString().padStart(2, '0');
    return `${hour}:${formattedMinute}`;
}