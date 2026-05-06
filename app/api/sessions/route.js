import { NextResponse } from "next/server";
import Session from "@/models/session";
import Skill from "@/models/skill";
import connectDb from "@/utils/init-db";
import { validateUser } from "@/middlewares/validate-user";
import { getTodayInTimeZone } from "@/utils/date";
import {
  refreshSkillSummary,
  validateSessionPayload,
} from "@/utils/skill-session";

export async function GET(request) {
  try {
    const { isValid, user, message } = await validateUser(request);

    if (!isValid) {
      return NextResponse.json({ success: false, message }, { status: 401 });
    }

    await connectDb();

    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get("skillId");
    const limitParam = Number(searchParams.get("limit") ?? 20);
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, 1), 100)
      : 20;

    const query = { userId: user._id };

    if (skillId) {
      query.skillId = skillId;
    }

    const sessions = await Session.find(query)
      .sort({ sessionDate: -1, createdAt: -1 })
      .limit(limit)
      .populate({
        path: "skillId",
        select: "name color",
      });

    const data = sessions.map((session) => ({
      ...session.toJSON(),
      skill: session.skillId
        ? {
            id: session.skillId._id.toString(),
            name: session.skillId.name,
            color: session.skillId.color,
          }
        : null,
      skillId: session.skillId?._id?.toString?.() ?? session.skillId,
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Unable to load sessions",
      },
      { status: 400 },
    );
  }
}

export async function POST(request) {
  try {
    const { isValid, user, message } = await validateUser(request);

    if (!isValid) {
      return NextResponse.json({ success: false, message }, { status: 401 });
    }

    await connectDb();

    const body = await request.json();
    const payload = validateSessionPayload(body);
    const today = getTodayInTimeZone(user.timezone || "UTC");

    if (payload.sessionDate > today) {
      throw new Error("Session date cannot be in the future");
    }

    const skill = await Skill.findOne({
      _id: payload.skillId,
      userId: user._id,
    });

    if (!skill) {
      throw new Error("Skill not found");
    }

    const session = await Session.create({
      userId: user._id,
      skillId: skill._id,
      durationMinutes: payload.durationMinutes,
      sessionDate: payload.sessionDate,
      notes: payload.notes,
    });

    const summary = await refreshSkillSummary({
      userId: user._id,
      skillId: skill._id,
      today,
    });

    skill.totalMinutes = summary.totalMinutes;
    skill.sessionCount = summary.sessionCount;
    skill.currentStreakDays = summary.currentStreakDays;
    skill.longestStreakDays = summary.longestStreakDays;
    skill.lastPracticedOn = summary.lastPracticedOn;
    await skill.save();

    return NextResponse.json(
      {
        success: true,
        data: {
          session,
          skill,
          warning:
            payload.durationMinutes > 480
              ? "This is a long session. Double-check the duration if needed."
              : null,
        },
        message: "Session logged successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Unable to log session",
      },
      { status: 400 },
    );
  }
}
