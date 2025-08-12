// import { log } from "console";
// import { promises } from "dns";
// import mongoose from "mongoose";

// type connectionObject ={
//     isconnected?:number
// }

// const connection: connectionObject = {}

// async function dbConnect(): Promise<void>{
//     if(connection.isconnected){
//         console.log("already connected to database");
//         return
//     }

//     try{
//         const db = await mongoose.connect(process.env.MONGODB_URI || '', {})

//         connection.isconnected = db.connections[0].readyState
//         console.log("DB Connected successfully");

//     }catch(error){
//         console.log("database connection failed")
//         process.exit(1)
//     }
// }

// export default dbConnect;




import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("❌ Please define MONGODB_URI in .env file");
}

let isConnected = false;

export async function dbConnect() {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = !!db.connections[0].readyState;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed", error);
    process.exit(1);
  }
}
export default dbConnect;











