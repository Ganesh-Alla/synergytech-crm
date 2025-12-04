"use client"

import {
  BadgeCheck,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  User,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useUserStore } from "@/store/userStore"
import { useEffect, useState } from "react"
import { User as UserType } from "@supabase/supabase-js"
import { Skeleton } from "@/components/ui/skeleton"

export function NavUser() {
  const [userProfile, setUserProfile] = useState<UserType | null>(null)
  const { user, userLoading, signOutAsync } = useUserStore()
  const { isMobile } = useSidebar()

  useEffect(() => {
    if (user) {
      setUserProfile(user)
    }
  }, [user])

  if (userLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center justify-center h-full">
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }
  
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage 
                  src={userProfile?.user_metadata.avatar_url} 
                  alt={userProfile?.user_metadata.name}
                  onError={() => {
                    console.log('Avatar image failed to load:', userProfile?.user_metadata.avatar_url)
                  }}
                />
                <AvatarFallback className="rounded-lg"><User className="w-4 h-4" /></AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userProfile?.user_metadata.name}</span>
                <span className="truncate text-xs">{userProfile?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg w-full"
            side={isMobile ? "bottom" : "right"}
            align="end"
            alignOffset={20}
            sideOffset={2}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex flex-col items-center justify-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-16 w-16 rounded-lg">
                  <AvatarImage 
                    src={userProfile?.user_metadata.avatar_url} 
                    alt={userProfile?.user_metadata.name}
                    onError={() => {
                      console.log('Dropdown avatar image failed to load:', userProfile?.user_metadata.avatar_url)
                    }}
                  />
                  <AvatarFallback className="rounded-lg"><User className="w-4 h-4" /></AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-center gap-2 flex-1 text-center text-sm leading-tight">
                  <span className="truncate font-bold text-center">{userProfile?.user_metadata.name}</span>
                  <span className="truncate text-xs text-center">{userProfile?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="flex justify-center">
            <DropdownMenuItem itemType="button" variant="destructive" onClick={() => signOutAsync()} className="w-auto px-4 cursor-pointer">
              <LogOut />
              Log out
            </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="flex gap-2">
              <DropdownMenuItem>
                <BadgeCheck />
                Terms of Service
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Privacy Policy
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
