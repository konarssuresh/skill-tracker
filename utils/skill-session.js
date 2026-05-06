import validator from "validator";
import Session from "@/models/session";

const ALLOWED_SKILL_COLORS = [
  "#059669",
  "#8B5CF6",
  "#3B82F6",
  "#EF4444",
  "#F59E0B",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];

const SESSION_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const parseDurationToMinutes = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }

  if (typeof value !== "string") {
    throw new Error("Duration is required");
  }

  const trimmed = value.trim().toLowerCase();

  if (!trimmed) {
    throw new Error("Duration is required");
  }

  const hoursAndMinutesMatch =
    trimmed.match(
      /^(?:(\d+(?:\.\d+)?)\s*h(?:ours?)?)?\s*(?:(\d+(?:\.\d+)?)\s*m(?:in(?:utes?)?)?)?$/,
    ) ?? [];

  if (hoursAndMinutesMatch[0]) {
    const hoursPart = hoursAndMinutesMatch[1]
      ? Number(hoursAndMinutesMatch[1])
      : 0;
    const minutesPart = hoursAndMinutesMatch[2]
      ? Number(hoursAndMinutesMatch[2])
      : 0;

    if (hoursPart === 0 && minutesPart === 0) {
      throw new Error("Duration must be greater than 0");
    }

    return Math.round(hoursPart * 60 + minutesPart);
  }

  if (validator.isFloat(trimmed)) {
    const numericValue = Number(trimmed);

    if (trimmed.includes(".")) {
      return Math.round(numericValue * 60);
    }

    return Math.round(numericValue);
  }

  throw new Error(
    'Duration must be a number of minutes or a format like "1h 30m"',
  );
};

export const normalizeSessionDate = (value) => {
  if (typeof value !== "string" || !SESSION_DATE_REGEX.test(value.trim())) {
    throw new Error("Session date must use YYYY-MM-DD format");
  }

  return value.trim();
};

export const validateSkillPayload = (payload) => {
  const allowedKeys = ["name", "color", "goal"];
  const invalidKeys = Object.keys(payload).filter(
    (key) => !allowedKeys.includes(key),
  );

  if (invalidKeys.length > 0) {
    throw new Error(`Invalid fields in request: ${invalidKeys.join(", ")}`);
  }

  if (!payload.name || validator.isEmpty(payload.name.trim())) {
    throw new Error("Skill name is required");
  }

  if (payload.color && !ALLOWED_SKILL_COLORS.includes(payload.color)) {
    throw new Error("Skill color must be from the curated palette");
  }

  const goal = payload.goal ?? {};

  if (!goal.type && goal.targetMinutes != null) {
    throw new Error("Goal type is required when target minutes are provided");
  }

  if (goal.type && !["weekly", "total"].includes(goal.type)) {
    throw new Error('Goal type must be either "weekly" or "total"');
  }

  if (goal.type) {
    if (!Number.isFinite(goal.targetMinutes) || goal.targetMinutes < 1) {
      throw new Error("Goal target must be at least 1 minute");
    }
  }

  return {
    name: payload.name.trim(),
    color: payload.color ?? ALLOWED_SKILL_COLORS[0],
    goal: goal.type
      ? {
          type: goal.type,
          targetMinutes: Math.round(goal.targetMinutes),
        }
      : {
          type: null,
          targetMinutes: null,
        },
  };
};

export const validateSessionPayload = (payload) => {
  const allowedKeys = ["skillId", "duration", "durationMinutes", "sessionDate", "notes"];
  const invalidKeys = Object.keys(payload).filter(
    (key) => !allowedKeys.includes(key),
  );

  if (invalidKeys.length > 0) {
    throw new Error(`Invalid fields in request: ${invalidKeys.join(", ")}`);
  }

  if (!payload.skillId || !validator.isMongoId(payload.skillId)) {
    throw new Error("A valid skill is required");
  }

  const durationMinutes =
    payload.durationMinutes != null
      ? parseDurationToMinutes(payload.durationMinutes)
      : parseDurationToMinutes(payload.duration);

  if (durationMinutes < 1) {
    throw new Error("Duration must be at least 1 minute");
  }

  if (durationMinutes > 1440) {
    throw new Error("Duration cannot be more than 24 hours");
  }

  const notes = typeof payload.notes === "string" ? payload.notes.trim() : "";

  return {
    skillId: payload.skillId,
    durationMinutes,
    sessionDate: normalizeSessionDate(payload.sessionDate),
    notes,
  };
};

export const computeStreaksFromDates = (sessionDates, today) => {
  const uniqueDates = [...new Set(sessionDates)].sort((left, right) =>
    left < right ? 1 : left > right ? -1 : 0,
  );

  if (uniqueDates.length === 0) {
    return {
      currentStreakDays: 0,
      longestStreakDays: 0,
      lastPracticedOn: null,
      isAtRisk: false,
    };
  }

  const dateSet = new Set(uniqueDates);
  const lastPracticedOn = uniqueDates[0];
  let longestStreakDays = 0;

  for (const startDate of uniqueDates) {
    let streakLength = 1;
    let cursor = new Date(`${startDate}T00:00:00Z`);

    while (true) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
      const previousDate = cursor.toISOString().slice(0, 10);

      if (!dateSet.has(previousDate)) {
        break;
      }

      streakLength += 1;
    }

    longestStreakDays = Math.max(longestStreakDays, streakLength);
  }

  let currentStreakDays = 0;
  const yesterdayDate = new Date(`${today}T00:00:00Z`);
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);

  if (dateSet.has(today)) {
    let cursor = new Date(`${today}T00:00:00Z`);

    while (dateSet.has(cursor.toISOString().slice(0, 10))) {
      currentStreakDays += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
  } else if (dateSet.has(yesterday)) {
    let cursor = new Date(`${yesterday}T00:00:00Z`);

    while (dateSet.has(cursor.toISOString().slice(0, 10))) {
      currentStreakDays += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
  }

  return {
    currentStreakDays,
    longestStreakDays,
    lastPracticedOn,
    isAtRisk: !dateSet.has(today) && dateSet.has(yesterday),
  };
};

export const refreshSkillSummary = async ({ userId, skillId, today }) => {
  const sessions = await Session.find({ userId, skillId })
    .select("durationMinutes sessionDate")
    .sort({ sessionDate: -1, createdAt: -1 })
    .lean();

  const totalMinutes = sessions.reduce(
    (sum, session) => sum + session.durationMinutes,
    0,
  );
  const sessionDates = sessions.map((session) => session.sessionDate);
  const streaks = computeStreaksFromDates(sessionDates, today);

  return {
    totalMinutes,
    sessionCount: sessions.length,
    ...streaks,
  };
};
