"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Key,
  Activity,
  MessageSquare,
  Settings,
  Boxes,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"

const data = {
  user: {
    name: "User",
    email: "user@local.ai",
    avatar: "",
  },
  navMain: [
    {
      title: "API Keys",
      url: "/dashboard/api-keys",
      icon: Key,
    },
    {
      title: "Chat",
      url: "/dashboard/generate",
      icon: MessageSquare,
    },
    {
      title: "Models",
      url: "/dashboard/models",
      icon: Boxes,
    },
    {
      title: "Usage",
      url: "/dashboard/usage",
      icon: Activity,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r bg-white" {...props}>
      <SidebarHeader className="h-16 flex items-center px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-3 group transition-all">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm group-hover:bg-blue-700 transition-colors">
            <Boxes className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold tracking-tight text-foreground">LocalAI</span>
            <span className="truncate text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Engine Control</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-4 py-6">
        <SidebarMenu className="gap-1">
          {data.navMain.map((item) => {
            const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url))
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={<Link href={item.url} />}
                  tooltip={item.title}
                  isActive={isActive}
                  className={cn(
                    "h-10 px-3 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-blue-50 text-blue-600 font-medium border-blue-100 border shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <item.icon className={cn("size-4 shrink-0", isActive ? "text-blue-600" : "text-muted-foreground")} />
                  <span className="text-sm">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t mt-auto bg-slate-50/50">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}