
'use client';

import { useEffect, useMemo, useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

export default function PublicProfilePage({ params }: { params: { username: string } }) {
  const username = useMemo(() => params.username, [params.username]);

  const [message, setMessage] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [isAccepting, setIsAccepting] = useState<boolean>(true);

  // suggestions UI state
  const [useAI, setUseAI] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // hardcoded “input-like” suggestions visible initially
  const hardcoded = [
    "Aisa kaunsa chhota habit hai jisne aapki zindagi behtar ki?",
    "Aap kis skill ko next 3 months me seekhna chahenge?",
    "Koi simple cheez jo aapko khush kar deti hai?"
  ];

  useEffect(() => {
    // public status check (toggle)
    const run = async () => {
      try {
        const res = await axios.get(`/api/send-message?username=${encodeURIComponent(username)}`);
        setIsAccepting(!!res.data?.isAcceptingMessages);
      } catch {
        setIsAccepting(false);
      }
    };
    run();
  }, [username]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    if (!isAccepting) {
      toast.error("This user is not accepting messages right now.");
      return;
    }

    setIsSending(true);
    try {
      await axios.post("/api/send-message", { username, message });
      toast.success("Message sent successfully");
      setMessage("");
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      toast.error(e.response?.data?.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const res = await axios.post("/api/suggest-messages", { message }); 
      const list = (res.data as string)?.split("||").map(s => s.trim()).filter(Boolean) || [];
      setAiSuggestions(list.slice(0, 3)); 
      setUseAI(true);
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      toast.error(e.response?.data?.message || "Failed to fetch suggestions");
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setMessage(text);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded mt-8 shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Public Profile Link</h1>
      <h2 className="text-xl font-semibold mb-2 text-center">@{username}</h2>

      {!isAccepting && (
        <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-800 text-sm">
          This user is not accepting messages right now.
        </div>
      )}

      <textarea
        className="w-full p-2 border rounded mb-3"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={!isAccepting}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
        onClick={handleSendMessage}
        disabled={isSending || !isAccepting}
      >
        {isSending ? "Sending..." : "Send"}
      </button>

      <div className="mt-2">
        <div className="flex items-center justify-between mb-2">
          <button
            className="bg-gray-900 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={fetchSuggestions}
            disabled={isLoadingSuggestions}
          >
            {isLoadingSuggestions ? "Loading..." : "Suggest Messages"}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {!useAI
            ? hardcoded.map((q, i) => (
                <input
                  key={i}
                  type="text"
                  readOnly
                  value={q}
                  className="w-full p-2 border rounded bg-gray-50 cursor-pointer"
                  onClick={() => handleSuggestionClick(q)}
                />
              ))
            : aiSuggestions.length > 0
            ? aiSuggestions.map((q, i) => (
                <input
                  key={i}
                  type="text"
                  readOnly
                  value={q}
                  className="w-full p-2 border rounded bg-gray-50 cursor-pointer"
                  onClick={() => handleSuggestionClick(q)}
                  title="Click to use this"
                />
              ))
            : (
              <input
                readOnly
                value="No suggestions available"
                className="w-full p-2 border rounded bg-gray-50"
              />
            )
          }
        </div>
      </div>
    </div>
  );
}
