import { createClient } from "@/lib/supabase/server";
import { getCached, setCache } from "@/lib/redis/cache";
import { CACHE_KEYS, CACHE_TTL } from "@/lib/redis/client";
import type { Tables, UserRole } from "@/types/database";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: UserRole;
}

interface CachedUserData {
  role: UserRole;
  username: string;
  name: string;
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
  const cachedData = await getCached<CachedUserData>(cacheKey);

  if (cachedData) {
    return {
      id: user.id,
      email: user.email!,
      username: cachedData.username,
      name: cachedData.name,
      role: cachedData.role,
    };
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role, username, name")
    .eq("id", user.id)
    .single();

  if (userData) {
    await setCache(cacheKey, { 
      role: userData.role, 
      username: userData.username, 
      name: userData.name 
    }, CACHE_TTL.MEDIUM);
    return {
      id: user.id,
      email: user.email!,
      username: userData.username,
      name: userData.name,
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

