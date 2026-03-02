export const formatToLocalTime = (
  dateString: string,
  hour12: boolean = false,
) => {
  if (!dateString) return "";

  // If it's already a full ISO string with Z or offset, new Date() handles it.
  // If it's an ISO string WITHOUT Z, append Z to assume UTC.
  const hasTimezone = /[Z|[+-]\d{2}:?\d{2}]$/.test(dateString);
  const normalized = hasTimezone
    ? dateString
    : `${dateString}${dateString.includes("T") ? "Z" : ""}`;

  try {
    return new Date(normalized).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: hour12,
    });
  } catch (e) {
    return dateString;
  }
};
