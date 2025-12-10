"use client"

import {
  AlertTriangle,
  GitBranch,
  LayoutDashboard,
} from "lucide-react"

import { NavMain } from "@/components/dashboard/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { NavActions } from "../../dashboard/nav-actions"
import { Separator } from "../../ui/separator"
import { Logo } from "@/components/logo"


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
              <Logo/>
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
