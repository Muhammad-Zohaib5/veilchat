
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

  const found = await UserModel.findById(me._id).select("messages").lean();
  if (!found) {
    return Response.json({ success: false, message: "User not found" }, { status: 404 });
  }

  const messages = (found.messages ?? []).sort(
    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return Response.json({ success: true, messages }, { status: 200 });
}
