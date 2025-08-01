import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { success } from "zod/v4";

export async function POST(request: Request){
    await dbConnect()

    try {
        const  {username,email,password} = await request.json()
        const existingUserVerifiedByUsername=await UserModel.findOne({
            username,
            isVarified:true
        })

        if(existingUserVerifiedByUsername){
            return Response.json({
                success: false,
                message:"Username is already taken"
            },{status:400})
        }

        const existingUserByEmail=await UserModel.findOne({email})

        const verifyCode = Math.floor(100000 + Math.random() * 90000).toString()

        if(existingUserByEmail){
            if(existingUserByEmail.isVarified){
                 return Response.json({
                success: false,
                message:"User already exist with this email"
             },{status:400})
            }
            else{
                const hasedPassword = await bcrypt.hash
                (password, 10)
                existingUserByEmail.password = hasedPassword; 
                existingUserByEmail.verifyCode=verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                await existingUserByEmail.save()
            }
        }else{
            const hasedPassword = await bcrypt.hash(password,10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser=new UserModel({
                username,
                email,
                password:hasedPassword,
                verifyCode,
                verifyCodeExpiry:expiryDate,
                isVarified:false,
                isAcceptingMessage:true,
                messages:[]
            })
            await newUser.save()
        }

        //send varification email
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )

        if(!emailResponse.success){
             return Response.json({
                success: false,
                message:emailResponse.message
             },{status:500})
        }

         return Response.json({
                success: true,
                message:"User rejistered successfully.Please verify your email "
             },{status:201})


    } catch (error) {
        console.error('Error registering user',error)
        return Response.json(
            {
                success: false,
                message:"Error registering user"
            },
            {
                status:500
            }
            
         )
    }

}