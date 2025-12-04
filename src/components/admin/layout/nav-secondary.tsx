import * as React from "react"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
export function NavSecondary({
  items,
}: {
  items: {
    title: string
    url?: string
    icon: LucideIcon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.url ? (
                <SidebarMenuButton asChild className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground cursor-pointer" tooltip={item.title} isActive={false}>
                  <Link href={item.url} className="flex items-center gap-2">
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton onClick={()=>{}} className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground cursor-pointer" tooltip={item.title} isActive={false}>
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
  )
}
