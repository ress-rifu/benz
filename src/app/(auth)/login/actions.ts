"use server";

import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

