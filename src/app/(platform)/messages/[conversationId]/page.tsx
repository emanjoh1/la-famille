"use client";

import { useState, useEffect } from "react";
import { getConversation, getMessages, sendMessage } from "@/actions/messages";
import { format } from "date-fns";

export default function ConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [conv, msgs] = await Promise.all([
      getConversation(params.conversationId),
      getMessages(params.conversationId),
    ]);
    setConversation(conv);
    setMessages(msgs);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await sendMessage(params.conversationId, content);
    setContent("");
    loadData();
  };

  if (!conversation) return <div>Loading...</div>;

  return (
    <div className=\"container mx-auto px-6 py-8 max-w-4xl\">
      <h1 className=\"text-2xl font-bold mb-6\">{conversation.listings.title}</h1>
      <div className=\"bg-white rounded-lg shadow p-6 mb-4 h-96 overflow-y-auto\">
        {messages.map((msg) => (
          <div key={msg.id} className=\"mb-4\">
            <p className=\"text-sm text-gray-600\">
              {format(new Date(msg.created_at), \"MMM dd, HH:mm\")}
            </p>
            <p className=\"bg-gray-100 p-3 rounded-lg\">{msg.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className=\"flex gap-2\">
        <input
          type=\"text\"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder=\"Type a message...\"
          className=\"flex-1 px-4 py-2 border rounded-lg\"
        />
        <button
          type=\"submit\"
          className=\"px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700\"
        >
          Send
        </button>
      </form>
    </div>
  );
}
