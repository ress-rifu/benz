"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { redirect } from "next/navigation";
import { rateLimit } from "@/lib/redis/rate-limit";
import { headers } from "next/headers";

export async function register(input: RegisterInput) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";

  const rateLimitResult = await rateLimit(`register:${ip}`, 3, 60000);
  if (!rateLimitResult.success) {
    return { error: "Too many registration attempts. Please try again later." };
  }

  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Registration failed" };
  }

  // Create user profile using service client to bypass RLS
  const serviceClient = await createServiceClient();
  
  // Check if this is the first user (make them super_admin)
  const { count } = await serviceClient
    .from("users")
    .select("*", { count: "exact", head: true });

  const role = count === 0 ? "super_admin" : "admin";

  const { error: profileError } = await serviceClient.from("users").insert({
    id: authData.user.id,
    email: parsed.data.email,
    role,
  });

  if (profileError) {
    return { error: "Failed to create user profile" };
  }

  redirect("/dashboard");
}

