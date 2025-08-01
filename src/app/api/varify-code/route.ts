import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(requst:Request) {
     await dbConnect()
     try {
        const {username,code} = await requst.json()

        const decodeUsername = decodeURIComponent(username)
        const user = await UserModel.findOne({username:decodeUsername})

        if(!user){
            return Response.json(
            {
                success: false,
                message: "User not found"
            },{status : 500})
        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if(isCodeValid && isCodeNotExpired){
            user.isVarified = true
            await user.save()

             return Response.json(
            {
                success: true,
                message: "Account verified successfully"
            },{status : 200})
        }
        else if(!isCodeNotExpired){
             return Response.json(
            {
                success: false,
                message: "Varification code is expired, please signup again to get a new code"
            },{status : 400})
        }
        else{
              return Response.json(
            {
                success: false,
                message: "Incorrect Varification code" 
            },{status : 400})
        }

     } catch (error) {
         console.error("Error verifying user" , error)
        return Response.json(
            {
                success: false,
                message: "Error verifying user"
            },{status : 500})
     }
} 