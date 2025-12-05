"use client"

import {
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function NavActions({
  items,
  title,
}: {
  items: {
    name: string
    url: string
    icon: LucideIcon
    disabled?: boolean
  }[]
  title: string
}) {
  const pathname = usePathname()

  const isActive = (url: string) => pathname.startsWith(url)

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.name} disabled={item.disabled} className={cn(item.disabled ? "text-muted-foreground pointer-events-none" : "", "data-[active=true]:bg-primary data-[active=true]:text-primary-foreground cursor-pointer")}>
              {item.disabled ? (
                <div>
                  <item.icon />
                  <span>{item.name}</span>
                  <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">coming soon</span>
                </div>
              ) : (
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
