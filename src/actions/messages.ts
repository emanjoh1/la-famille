"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function verifyConversationAccess(
  conversationId: string,
  userId: string
) {
  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select("id, host_id, guest_id")
    .eq("id", conversationId)
    .single();

  if (error || !data) throw new Error("Conversation not found");
  if (data.host_id !== userId && data.guest_id !== userId) {
    throw new Error("Forbidden: not a participant");
  }
  return data;
}

export async function sendMessage(conversationId: string, content: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!content || content.trim().length === 0) {
    throw new Error("Message cannot be empty");
  }
  if (content.length > 5000) {
    throw new Error("Message must be at most 5000 characters");
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

  if (error) throw new Error(error.message || "Failed to send message");

  revalidatePath(`/messages/${conversationId}`);
  return data;
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
