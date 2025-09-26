// Convert time from VN to UTC timestamp (24-hour format)
export function vnTimeToUtcTimestamp(hours: number, minutes: number, isNextDay: boolean = false): number {
    const now = new Date();
    const vnOffset = 7 * 60 * 60 * 1000;
    const vnNow = new Date(now.getTime() + vnOffset);

    vnNow.setUTCHours(hours, minutes, 0, 0);

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
    let vnHour = utcHour + 7;
    let vnMinute = utcMinute;

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

//convert day from en to vn
export const convertDayToVN = (dayEn: string): string => {
    switch (dayEn) {
        case "Mo":
            return "T2";
        case "Tu":
            return "T3";
        case "We":
            return "T4";
        case "Th":
            return "T5";
        case "Fr":
            return "T6";
        case "Sa":
            return "T7";
        case "Su":
            return "CN";
        default:
            return dayEn;
    }
};

//convert iso string to timestamp
export const convertISOToTimestamp = (isoString: string): number => {
    return new Date(isoString).getTime();
};

//convert timestamp vn to timestamp utc
export const convertTimestampVNtoTimestamp = (timestamp: number): number => {
    const vnOffset = 7 * 60 * 60 * 1000;
    return timestamp - vnOffset;
};

// Function to format date and time range
export const formatDateTimeRange = (startTime: number | null, endTime: string) => {
        const startDate = new Date(startTime || 0);
        const endDate = new Date(parseInt(endTime));

        const dateStr = startDate.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const startTimeStr = startDate.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        const endTimeStr = endDate.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        return `${dateStr}, ${startTimeStr} - ${endTimeStr}`;
    
};