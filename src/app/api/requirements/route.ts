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

        const supabase = await createClient();
        const { data: requirements, error: requirementsError } = await supabase
            .from("requirements")
            .select("*")
            .order("created_at", { ascending: false });
        
        if (requirementsError) {
            console.error("Requirements error:", requirementsError);
            return NextResponse.json({ error: requirementsError.message }, { status: 500 });
        }

        if (!requirements || requirements.length === 0) {
            cachedData = [];
            cacheTimestamp = now;
            return NextResponse.json([]);
        }

        // Update cache
        cachedData = requirements;
        cacheTimestamp = now;

        return NextResponse.json(requirements, {
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
        const { requirement } = await request.json();
        
        if (!requirement) {
            return NextResponse.json(
                { error: "Requirement data is required" },
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


        // Prepare client data
        const now = new Date().toISOString();
        const requirementData = {
            id: requirement.id || randomUUID(),
            client_id: requirement.client_id,
            title: requirement.title,
            description: requirement.description,
            status: requirement.status,
            priority: requirement.priority,
            required_by_date: requirement.required_by_date,
            estimated_budget: requirement.estimated_budget,
            assigned_to: requirement.assigned_to,
            created_by: user.id,
            created_at: now,
            updated_at: now,
        };

        // Insert client - RLS policies will enforce permissions
        const { data: insertedRequirement, error: insertError } = await supabase
            .from("requirements")
            .insert(requirementData)
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

        return NextResponse.json(insertedRequirement);
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
        const { requirement } = await request.json();
        
        if (!requirement || !requirement.id) {
            return NextResponse.json(
                { error: "Requirement ID is required" },
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
            client_id: requirement.client_id,
            title: requirement.title,
            description: requirement.description,
            status: requirement.status,
            priority: requirement.priority,
            required_by_date: requirement.required_by_date,
            estimated_budget: requirement.estimated_budget,
            assigned_to: requirement.assigned_to,
            updated_at: new Date().toISOString(),
        };

        // Update client - RLS policies will enforce permissions
        const { data: updatedRequirement, error: updateError } = await supabase
            .from("requirements")
            .update(updateData)
            .eq("id", requirement.id)
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

        return NextResponse.json(updatedRequirement);
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
        const requirementId = searchParams.get('id');
        
        if (!requirementId) {
            return NextResponse.json(
                { error: "Requirement ID is required" },
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

        // Delete client - RLS policies will enforce permissions
        const { error: deleteError } = await supabase
            .from("clients")
            .delete()
            .eq("id", requirementId);

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
