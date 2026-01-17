"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { invalidateCache } from "@/lib/redis/cache";
import { CACHE_KEYS } from "@/lib/redis/client";
import { getUser } from "@/lib/auth/get-user";

export async function logout() {
  const user = await getUser();
  if (user) {
    await invalidateCache(CACHE_KEYS.USER_ROLE(user.id));
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

