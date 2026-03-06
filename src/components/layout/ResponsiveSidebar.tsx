"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcnComponents/tooltip";
import {
  LayoutDashboard,
  ParkingSquare,
  Users,
  FileText,
  AlertTriangle,
  Bell,
  BarChart3,
  Settings,
  PanelRight,
  User,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { useIsMobile } from "@/lib/utils/responsive-utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@/components/shadcnComponents/popover";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Array<"admin" | "operator" | "viewer">;
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "operator", "viewer"],
  },
  {
    name: "Parking Lots",
    href: "/parking-lots",
    icon: ParkingSquare,
    roles: ["admin", "operator", "viewer"],
  },
  {
    name: "Contractors",
    href: "/contractors",
    icon: Users,
    roles: ["admin", "operator", "viewer"],
  },
  {
    name: "Records",
    href: "/records",
    icon: FileText,
    roles: ["admin", "operator", "viewer"],
  },
  {
    name: "Violations",
    href: "/violations",
    icon: AlertTriangle,
    roles: ["admin", "operator", "viewer"],
  },
  {
    name: "Alerts",
    href: "/alerts",
    icon: Bell,
    roles: ["admin", "operator", "viewer"],
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    roles: ["admin", "operator", "viewer"],
  },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["admin"] },
];

export default function ResponsiveSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isMobile = useIsMobile();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setIsOpenMobile(false);
    }
  }, [pathname, isMobile]);

  const filteredNavItems = navItems.filter((item) => {
    if (!session?.user?.role) return true;
    return item.roles.includes(session.user.role);
  });
  useEffect(() => {
    if (isMobile) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        !isCollapsed &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsCollapsed(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCollapsed, isMobile]);
  useEffect(() => {
    const onToggle = (_: Event) => {
      if (isMobile) {
        setIsOpenMobile((v) => !v);
      } else {
        setIsCollapsed((v) => !v);
      }
    };
    const onOpen = (_: Event) => {
      if (isMobile) {
        setIsOpenMobile(true);
      } else {
        setIsCollapsed(false);
      }
    };
    const onClose = (_: Event) => {
      if (isMobile) {
        setIsOpenMobile(false);
      } else {
        setIsCollapsed(true);
      }
    };
    window.addEventListener("sidebar:toggle", onToggle);
    window.addEventListener("sidebar:open", onOpen);
    window.addEventListener("sidebar:close", onClose);
    return () => {
      window.removeEventListener("sidebar:toggle", onToggle);
      window.removeEventListener("sidebar:open", onOpen);
      window.removeEventListener("sidebar:close", onClose);
    };
  }, [isMobile]);
  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
    bg-gray-900 text-white fixed top-0 left-0 h-screen z-50
    transition-all duration-300 ease-in-out
    ${
      isMobile
        ? `w-64 transform ${isOpenMobile ? "translate-x-0" : "-translate-x-full"}`
        : `${isCollapsed ? "w-20" : "w-64"}`
    }
  `}
      >
        <div className="p-4 h-full flex flex-col">
          {/* Toggle (Desktop/Tablet only) */}
          {!isMobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className={`p-2 mb-6 ${isCollapsed ? "m-auto" : "ml-auto"}  rounded-lg bg-gray-800 hover:bg-gray-700 transition self-start`}
                >
                  <PanelRight className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p> {isCollapsed ? "Open Sidebar" : "Collapse Sidebar"}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Nav Items */}
          <nav className="flex-1 space-y-2">
            {filteredNavItems.map((item ,idx) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isMobile && setIsOpenMobile(false)}
                  className={`
                    flex items-center rounded-lg px-3 py-3 transition
                    ${
                      active
                        ? "bg-blue-500 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }
                    ${!isMobile && isCollapsed ? "justify-center" : "space-x-4"}
                  `}
                >
                  <Tooltip  key={idx}>
                    <TooltipTrigger asChild>
                      <div className="flex gap-3 items-center">
                      <Icon className="w-5 h-5 shrink-0" />
                      {(!isCollapsed || isMobile) && (
                        <span className="font-medium truncate">
                          {item.name}
                        </span>
                      )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent >
                      <p className="font-medium truncate">{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className=" pt-4 mt-4">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={`
                    w-full flex items-center rounded-full p-2 transition
                    text-gray-300 hover:bg-gray-800 hover:text-white
                    ${!isMobile && isCollapsed ? "justify-center" : "space-x-3"}
                  `}
                >
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center shrink-0">
                      <User
                        className="w-5 h-5 text-gray-300"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  {(!isCollapsed || isMobile) && (
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-sm font-medium text-white truncate">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate capitalize">
                        {session?.user?.role || "viewer"}
                      </p>
                    </div>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                side={!isMobile && isCollapsed ? "right" : "top"}
                align="start"
                className="w-64 bg-gray-800 border-gray-700 text-white"
              >
                <PopoverHeader className="border-b border-gray-700 pb-3 mb-3">
                  <PopoverTitle className="text-white">
                    {session?.user?.name}
                  </PopoverTitle>
                  <PopoverDescription className="text-gray-400 text-xs">
                    {session?.user?.email}
                  </PopoverDescription>
                  <p className="text-xs text-gray-400 capitalize mt-1">
                    Role: {session?.user?.role || "viewer"}
                  </p>
                </PopoverHeader>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </aside>
    </>
  );
}
