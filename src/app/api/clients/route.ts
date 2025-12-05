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

// Function to generate next client code (C001, C002, etc.)
async function generateClientCode(): Promise<string> {
  const { data: lastClient, error } = await supabaseAdmin
    .from("clients")
    .select("client_code")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error("Error fetching last client code:", error);
    // Fallback to C001 if there's an error
    return "C001";
  }

  if (!lastClient || !lastClient.client_code) {
    return "C001";
  }

  // Extract number from client_code (e.g., "C001" -> 1)
  const match = lastClient.client_code.match(/^C(\d+)$/);
  if (!match) {
    // If format is unexpected, start from C001
    return "C001";
  }

  const lastNumber = parseInt(match[1], 10);
  const nextNumber = lastNumber + 1;
  
  // Format as C001, C002, etc. (3 digits minimum)
  return `C${nextNumber.toString().padStart(3, '0')}`;
}

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

        // Query clients table
        const clientsStartTime = Date.now();
        const { data: clients, error: clientsError } = await supabaseAdmin
            .from("clients")
            .select("*")
            .order("created_at", { ascending: false });
        const clientsDuration = Date.now() - clientsStartTime;
        
        console.log(`[clients] Clients query took ${clientsDuration}ms, returned ${clients?.length || 0} records`);

        if (clientsError) {
            console.error("Clients error:", clientsError);
            return NextResponse.json({ error: clientsError.message }, { status: 500 });
        }

        if (!clients || clients.length === 0) {
            cachedData = [];
            cacheTimestamp = now;
            return NextResponse.json([]);
        }

        const totalDuration = Date.now() - totalStartTime;
        console.log(`[clients] TOTAL: ${totalDuration}ms, returned ${clients.length} records`);

        // Update cache
        cachedData = clients;
        cacheTimestamp = now;

        return NextResponse.json(clients, {
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
        const { client } = await request.json();
        
        if (!client) {
            return NextResponse.json(
                { error: "Client data is required" },
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

        // Generate client_code if not provided
        const clientCode = client.client_code || await generateClientCode();

        // Prepare client data
        const now = new Date().toISOString();
        const clientData = {
            id: client.id || randomUUID(),
            client_code: clientCode,
            company_name: client.company_name || null,
            contact_name: client.contact_name,
            contact_email: client.contact_email,
            contact_phone: client.contact_phone || null,
            industry: client.industry || null,
            website: client.website || null,
            source: client.source,
            account_owner: client.account_owner || null,
            next_follow_up_at: client.next_follow_up_at || null,
            last_interaction_at: client.last_interaction_at || null,
            notes: client.notes || null,
            created_by: client.created_by || user.id,
            created_at: client.created_at || now,
            updated_at: now,
        };

        // Insert client
        const { data: insertedClient, error: insertError } = await supabaseAdmin
            .from("clients")
            .insert(clientData)
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

        return NextResponse.json(insertedClient);
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
        const { client } = await request.json();
        
        if (!client || !client.id) {
            return NextResponse.json(
                { error: "Client ID is required" },
                { status: 400 }
            );
        }

        // Prepare update data (don't update client_code)
        const updateData = {
            company_name: client.company_name ?? null,
            contact_name: client.contact_name,
            contact_email: client.contact_email,
            contact_phone: client.contact_phone ?? null,
            industry: client.industry ?? null,
            website: client.website ?? null,
            source: client.source,
            account_owner: client.account_owner ?? null,
            next_follow_up_at: client.next_follow_up_at ?? null,
            last_interaction_at: client.last_interaction_at ?? null,
            notes: client.notes ?? null,
            updated_at: new Date().toISOString(),
        };

        // Update client
        const { data: updatedClient, error: updateError } = await supabaseAdmin
            .from("clients")
            .update(updateData)
            .eq("id", client.id)
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

        return NextResponse.json(updatedClient);
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
        const clientId = searchParams.get('id');
        
        if (!clientId) {
            return NextResponse.json(
                { error: "Client ID is required" },
                { status: 400 }
            );
        }

        // Delete client
        const { error: deleteError } = await supabaseAdmin
            .from("clients")
            .delete()
            .eq("id", clientId);

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
