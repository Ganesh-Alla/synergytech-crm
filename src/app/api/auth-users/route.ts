import { NextResponse } from "next/server";
import { createAdmin } from "@/lib/supabase/admin";

const supabaseAdmin = createAdmin()

export async function GET() {
    // Call RPC function to get profiles with auth user emails
    const { data, error } = await supabaseAdmin.rpc("get_auth_users")

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
}