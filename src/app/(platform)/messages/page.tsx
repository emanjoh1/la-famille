import { getUserConversations } from "@/actions/messages";
import Link from "next/link";

export default async function MessagesPage() {
  const conversations = await getUserConversations();

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      {conversations.length === 0 ? (
        <p className="text-gray-600">No conversations yet.</p>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              className="block bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
            >
              <h3 className="font-semibold">{conv.listings.title}</h3>
              <p className="text-sm text-gray-600">{conv.listings.location}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
