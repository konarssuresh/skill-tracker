import { NextResponse } from "next/server";
import Skill from "@/models/skill";
import connectDb from "@/utils/init-db";
import { validateUser } from "@/middlewares/validate-user";
import { validateSkillPayload } from "@/utils/skill-session";

export async function GET(request) {
  try {
    const { isValid, user, message } = await validateUser(request);

    if (!isValid) {
      return NextResponse.json({ success: false, message }, { status: 401 });
    }

    await connectDb();

    const skills = await Skill.find({ userId: user._id }).sort({
      totalMinutes: -1,
      updatedAt: -1,
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      data: skills,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Unable to load skills",
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
    const payload = validateSkillPayload(body);

    const existingSkill = await Skill.findOne({
      userId: user._id,
      normalizedName: payload.name.toLowerCase(),
    });

    if (existingSkill) {
      throw new Error("You already have a skill with this name");
    }

    const skill = await Skill.create({
      userId: user._id,
      ...payload,
    });

    return NextResponse.json(
      {
        success: true,
        data: skill,
        message: "Skill created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Unable to create skill",
      },
      { status: 400 },
    );
  }
}
