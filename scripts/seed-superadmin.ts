/**
 * Seed script to create the initial superadmin user.
 * Run: npx tsx scripts/seed-superadmin.ts
 * Requires .env with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database";

const USERNAME = "rifu";
const PASSWORD = "12345678";
const EMAIL = "rifu@benz.local";
const NAME = "Rifu";
const ROLE = "super_admin" as const;

async function seedSuperAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secretKey) {
    console.error(
      "Missing env: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY required"
    );
    process.exit(1);
  }

  const supabase = createClient<Database>(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Check if username already exists
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("username", USERNAME.toLowerCase())
    .single();

  if (existing) {
    console.log(`Superadmin "${USERNAME}" already exists.`);
    return;
  }

  // Create in Supabase Auth
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
    });

  if (authError) {
    if (authError.message.includes("already registered")) {
      // User exists in auth but maybe not in users table - try to link
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const existingAuth = authUsers?.users?.find((u) => u.email === EMAIL);
      if (existingAuth) {
        const { error: insertError } = await supabase.from("users").insert({
          id: existingAuth.id,
          email: EMAIL,
          username: USERNAME.toLowerCase(),
          name: NAME,
          role: ROLE,
        });
        if (insertError) {
          console.error("Failed to add user to users table:", insertError.message);
          process.exit(1);
        }
        console.log(`Superadmin "${USERNAME}" linked to existing auth user.`);
        return;
      }
    }
    console.error("Auth error:", authError.message);
    process.exit(1);
  }

  if (!authData.user) {
    console.error("Failed to create auth user");
    process.exit(1);
  }

  // Insert into users table
  const { error: dbError } = await supabase.from("users").insert({
    id: authData.user.id,
    email: EMAIL,
    username: USERNAME.toLowerCase(),
    name: NAME,
    role: ROLE,
  });

  if (dbError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    console.error("DB error:", dbError.message);
    process.exit(1);
  }

  console.log(`Superadmin created successfully!`);
  console.log(`  Username: ${USERNAME}`);
  console.log(`  Password: ${PASSWORD}`);
  console.log(`  Email: ${EMAIL}`);
}

seedSuperAdmin();
