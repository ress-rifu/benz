import { createClient } from "@/lib/supabase/server";
import { getCached, setCache } from "@/lib/redis/cache";
import { CACHE_KEYS, CACHE_TTL } from "@/lib/redis/client";
import type { Tables, UserRole } from "@/types/database";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export async function getUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const cacheKey = CACHE_KEYS.USER_ROLE(user.id);
  const cachedRole = await getCached<UserRole>(cacheKey);

  if (cachedRole) {
    return {
      id: user.id,
      email: user.email!,
      role: cachedRole,
    };
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData) {
    await setCache(cacheKey, userData.role, CACHE_TTL.MEDIUM);
    return {
      id: user.id,
      email: user.email!,
      role: userData.role,
    };
  }

  return null;
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await requireUser();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  return requireRole(["admin", "super_admin"]);
}

export async function requireSuperAdmin(): Promise<AuthUser> {
  return requireRole(["super_admin"]);
}

export async function getUserProfile(): Promise<Tables<"users"> | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

