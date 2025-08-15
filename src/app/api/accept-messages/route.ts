

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }
  const me = session.user as User;

  const found = await UserModel.findById(me._id).select("isAcceptingMessages").lean();
  if (!found) {
    return Response.json({ success: false, message: "User not found" }, { status: 404 });
  }
  return Response.json({ success: true, isAcceptingMessages: found.isAcceptingMessages }, { status: 200 });
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }
  const me = session.user as User;

  const { acceptMessages } = await req.json();
  const updated = await UserModel.findByIdAndUpdate(
    me._id,
    { isAcceptingMessages: !!acceptMessages },
    { new: true }
  ).select("isAcceptingMessages");

  if (!updated) {
    return Response.json({ success: false, message: "Failed to update user status" }, { status: 404 });
  }

  return Response.json(
    { success: true, message: "Message acceptance status updated successfully", isAcceptingMessages: updated.isAcceptingMessages },
    { status: 200 }
  );
}
