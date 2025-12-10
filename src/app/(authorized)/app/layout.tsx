"use client"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/executive/layout/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { AuthUserStoreInitializer, ClientsStoreInitializer, LeadsStoreInitializer, VendorsStoreInitializer } from "@/providers/InitStore";
import { useUserStore } from "@/store/userStore"

export default function NonAdminLayout({ children }: { children: React.ReactNode }) {
    const {  user } = useUserStore()


        // Redirect based on role
        if (["admin", "super_admin"].includes(user?.permission ?? "")) {
            // Non-super_admins should never see admin routes
            redirect("/admin");
          }

    // Render children if authenticated and on correct route
    return (
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 60)",
              "--header-height": "calc(var(--spacing) * 16)",
            } as React.CSSProperties
          }
        //   className="flex h-svh w-full overflow-hidden"
        >
          <AppSidebar />
          <SidebarInset
            className={cn(
              // Set content container, so we can use container queries
              '@container/content',

              // If layout is fixed, set the height
              // to 100svh to prevent overflow
              'has-data-[layout=fixed]:h-svh',

              // If layout is fixed and sidebar is inset,
              // set the height to 100svh - spacing (total margins) to prevent overflow
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            <SiteHeader fixed/>
            {children}
          </SidebarInset>
          <AuthUserStoreInitializer />
          <ClientsStoreInitializer />
          <LeadsStoreInitializer />
          <VendorsStoreInitializer />
        </SidebarProvider>
    )
}