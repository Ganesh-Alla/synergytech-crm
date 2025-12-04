"use client"

import {
  AlertTriangle,
  BarChart3,
  Database,
  GitBranch,
  Globe,
  Key,
  LayoutDashboard,
  Package,
  Send,
  Settings,
  Wrench,
} from "lucide-react"

import { NavMain } from "@/components/admin/layout/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import { NavActions } from "./nav-actions"
import { NavSecondary } from "./nav-secondary"
import { Separator } from "../../ui/separator"
import Link from "next/link"


const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,

    },
  ],
  actions: [
    {
      name: "Users",
      url: "/admin/users",
      icon: GitBranch,
    },
    {
      name: "Audits",
      url: "/admin/audits",
      icon: AlertTriangle,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuButton
            asChild
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Link 
              href="/app" 
              className="flex items-center gap-2 group-hover:text-sidebar-accent-foreground transition-colors"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-serif text-base font-semibold transition-all duration-200">
                S
              </span>
              <span className="group-data-[collapsible=icon]:hidden font-serif text-base font-semibold text-sidebar-foreground transition-all duration-200">
                SynergyTech CRM
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenu>
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <Separator/>
      <SidebarContent>
        <NavActions title="Actions" items={data.actions} />
      </SidebarContent>
    </Sidebar>
  )
}
