
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";

const bodySchema = z.object({
  username: z.string().min(1, "Username is required"),
  message: z.string().min(1, "Message cannot be empty"),
});

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  if (!username) {
    return NextResponse.json({ success: false, message: "Username is required" }, { status: 400 });
  }

  const user = await UserModel.findOne({ username }).select("isAcceptingMessages").lean();
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  }

  return NextResponse.json(
    { success: true, isAcceptingMessages: user.isAcceptingMessages },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { username, message } = parsed.data;

    const user = await UserModel.findOne({ username });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // block if toggle is OFF
    if (!user.isAcceptingMessages) {
      return NextResponse.json(
        { success: false, message: "This user is not accepting messages right now." },
        { status: 403 }
      );
    }

    // push message as per schema (content, createdAt)
    (user.messages as any).push({
      content: message,
      createdAt: new Date(),
    });

    await user.save();

    return NextResponse.json({ success: true, message: "Message sent successfully" }, { status: 200 });
  } catch (err) {
    console.error("Error sending message:", err);
    return NextResponse.json({ success: false, message: "Failed to send message" }, { status: 500 });
  }
}
