import { getUserConversations } from "@/actions/messages";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export const metadata = {
  title: "Messages | La Famille",
  description: "Your conversations on La Famille",
};

export default async function MessagesPage() {
  const conversations = await getUserConversations();

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <h1 className="text-3xl font-semibold text-[#222222] mb-6">Messages</h1>

      <div className="flex border border-[#DDDDDD] rounded-2xl overflow-hidden min-h-[600px]">
        {/* Left sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-r border-[#DDDDDD] flex-shrink-0">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageCircle className="w-10 h-10 text-[#DDDDDD] mb-4" />
              <p className="font-semibold text-[#222222] mb-1">No messages yet</p>
              <p className="text-sm text-[#717171]">
                When you book a stay, you can message your host here
              </p>
            </div>
          ) : (
            <div>
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className="flex items-center gap-4 px-5 py-4 border-b border-[#DDDDDD]
                             hover:bg-[#F7F7F7] transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex-shrink-0 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">H</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#222222] truncate">
                      {(Array.isArray(conv.listings) ? conv.listings[0] : conv.listings)?.title}
                    </p>
                    <p className="text-sm text-[#717171] truncate">
                      {(Array.isArray(conv.listings) ? conv.listings[0] : conv.listings)?.location}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right panel: empty state */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-[#DDDDDD] mx-auto mb-4" />
            <p className="text-xl font-semibold text-[#222222] mb-2">Your messages</p>
            <p className="text-[#717171]">Select a conversation to read messages</p>
          </div>
        </div>
      </div>
    </div>
  );
}
