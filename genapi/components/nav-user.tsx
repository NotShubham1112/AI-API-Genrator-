"use client"

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
import { EllipsisVerticalIcon, CircleUserRoundIcon, CreditCardIcon, BellIcon, LogOutIcon, Settings as SettingsIcon } from "lucide-react"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="default" className="aria-expanded:bg-muted h-10 px-2" />
            }
          >
            <Avatar className="size-6 rounded-md grayscale">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-md text-[10px]">CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-xs leading-tight">
              <span className="truncate font-black uppercase tracking-tight">{user.name}</span>
              <span className="truncate text-[10px] text-foreground/50 font-medium">
                {user.email}
              </span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-3 opacity-40" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-48 p-1.5 rounded-xl border-border/40 shadow-2xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-2 py-1.5 text-left text-xs">
                  <Avatar className="size-7 rounded-md">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-md">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight">
                    <span className="truncate font-black uppercase">{user.name}</span>
                    <span className="truncate text-[10px] text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="opacity-50" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="rounded-lg h-9 text-[11px] font-black uppercase tracking-widest" onClick={() => window.location.href='/dashboard/settings'}>
                <SettingsIcon className="size-3.5 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="opacity-50" />
            <DropdownMenuItem onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }} className="rounded-lg h-9 text-[11px] font-black uppercase tracking-widest text-destructive focus:text-destructive focus:bg-destructive/5">
              <LogOutIcon className="size-3.5 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
