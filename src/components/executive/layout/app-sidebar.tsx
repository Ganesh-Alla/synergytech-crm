"use client"

import {
  CalendarDays,
  GitBranch,
  LayoutDashboard,
  Mail,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/executive/layout/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { NavActions } from "../../dashboard/nav-actions"
import { Separator } from "../../ui/separator"
import Link from "next/link"


const data = {
  navMain: [
    {
      title: "Sales Dashboard",
      url: "/app",
      icon: LayoutDashboard,

    },
  ],
  actions: [
    {
      name: "Leads Tracker",
      url: "/app/leads-tracker",
      icon: GitBranch,
    },
    {
      name: "Clients",
      url: "/app/clients",
      icon: Users,
    },
    {
      name:"Follow Ups",
      url: "/app/follow-ups",
      icon: CalendarDays,
    },{
      name:"Marketing Campaigns",
      url: "/app/marketing-campaigns",
      icon: Mail,
    }
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
