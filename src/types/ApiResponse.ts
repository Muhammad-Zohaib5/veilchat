

import { Message } from "@/model/User";

export interface ApiResponse {
    success: boolean;
    message: string; // ✅ always string for success/error message
    isAcceptingMessages?: boolean;
    messages?: Array<Message>; // ✅ plural for list of messages
}
