"use client"

import type { LucideIcon } from "lucide-react"
import Link from "next/link"

import { usePathname } from "next/navigation"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"


export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const pathname = usePathname()
 

  const isActive = (url: string) => {
    // For /admin, only match exactly
    if (url === "/admin") {
      return pathname === "/admin"
    }
    // For other routes, match if pathname starts with the URL followed by / or end of string
    return pathname === url || pathname.startsWith(url )
  }

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground cursor-pointer" tooltip={item.title} isActive={isActive(item.url)}>
              <Link href={item.url}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
