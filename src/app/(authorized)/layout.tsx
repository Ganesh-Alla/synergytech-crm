"use client"
import { redirect } from "next/navigation"
import { useUserStore } from "@/store/userStore"
import { AuthUserStoreInitializer } from "@/providers/InitStore"

export default function AuthorizedLayout({ children }: { children: React.ReactNode }) {
    const { user: userData, initialized, userLoading } = useUserStore()

    // Show loading spinner only if not initialized OR (loading AND no user data yet)
    // This prevents the spinner flash when navigating back with existing user data
    if (!initialized || (userLoading && !userData)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    }

    // Redirect to login if not authenticated (only after initialization)
    if (!userData) {
        redirect("/")
    }

    // Render children if authenticated
    return <>{children}
    <AuthUserStoreInitializer />
    </>
}