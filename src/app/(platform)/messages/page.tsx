import { getUserConversations } from "@/actions/messages";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { T } from "@/components/i18n/T";

export const metadata = {
  title: "Messages | La Famille",
  description: "Your conversations on La Famille",
};

export default async function MessagesPage() {
  const conversations = await getUserConversations();

  return (
    <div className="max-w-7xl mx-auto md:px-6 md:py-6">
      <h1 className="text-2xl md:text-3xl font-semibold text-[#222222] px-4 md:px-0 pt-6 md:pt-0 pb-4 md:pb-6">
        <T k="nav.messages" />
      </h1>

      <div className="md:flex md:border md:border-[#DDDDDD] md:rounded-2xl overflow-hidden md:min-h-[600px]">
        {/* Conversation list */}
        <div className="w-full md:w-80 lg:w-96 md:border-r md:border-[#DDDDDD] flex-shrink-0">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 md:h-full p-8 text-center">
              <MessageCircle className="w-10 h-10 text-[#DDDDDD] mb-4" />
              <p className="font-semibold text-[#222222] mb-1"><T k="messages.no_messages_yet" /></p>
              <p className="text-sm text-[#717171]"><T k="messages.book_to_message" /></p>
            </div>
          ) : (
            <div>
              {conversations.map((conv) => {
                const listing = Array.isArray(conv.listings) ? conv.listings[0] : conv.listings;
                return (
                  <Link
                    key={conv.id}
                    href={`/messages/${conv.id}`}
                    className="flex items-center gap-4 px-5 py-4 border-b border-[#DDDDDD] hover:bg-[#F7F7F7] transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-400 flex-shrink-0 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">H</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#222222] truncate">{listing?.title}</p>
                      <p className="text-sm text-[#717171] truncate">{listing?.location}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop empty state */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-[#DDDDDD] mx-auto mb-4" />
            <p className="text-xl font-semibold text-[#222222] mb-2"><T k="messages.your_messages" /></p>
            <p className="text-[#717171]"><T k="messages.select_conversation" /></p>
          </div>
        </div>
      </div>
    </div>
  );
}
