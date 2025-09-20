// Convert time from VN to UTC timestamp (12-hour format)
export function vnTimeToUtcTimestamp(hours: number, minutes: number, isNextDay: boolean = false): number {
    const now = new Date();
    const vnOffset = 7 * 60 * 60 * 1000;
    const vnNow = new Date(now.getTime() + vnOffset);
    
    // For 12-hour format: convert to 24-hour format
    // 12:00 -> 0:00, 1:25 -> 1:25, 6:00 -> 6:00, 11:59 -> 11:59
    let actualHours = hours;
    if (hours >= 12) {
        actualHours = hours - 12; // 12:00 -> 0:00, 12:40 -> 0:40
    }
    
    vnNow.setUTCHours(actualHours, minutes, 0, 0);
    
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