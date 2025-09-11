export const convertISOToTimestamp = (isoString: string): number => {
  return new Date(isoString).getTime();
};
