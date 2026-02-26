"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  getConversation,
  getMessages,
  getUserConversations,
  sendMessage,
} from "@/actions/messages";
import { format } from "date-fns";
import Link from "next/link";
import { Send, MessageCircle } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import type { Message, Conversation } from "@/types/database";

interface ConversationWithListing extends Conversation {
  listings?: { id: string; title: string; location: string; images?: string[] } | null;
}

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<ConversationWithListing | null>(null);
  const [conversations, setConversations] = useState<ConversationWithListing[]>([]);
  const [content, setContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      loadData();
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadData = async () => {
    if (!conversationId) return;
    try {
      const [conv, msgs, allConvs] = await Promise.all([
        getConversation(conversationId),
        getMessages(conversationId),
        getUserConversations(),
      ]);
      setConversation(conv);
      setMessages(msgs);
      setConversations(allConvs.map(c => {
        const listing = Array.isArray(c.listings) ? c.listings[0] : c.listings;
        return {
          id: c.id,
          listing_id: c.listing_id,
          host_id: c.host_id,
          guest_id: c.guest_id,
          created_at: c.created_at,
          listings: listing
        };
      }));
    } catch (error) {
      console.error("Failed to load conversation:", error);
      setTimeout(() => loadData(), 1000);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !conversationId) return;
    const result = await sendMessage(conversationId, content);
    if ("error" in result) {
      console.error("Send message error:", result.error);
      return;
    }
    setContent("");
    loadData();
  };

  if (!conversation) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-6 h-[600px] flex items-center justify-center">
        <div className="text-[#717171]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <h1 className="text-3xl font-semibold text-[#222222] mb-6">Messages</h1>

      <div
        className="flex border border-[#DDDDDD] rounded-2xl overflow-hidden"
        style={{ height: "calc(100vh - 240px)", minHeight: "500px" }}
      >
        {/* Left sidebar */}
        <div className="w-80 lg:w-96 border-r border-[#DDDDDD] flex-shrink-0 overflow-y-auto">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              className={`flex items-center gap-4 px-5 py-4 border-b border-[#DDDDDD]
                          hover:bg-[#F7F7F7] transition-colors
                          ${conv.id === conversationId ? "bg-[#F7F7F7]" : ""}`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex-shrink-0 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">H</span>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`truncate text-sm ${
                    conv.id === conversationId
                      ? "font-semibold text-[#222222]"
                      : "font-medium text-[#222222]"
                  }`}
                >
                  {conv.listings?.title}
                </p>
                <p className="text-xs text-[#717171] truncate">
                  {conv.listings?.location}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Right: Message thread */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Thread header */}
          <div className="px-6 py-4 border-b border-[#DDDDDD] flex-shrink-0">
            <p className="font-semibold text-[#222222]">
              {conversation.listings?.title}
            </p>
            <p className="text-sm text-[#717171]">
              {conversation.listings?.location}
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="w-10 h-10 text-[#DDDDDD] mb-3" />
                <p className="text-[#717171] text-sm">No messages yet. Say hello!</p>
              </div>
            )}
            {messages.map((msg) => {
              const isOwn = msg.sender_id === userId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[70%]">
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm ${
                        isOwn
                          ? "bg-[#1E3A8A] text-white rounded-br-sm"
                          : "bg-[#F7F7F7] text-[#222222] rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <p
                      className={`text-xs text-[#717171] mt-1 ${
                        isOwn ? "text-right" : "text-left"
                      }`}
                    >
                      {format(new Date(msg.created_at), "MMM d, HH:mm")}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <form
            onSubmit={handleSend}
            className="px-6 py-4 border-t border-[#DDDDDD] flex items-center gap-3 flex-shrink-0"
          >
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Message your host..."
              className="flex-1 px-5 py-3 border border-[#DDDDDD] rounded-full text-sm
                         text-[#222222] placeholder-[#717171] focus:outline-none
                         focus:border-[#222222] transition-colors"
            />
            <button
              type="submit"
              disabled={!content.trim()}
              className="p-3 bg-[#1E3A8A] text-white rounded-full hover:bg-[#1E40AF]
                         disabled:bg-[#DDDDDD] transition-colors flex-shrink-0"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
