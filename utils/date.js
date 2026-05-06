const dateFormatterCache = new Map();

const getFormatter = (timeZone) => {
  const cacheKey = timeZone || "UTC";

  if (!dateFormatterCache.has(cacheKey)) {
    dateFormatterCache.set(
      cacheKey,
      new Intl.DateTimeFormat("en-CA", {
        timeZone: cacheKey,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    );
  }

  return dateFormatterCache.get(cacheKey);
};

export const getTodayInTimeZone = (timeZone = "UTC") => {
  const parts = getFormatter(timeZone).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
};
