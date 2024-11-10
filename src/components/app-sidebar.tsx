import Image from "next/image";
import {
  Home,
  ArrowLeftRight,
  Scan,
  SquareSquare,
  ChevronDown,
  Github
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";

// Menu links.
const menu_links = [
  {
    title: "SVG to PNG Converter",
    url: "/svg-to-png",
    icon: ArrowLeftRight,
  },
  {
    title: "Square Image Generator",
    url: "/square-image",
    icon: SquareSquare,
  },
  {
    title: "Corner Rounder",
    url: "/rounded-border",
    icon: Scan,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          className="flex items-center gap-2 rounded-xl dark:bg-black bg-white p-3 shadow"
          href="/"
        >
          <Image src="/logo.svg" height={40} width={40} alt="QuickPic Logo" className="p-2 bg-black rounded-xl" />
          <p className="flex flex-col font-bold">
            QuickPick
            <span className="block text-xs font-extralight opacity-50">
              By Theo
            </span>
          </p>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
                <SidebarMenuItem >
                  <SidebarMenuButton asChild>
                    <a href='/'>
                      <Home />
                      <span>Home</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupContent>
                <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full">
                    Tools
                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
                </SidebarGroupLabel>
            </SidebarGroupContent>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menu_links.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
      <SidebarFooter className="p-5">
          <a 
            href="https://github.com/t3dotgg/quickpic" 
            className="text-xs flex items-center gap-2 opacity-50 hover:opacity-100 transition-all" 
            target="_blank"
          >
            <Github size={20} />
            View on GitHub
          </a>
      </SidebarFooter>
    </Sidebar>
  );
}
