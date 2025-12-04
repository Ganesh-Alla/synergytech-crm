import { NextResponse } from "next/server";
import { createAdmin } from "@/lib/supabase/admin";

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

        // Method 1: Query profiles first
        // Query without ORDER BY (sort in code instead) to avoid slow database sort
        const profilesStartTime = Date.now();
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from("profiles")
            .select("id, full_name, permission, status, created_at");
        const profilesDuration = Date.now() - profilesStartTime;
        
        console.log(`[auth-users] Profiles query took ${profilesDuration}ms, returned ${profiles?.length || 0} records`);

        if (profilesError) {
            console.error("Profiles error:", profilesError);
            return NextResponse.json({ error: profilesError.message }, { status: 500 });
        }

        if (!profiles || profiles.length === 0) {
            cachedData = [];
            cacheTimestamp = now;
            return NextResponse.json([]);
        }

        // Method 2: Get auth users
        const authStartTime = Date.now();
        const { data: authUsersData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        const authDuration = Date.now() - authStartTime;
        
        console.log(`[auth-users] Auth users query took ${authDuration}ms, returned ${authUsersData?.users?.length || 0} records`);

        if (authError) {
            console.error("Auth users error:", authError);
            return NextResponse.json({ error: authError.message }, { status: 500 });
        }

        // Method 3: Join in code and sort
        const joinStartTime = Date.now();
        const emailMap = new Map(
            authUsersData.users.map(user => [user.id, user.email])
        );

        const result = profiles
            .map(profile => ({
                id: profile.id,
                full_name: profile.full_name,
                permission: profile.permission,
                status: profile.status,
                email: emailMap.get(profile.id) || null,
                _created_at: profile.created_at, // Keep for sorting
            }))
            // Sort in code instead of database (much faster without index)
            .sort((a, b) => {
                const aDate = a._created_at ? new Date(a._created_at).getTime() : 0;
                const bDate = b._created_at ? new Date(b._created_at).getTime() : 0;
                return bDate - aDate; // DESC order
            })
            .map(({ _created_at, ...rest }) => rest); // Remove temporary field
        const joinDuration = Date.now() - joinStartTime;
        
        const totalDuration = Date.now() - totalStartTime;
        console.log(`[auth-users] Join in code took ${joinDuration}ms`);
        console.log(`[auth-users] TOTAL: ${totalDuration}ms (Profiles: ${profilesDuration}ms, Auth: ${authDuration}ms, Join: ${joinDuration}ms), returned ${result.length} records`);

        // Update cache
        cachedData = result;
        cacheTimestamp = now;

        return NextResponse.json(result, {
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
        const { user, password } = await request.json();
        
        if (!user || !password) {
            return NextResponse.json(
                { error: "User data and password are required" },
                { status: 400 }
            );
        }

        // Create auth user
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: user.email,
            password: password,
            email_confirm: true,
        });

        if (authError) {
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            );
        }

        if (!authUser.user) {
            return NextResponse.json(
                { error: "Failed to create auth user" },
                { status: 500 }
            );
        }

        // Create profile
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .insert({
                id: authUser.user.id,
                full_name: user.full_name,
                permission: user.permission,
                status: user.status || 'active',
            })
            .select()
            .single();

        if (profileError) {
            // Rollback: delete auth user if profile creation fails
            await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
            return NextResponse.json(
                { error: profileError.message },
                { status: 400 }
            );
        }

        // Invalidate cache
        cachedData = null;
        cacheTimestamp = 0;

        return NextResponse.json({
            id: profile.id,
            full_name: profile.full_name,
            email: authUser.user.email,
            permission: profile.permission,
            status: profile.status,
        });
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
        const { user, password } = await request.json();
        
        if (!user || !user.id) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // Update auth user (email and/or password)
        const updateData: { email?: string; password?: string } = {};
        if (user.email) updateData.email = user.email;
        if (password) updateData.password = password;

        if (Object.keys(updateData).length > 0) {
            const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
                user.id,
                updateData
            );

            if (authError) {
                return NextResponse.json(
                    { error: authError.message },
                    { status: 400 }
                );
            }
        }

        // Update profile
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .update({
                full_name: user.full_name,
                permission: user.permission,
                status: user.status,
            })
            .eq("id", user.id)
            .select()
            .single();

        if (profileError) {
            return NextResponse.json(
                { error: profileError.message },
                { status: 400 }
            );
        }

        // Invalidate cache
        cachedData = null;
        cacheTimestamp = 0;

        // Get email from auth user
        const { data: authUserData } = await supabaseAdmin.auth.admin.getUserById(user.id);
        const email = authUserData?.user?.email || user.email;

        return NextResponse.json({
            id: profile.id,
            full_name: profile.full_name,
            email: email,
            permission: profile.permission,
            status: profile.status,
        });
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
        const userId = searchParams.get('id');
        
        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // Delete profile first
        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .delete()
            .eq("id", userId);

        if (profileError) {
            return NextResponse.json(
                { error: profileError.message },
                { status: 400 }
            );
        }

        // Delete auth user
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authError) {
            return NextResponse.json(
                { error: authError.message },
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