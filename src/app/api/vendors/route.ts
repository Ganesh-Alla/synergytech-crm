import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Cache configuration
const CACHE_DURATION = 30 * 1000; // 30 seconds
let cachedData: unknown = null;
let cacheTimestamp = 0;

// Function to generate next vendor code (V001, V002, etc.)
// Uses anon key - RLS policies must allow SELECT for this to work
async function generateVendorCode(supabase: Awaited<ReturnType<typeof createClient>>): Promise<string> {
  const { data: lastVendor, error } = await supabase
    .from("vendors")
    .select("vendor_code")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error("Error fetching last vendor code:", error);
    // Fallback to V001 if there's an error
    return "V001";
  }

  if (!lastVendor || !lastVendor.vendor_code) {
    return "V001";
  }

  // Extract number from vendor_code (e.g., "V001" -> 1)
  const match = lastVendor.vendor_code.match(/^V(\d+)$/);
  if (!match) {
    // If format is unexpected, start from V001
    return "V001";
  }

  const lastNumber = parseInt(match[1], 10);
  const nextNumber = lastNumber + 1;
  
  // Format as V001, V002, etc. (3 digits minimum)
  return `V${nextNumber.toString().padStart(3, '0')}`;
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

        // Query vendors table
        const supabase = await createClient();
        const { data: vendors, error: vendorsError } = await supabase
            .from("vendors")
            .select("*")
            .order("created_at", { ascending: false });
        

        if (vendorsError) {
            console.error("Vendors error:", vendorsError);
            return NextResponse.json({ error: vendorsError.message }, { status: 500 });
        }

        if (!vendors || vendors.length === 0) {
            cachedData = [];
            cacheTimestamp = now;
            return NextResponse.json([]);
        }

        // Update cache
        cachedData = vendors;
        cacheTimestamp = now;

        return NextResponse.json(vendors, {
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
        const { vendor } = await request.json();
        
        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor data is required" },
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

        // Generate vendor_code if not provided
        const vendorCode = vendor.vendor_code || await generateVendorCode(supabase);

        // Prepare vendor data
        const now = new Date().toISOString();
        const vendorData = {
            id: vendor.id || randomUUID(),
            vendor_code: vendorCode,
            company_name: vendor.company_name || null,
            contact_name: vendor.contact_name,
            contact_email: vendor.contact_email,
            contact_phone: vendor.contact_phone || null,
            gst_number: vendor.gst_number || null,
            address: vendor.address || null,
            payment_terms: vendor.payment_terms || null,
            status: vendor.status || 'active',
            notes: vendor.notes || null,
            created_by: vendor.created_by || user.id,
            created_at: vendor.created_at || now,
            updated_at: now,
        };

        // Insert vendor - RLS policies will enforce permissions
        const { data: insertedVendor, error: insertError } = await supabase
            .from("vendors")
            .insert(vendorData)
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

        return NextResponse.json(insertedVendor);
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
        const { vendor } = await request.json();
        
        if (!vendor || !vendor.id) {
            return NextResponse.json(
                { error: "Vendor ID is required" },
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
            vendor_code: vendor.vendor_code || '',
            company_name: vendor.company_name ?? null,
            contact_name: vendor.contact_name,
            contact_email: vendor.contact_email,
            contact_phone: vendor.contact_phone ?? null,
            gst_number: vendor.gst_number ?? null,
            address: vendor.address ?? null,
            payment_terms: vendor.payment_terms ?? null,
            status: vendor.status ?? 'active',
            notes: vendor.notes ?? null,
            updated_at: new Date().toISOString(),
        };

        // Update vendor - RLS policies will enforce permissions
        const { data: updatedVendor, error: updateError } = await supabase
            .from("vendors")
            .update(updateData)
            .eq("id", vendor.id)
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

        return NextResponse.json(updatedVendor);
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
        const vendorId = searchParams.get('id');
        
        if (!vendorId) {
            return NextResponse.json(
                { error: "Vendor ID is required" },
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

        // Delete vendor - RLS policies will enforce permissions
        const { error: deleteError } = await supabase
            .from("vendors")
            .delete()
            .eq("id", vendorId);

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
