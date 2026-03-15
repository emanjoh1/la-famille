import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  return (user.publicMetadata?.role as string) === "admin";
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("site_images")
    .select("*")
    .order("type")
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ images: data });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null;
  const label = formData.get("label") as string | null;

  if (!file || !type) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${type}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("site-images")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from("site-images")
    .getPublicUrl(path);

  const { data, error } = await supabaseAdmin
    .from("site_images")
    .insert({ url: publicUrl, type, label: label || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ image: data });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Get the URL to extract storage path
  const { data: img } = await supabaseAdmin
    .from("site_images")
    .select("url")
    .eq("id", id)
    .single();

  if (img?.url) {
    const url = new URL(img.url);
    const path = url.pathname.split("/object/public/site-images/")[1];
    if (path) await supabaseAdmin.storage.from("site-images").remove([path]);
  }

  const { error } = await supabaseAdmin.from("site_images").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
