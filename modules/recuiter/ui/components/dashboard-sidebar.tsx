"use client";
import {
  BriefcaseIcon,
  LayoutDashboardIcon,
  Search,
  Users2Icon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Jobs",
    url: "/dashboard/jobs",
    icon: BriefcaseIcon,
  },
  {
    title: "Applicants",
    url: "/dashboard/applicants",
    icon: Users2Icon,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center gap-x-2">
            <Link href="/">
              <Image
                src="/assets/icons/logo1.png"
                height={80}
                width={80}
                alt="Talentra"
              />
            </Link>
          </div>
          <SidebarGroupContent className="py-10">
            <SidebarMenu className="gap-y-3">
              {items.map((item) => {
                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem
                    key={item.title}
                    className={cn(
                      "rounded-md transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : ""
                    )}
                  >
                    <SidebarMenuButton asChild>
                      <Link href={item.url} className="flex items-center gap-2">
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
