import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Cache configuration
const CACHE_DURATION = 30 * 1000; // 30 seconds
let cachedData: unknown = null;
let cacheTimestamp = 0;

export async function GET() {
    try {
        // Check cache first
        const now = Date.now();
        if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
            return NextResponse.json(cachedData, {
                headers: {
                    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
                },
            });
        }

        // Get authenticated user - RLS will filter based on permissions
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Query leads table
        const { data: leads, error: leadsError } = await supabase
            .from("leads")
            .select("*")
            .order("created_at", { ascending: false });
        
        if (leadsError) {
            console.error("Leads error:", leadsError);
            return NextResponse.json({ error: leadsError.message }, { status: 500 });
        }

        if (!leads || leads.length === 0) {
            cachedData = [];
            cacheTimestamp = now;
            return NextResponse.json([]);
        }

        // Update cache
        cachedData = leads;
        cacheTimestamp = now;

        return NextResponse.json(leads, {
            headers: {
                'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
            },
        });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { lead } = await request.json();
        
        if (!lead) {
            return NextResponse.json(
                { error: "Lead data is required" },
                { status: 400 }
            );
        }

        // Get current user for created_by
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        // Prepare lead data
        const now = new Date().toISOString();
        const leadData = {
            id: lead.id || randomUUID(),
            client_code: lead.client_code || null,
            contact_name: lead.contact_name,
            contact_email: lead.contact_email,
            contact_phone: lead.contact_phone || null,
            source: lead.source,
            status: lead.status,
            assigned_to: lead.assigned_to || null,
            follow_up_at: lead.follow_up_at || null,
            notes: lead.notes || null,
            created_by: user.id, // Always use the authenticated user's ID
            created_at: lead.created_at || now,
            updated_at: now,
        };

        // Insert lead - RLS policies will enforce permissions
        const { error: insertError } = await supabase
            .from("leads")
            .insert(leadData)
            .select()
            .single();

        if (insertError) {
            console.error("Insert error:", insertError);
            return NextResponse.json(
                { error: insertError.message },
                { status: 400 }
            );
        }

        // Invalidate cache
        cachedData = null;
        cacheTimestamp = 0;

        return NextResponse.json({ message: "Success" }, { status: 200 });
    } catch (error) {
        console.error("POST API error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const { lead } = await request.json();
        
        if (!lead || !lead.id) {
            return NextResponse.json(
                { error: "Lead ID is required" },
                { status: 400 }
            );
        }

        // Get authenticated user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Prepare update data
        const updateData = {
            client_code: lead.client_code ?? null,
            contact_name: lead.contact_name,
            contact_email: lead.contact_email,
            contact_phone: lead.contact_phone ?? null,
            source: lead.source,
            status: lead.status,
            assigned_to: lead.assigned_to ?? null,
            follow_up_at: lead.follow_up_at ?? null,
            notes: lead.notes ?? null,
            updated_at: new Date().toISOString(),
        };

        // Update lead - RLS policies will enforce permissions
        const { error: updateError } = await supabase
            .from("leads")
            .update(updateData)
            .eq("id", lead.id)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json(
                { error: updateError.message },
                { status: 400 }
            );
        }

        // Invalidate cache
        cachedData = null;
        cacheTimestamp = 0;

        // Enrich the updated lead with client_code and assigned_to_name
        return NextResponse.json({ message: "Success" }, { status: 200 });
    } catch (error) {
        console.error("PUT API error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const leadId = searchParams.get('id');
        
        if (!leadId) {
            return NextResponse.json(
                { error: "Lead ID is required" },
                { status: 400 }
            );
        }

        // Get authenticated user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Delete lead - RLS policies will enforce permissions
        const { error: deleteError } = await supabase
            .from("leads")
            .delete()
            .eq("id", leadId);

        if (deleteError) {
            return NextResponse.json(
                { error: deleteError.message },
                { status: 400 }
            );
        }

        // Invalidate cache
        cachedData = null;
        cacheTimestamp = 0;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE API error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        );
    }
}
