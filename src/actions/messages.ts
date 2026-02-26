"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function verifyConversationAccess(
  conversationId: string,
  userId: string
) {
  console.log("Verifying conversation:", conversationId, "for user:", userId);
  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select("id, host_id, guest_id")
    .eq("id", conversationId)
    .single();

  console.log("Conversation query result:", { data, error });
  if (error || !data) throw new Error("Conversation not found");
  if (data.host_id !== userId && data.guest_id !== userId) {
    throw new Error("Forbidden: not a participant");
  }
  return data;
}

export async function sendMessage(conversationId: string, content: string): Promise<{ error: string } | { data: any }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!content || content.trim().length === 0) {
    return { error: "Message cannot be empty" };
  }
  if (content.length > 5000) {
    return { error: "Message must be at most 5000 characters" };
  }

  // Verify user is part of this conversation
  await verifyConversationAccess(conversationId, userId);

  const { data, error } = await supabaseAdmin
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) return { error: error.message || "Failed to send message" };

  revalidatePath(`/messages/${conversationId}`);
  return { data };
}

export async function getConversation(conversationId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select("*, listings(id, title, location, images)")
    .eq("id", conversationId)
    .single();

  if (error) throw new Error(error.message || "Conversation not found");

  if (data.host_id !== userId && data.guest_id !== userId) {
    throw new Error("Forbidden: not a participant");
  }

  return data;
}

export async function getMessages(conversationId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify user is part of this conversation
  await verifyConversationAccess(conversationId, userId);

  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message || "Failed to load messages");
  return data;
}

export async function getUserConversations() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select(
      "id, listing_id, host_id, guest_id, created_at, listings(id, title, location, images)"
    )
    .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
  return data || [];
}

export async function getOrCreateConversation(listingId: string, hostId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { data: existing } = await supabaseAdmin
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .eq("guest_id", userId)
    .eq("host_id", hostId)
    .single();

  if (existing) return existing.id;

  const { data: newConv, error } = await supabaseAdmin
    .from("conversations")
    .insert({
      listing_id: listingId,
      host_id: hostId,
      guest_id: userId,
    })
    .select("id")
    .single();

  if (error) throw new Error("Failed to create conversation");
  return newConv.id;
}
