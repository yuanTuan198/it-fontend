import { cn } from "@/lib/utils";
import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import {
  CheckCircle2,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  ListCheck,
  LogOut,
  Settings,
  Users,
  Wrench,
  Wallpaper
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { SidebarNav } from "./sidebar-nav";

export const SidebarComponent = ({
  currentWorkspace,
}: {
  currentWorkspace: Workspace | null;
}) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    // {
    //   title: "Dashboard",
    //   href: "/dashboard",
    //   icon: LayoutDashboard,
    // },
     {
      title: "Phiếu",
      href: "/my-tasks",
      icon: ListCheck,
      status:false
    },
    {
      title: "Workspaces",
      href: "/workspaces",
      icon: Users,
      status:false
    },
    {
      title: "Thành viên",
      href: `/members`,
      icon: Users,
      status:false
    },
    {
      title: "Quản lý thiết bị",
      href: `/devices`,
      icon: Wallpaper,
      status:false
    },
    {
      title: "Tool Boost",
      href: `/toolbooots`,
      icon: CheckCircle2,
      status:false 
    },
    {
      title: "Lưu trữ",
      href: `/achieved`,
      icon: CheckCircle2,
      status:true 
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      status:true
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-sidebar transition-all duration-300",
        isCollapsed ? "w-16 md:w[80px]" : "w-16 md:w-[240px]"
      )}
    >
      <div className="flex h-14 items-center border-b px-4 mb-4">
        <Link to="/my-tasks" className="flex items-center">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Wrench className="size-6 text-blue-600" />
              <span className="font-semibold text-lg hidden md:block">
                PRS-IT
              </span>
            </div>
          )}

          {isCollapsed && <Wrench className="size-6 text-blue-600" />}
        </Link>

        <Button
          variant={"ghost"}
          size="icon"
          className="ml-auto hidden md:block"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronsRight className="size-4" />
          ) : (
            <ChevronsLeft className="size-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        <SidebarNav
          items={navItems}
          isCollapsed={isCollapsed}
          className={cn(isCollapsed && "items-center space-y-2")}
          currentWorkspace={currentWorkspace}
        />
      </ScrollArea>

      <div>
        <Button
          variant={"ghost"}
          size={isCollapsed ? "icon" : "default"}
          onClick={logout}
        >
          <LogOut className={cn("size-4", isCollapsed && "mr-2")} />
          <span className="hidden md:block">Logout</span>
        </Button>
      </div>
    </div>
  );
};
