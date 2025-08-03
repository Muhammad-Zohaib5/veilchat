// @ts-expect-error
import { StreamingTextResponse, OpenAIStream } from 'ai'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export const runtime = 'edge';

export async function POST(req: Request) {
 try {
    const prompt ="Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'.These questions are for an anonymous social messaging platform, like Qooh.me, and dhould be suitable for a diverse audience.Avoid personal aur senstive topics, focusing instead on universal theams that encourage freindly intraction. For example , your output should be structured like this : 'What's a hobby you've' recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'.Ensure the questions interguing, foster curiosity, and contribute to a positive and welcoming coversational environment. "

   const { messages } = await req.json()
 
   const response = await openai.completions.create({
     model: 'gpt-3.5-turbo-instruct', 
     max_tokens:100,
     stream: true,
     prompt,
   });
 
   const stream = OpenAIStream(response)
   return new StreamingTextResponse(stream)
 } catch (error) {
  if(error instanceof OpenAI.APIError){
    const {name,status,headers,message}=error
    return NextResponse.json({
      name,status,headers,message
    },{status})
  }else{
    console.error("An unaccepted error occured",error)
    throw error
  }
 }
}
