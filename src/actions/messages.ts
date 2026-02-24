"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function sendMessage(conversationId: string, content: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { data, error } = await supabaseAdmin
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: userId,
      content,
    })
    .select()
    .single();

  if (error) throw new Error(error.message || "Failed to send message");

  revalidatePath(`/messages/${conversationId}`);
  return data;
}

export async function getConversation(conversationId: string) {
  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select("*, listings(*)")
    .eq("id", conversationId)
    .single();

  if (error) throw new Error(error.message || "Conversation not found");
  return data;
}

export async function getMessages(conversationId: string) {
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
    .select("*, listings(*)")
    .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
  return data || [];
}
