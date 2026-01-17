"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { redirect } from "next/navigation";
import { rateLimit } from "@/lib/redis/rate-limit";
import { headers } from "next/headers";

export async function login(input: LoginInput) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";
  
  const rateLimitResult = await rateLimit(`login:${ip}`, 5, 60000);
  if (!rateLimitResult.success) {
    return { error: "Too many login attempts. Please try again later." };
  }

  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  const { identifier, password } = parsed.data;
  
  // Check if identifier is an email or username
  const isEmail = identifier.includes("@");
  let email = identifier;
  
  if (!isEmail) {
    // Lookup email by username using admin client to bypass RLS
    const adminClient = createAdminClient();
    const { data: user, error: lookupError } = await adminClient
      .from("users")
      .select("email")
      .eq("username", identifier)
      .single();
    
    if (lookupError || !user) {
      return { error: "Invalid username or password" };
    }
    
    email = user.email;
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Invalid credentials" };
  }

  redirect("/dashboard");
}

