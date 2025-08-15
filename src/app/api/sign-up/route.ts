 

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { signUpSchema } from "@/schemas/signUpSchema";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { username, email, password } = parsed.data;

    // Check if user exists
    const existingUser = await UserModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Username or Email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Create user
    const user = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      verifyCode,
      verifyCodeExpiry,
    });

    // Send verification email
    await sendVerificationEmail(email, username, verifyCode);


    return NextResponse.json(
      { message: "Signup successful, please verify your email" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}







// import dbConnect from "@/lib/dbConnect";
// import UserModel from "@/model/User";
// import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
// import bcrypt from "bcryptjs";

// export async function POST(request: Request) {
//   await dbConnect();

//   try {
//     const { username, email, password } = await request.json();

//     // Check if email already exists
//     const existingUser = await UserModel.findOne({ email });
//     if (existingUser) {
//       return Response.json(
//         { success: false, message: "Email already registered" },
//         { status: 400 }
//       );
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Generate code
//     const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
//     const verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

//     const user = new UserModel({
//       username,
//       email,
//       password: hashedPassword,
//       verifyCode,
//       verifyCodeExpiry,
//       isVerified: false,
//       isAcceptingMessage: true,
//       messages: [],
//     });

//     await user.save();

//     // Send email
    
//     await sendVerificationEmail(email, verifyCode,username);

//     return Response.json(
//       { success: true, message: "Signup successful, verification code sent" },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Signup error:", error);
//     return Response.json(
//       { success: false, message: "Error during signup" },
//       { status: 500 }
//     );
//   }
// // }


// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import { dbConnect } from "@/lib/dbConnect";
// import UserModel from "@/model/User";
// import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
// import { signUpSchema } from "@/schemas/signUpSchema";

// export async function POST(req: Request) {
//   try {
//     await dbConnect();

//     const body = await req.json();
//     const parsed = signUpSchema.safeParse(body);

//     if (!parsed.success) {
//       return NextResponse.json(
//         { message: parsed.error.errors[0].message },
//         { status: 400 }
//       );
//     }

//     const { username, email, password } = parsed.data;

//     // Check if user exists
//     const existingUser = await UserModel.findOne({
//       $or: [{ username }, { email }],
//     });

//     if (existingUser) {
//       return NextResponse.json(
//         { message: "Username or Email already exists" },
//         { status: 400 }
//       );
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Generate verification code
//     const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
//     const verifyCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

//     // Create verification link
//     const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?username=${encodeURIComponent(username)}&code=${verifyCode}`;

//     // Create user
//     const user = await UserModel.create({
//       username,
//       email,
//       password: hashedPassword,
//       verifyCode,
//       verifyCodeExpiry,
//     });

//     // Send verification email with clickable link
//     await sendVerificationEmail(email, username, verifyCode, verificationUrl);

//     return NextResponse.json(
//       { message: "Signup successful, please check your email to verify your account" },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Signup error:", error);
//     return NextResponse.json(
//       { message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
