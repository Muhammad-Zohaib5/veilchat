
'use client';

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Loader2, RefreshCcw } from "lucide-react";
import type { Message, User } from "@/model/User";
import type { ApiResponse } from "@/types/ApiResponse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

// Inline MessageCard with Dialog
const MessageCard = ({
  message,
  onConfirmDelete
}: {
  message: Message;
  onConfirmDelete: () => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4 border rounded shadow hover:shadow-md transition relative bg-gray-50">
      <p className="text-gray-800">{message.content}</p>
      <span className="text-xs text-gray-500 block mt-2">
        {new Date(message.createdAt).toLocaleString()}
      </span>
      <Button
        variant="destructive"
        size="sm"
        className="absolute top-2 right-2"
        onClick={() => setOpen(true)}
      >
        Delete
      </Button>

      {/* VIP-style centered dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onConfirmDelete();
                setOpen(false);
              }}
            >
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function Page() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [acceptMessages, setAcceptMessages] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);

  const isAuthed = status === "authenticated" && !!session?.user;

  const profileUrl = useMemo(() => {
    if (!isAuthed) return "";
    const { username } = session!.user as User;
    if (typeof window === "undefined") return "";
    return `${window.location.protocol}//${window.location.host}/u/${username}`;
  }, [isAuthed, session]);

  const handleAxiosError = (err: unknown, fallback = "Something went wrong") => {
    const ax = err as AxiosError<ApiResponse>;
    const msg = ax?.response?.data?.message || fallback;
    toast.error(msg);
  };

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const res = await axios.get<ApiResponse>("/api/accept-messages");
      setAcceptMessages(res.data.isAcceptingMessages ?? false);
    } catch (err) {
      handleAxiosError(err, "Failed to fetch message settings");
    } finally {
      setIsSwitchLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (refresh = false) => {
    setIsLoading(true);
    try {
      const res = await axios.get<ApiResponse>("/api/get-messages");
      setMessages(res.data.messages || []);
      if (refresh)
        toast.success("Refreshed Messages", {
          description: "Showing latest messages"
        });
    } catch (err) {
      handleAxiosError(err, "Failed to fetch messages");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSwitchChange = async () => {
    const next = !acceptMessages;
    setAcceptMessages(next);
    setIsSwitchLoading(true);
    try {
      const res = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: next
      });
      toast.success(res.data.message || "Updated successfully");
    } catch (err) {
      setAcceptMessages(!next);
      handleAxiosError(err, "Failed to update setting");
    } finally {
      setIsSwitchLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await axios.delete<ApiResponse>(`/api/delete-message/${messageId}`);
      setMessages((prev) =>
        prev.filter((m) => String(m._id) !== String(messageId))
      );
      toast.success("Message deleted");
    } catch (err) {
      handleAxiosError(err, "Error deleting message");
    }
  };

  useEffect(() => {
    if (!isAuthed) return;
    fetchMessages();
    fetchAcceptMessage();
  }, [isAuthed, fetchMessages, fetchAcceptMessage]);

  if (status === "loading")
    return (
      <div className="flex items-center gap-2 p-6">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  if (!isAuthed)
    return <div className="p-6">Please sign in to view the dashboard.</div>;

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      {/* Profile link */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            readOnly
            className="input input-bordered w-full p-2 mr-2 border rounded"
          />
          <Button
            onClick={() => {
              navigator.clipboard.writeText(profileUrl);
              toast.success("URL copied");
            }}
          >
            Copy
          </Button>
        </div>
      </div>

      {/* Accept messages toggle */}
      <div className="mb-4 flex items-center gap-2">
        <Switch
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span>Accept Messages: {acceptMessages ? "On" : "Off"}</span>
      </div>

      <Separator />

      {/* Refresh */}
      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>

      {/* Messages */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={String(message._id)}
              message={message}
              onConfirmDelete={() =>
                handleDeleteMessage(String(message._id))
              }
            />
          ))
        ) : (
          <p>No message to display</p>
        )}
      </div>
    </div>
  );
}
