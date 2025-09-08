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