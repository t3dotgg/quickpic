import Image from "next/image";
import Link from "next/link";

/**
 * Icons
 */
import {
  Home,
  ArrowLeftRight,
  Scan,
  SquareSquare,
  ChevronDown,
  Github,
} from "lucide-react";

/**
 * Components
 */
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
          className="flex items-center gap-2 rounded-xl bg-white p-3 shadow dark:bg-black"
          href="/"
        >
          <Image
            src="/logo.svg"
            height={40}
            width={40}
            alt="QuickPic Logo"
            className="rounded-xl bg-black p-2"
          />
          <p className="flex flex-col font-bold">
            QuickPic
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
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/">
                    <Home />
                    <span>Home</span>
                  </Link>
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
          className="flex items-center gap-2 text-xs opacity-50 transition-all hover:opacity-100"
          target="_blank"
        >
          <Github size={20} />
          View on GitHub
        </a>
      </SidebarFooter>
    </Sidebar>
  );
}
