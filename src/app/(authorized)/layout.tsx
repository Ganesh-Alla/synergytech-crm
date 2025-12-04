"use client"
import { redirect } from "next/navigation"
import { useUserStore } from "@/store/userStore"

export default function AuthorizedLayout({ children }: { children: React.ReactNode }) {
    const { user: userData, userLoading, initialized } = useUserStore()

    // Show loading spinner while authentication state is being determined
    // Wait for initialization to complete before making auth decisions

    if (!initialized || userLoading) {
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
        redirect("/login")
    }

    // Render children if authenticated and on correct route
    return <>{children}</>
}