"use client"

import {
  ArrowRightLeft,
  BarChart3,
  Building,
  CalendarDays,
  FileText,
  GitBranch,
  LayoutDashboard,
  Mail,
  MessageSquareQuote,
  Receipt,
  Users,
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
      url: "/app",
      icon: LayoutDashboard,

    },
  ],
  actions: [
    {
      name: "Leads Tracker",
      url: "/app/leads",
      icon: GitBranch,
    },
    {
      name: "Clients",
      url: "/app/clients",
      icon: Users,
    },
    {
      name:"Requirements",
      url: "/app/requirements",
      icon: FileText,
    },
    {
      name:"Vendors",
      url: "/app/vendors",
      icon: Building,
    },
    {
      name:"Sales",
      url: "/app/sales",
      icon: BarChart3,
    },
    {
      name:"Follow Ups",
      url: "/app/follow-ups",
      icon: CalendarDays,
    },{
      name:"Marketing Campaigns",
      url: "/app/marketing-campaigns",
      icon: Mail,
    },
    {
      name:"Quotes",
      url: "/app/quotes",
      icon: MessageSquareQuote,
    },
    {
      name:"Expenses",
      url: "/app/expenses",
      icon: Receipt,
    },
    {
      name:"Transactions",
      url: "/app/transactions",
      icon: ArrowRightLeft,
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
