import { NextResponse } from "next/server";
import { createAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

// Create admin client once and reuse (better for connection pooling)
const supabaseAdmin = createAdmin()

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

        const totalStartTime = Date.now();

        // Query leads table
        const leadsStartTime = Date.now();
        const { data: leads, error: leadsError } = await supabaseAdmin
            .from("leads")
            .select("*")
            .order("created_at", { ascending: false });
        const leadsDuration = Date.now() - leadsStartTime;
        
        console.log(`[leads] Leads query took ${leadsDuration}ms, returned ${leads?.length || 0} records`);

        if (leadsError) {
            console.error("Leads error:", leadsError);
            return NextResponse.json({ error: leadsError.message }, { status: 500 });
        }

        if (!leads || leads.length === 0) {
            cachedData = [];
            cacheTimestamp = now;
            return NextResponse.json([]);
        }

        const totalDuration = Date.now() - totalStartTime;
        console.log(`[leads] TOTAL: ${totalDuration}ms, returned ${leads.length} records`);

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
            client_id: lead.client_id || null,
            contact_name: lead.contact_name,
            contact_email: lead.contact_email,
            contact_phone: lead.contact_phone || null,
            company_name: lead.company_name || null,
            source: lead.source,
            status: lead.status,
            assigned_to: lead.assigned_to || null,
            follow_up_at: lead.follow_up_at || null,
            last_interaction_at: lead.last_interaction_at || null,
            notes: lead.notes || null,
            created_by: lead.created_by || user.id,
            created_at: lead.created_at || now,
            updated_at: now,
        };

        // Insert lead
        const { data: insertedLead, error: insertError } = await supabaseAdmin
            .from("leads")
            .insert(leadData)
            .select()
            .single();

        if (insertError) {
            return NextResponse.json(
                { error: insertError.message },
                { status: 400 }
            );
        }

        // Invalidate cache
        cachedData = null;
        cacheTimestamp = 0;

        return NextResponse.json(insertedLead);
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

        // Prepare update data
        const updateData = {
            client_id: lead.client_id ?? null,
            contact_name: lead.contact_name,
            contact_email: lead.contact_email,
            contact_phone: lead.contact_phone ?? null,
            company_name: lead.company_name ?? null,
            source: lead.source,
            status: lead.status,
            assigned_to: lead.assigned_to ?? null,
            follow_up_at: lead.follow_up_at ?? null,
            last_interaction_at: lead.last_interaction_at ?? null,
            notes: lead.notes ?? null,
            updated_at: new Date().toISOString(),
        };

        // Update lead
        const { data: updatedLead, error: updateError } = await supabaseAdmin
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

        return NextResponse.json(updatedLead);
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

        // Delete lead
        const { error: deleteError } = await supabaseAdmin
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
