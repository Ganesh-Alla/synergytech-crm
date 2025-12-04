"use client"
import { redirect } from "next/navigation"
import { useUserStore } from "@/store/userStore"

export default function NonAdminLayout({ children }: { children: React.ReactNode }) {
    const {  user } = useUserStore()


        // Redirect based on role
        if (["admin", "super_admin"].includes(user?.permission ?? "")) {
            // admins should never see Non-admin routes
            redirect("/admin");
          }

    // Render children if authenticated and on correct route
    return <>{children}</>
}