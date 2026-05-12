import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar/Sidebar";
import { Header } from "./Header";
import { useIsMobile } from "@/common/hooks/useIsMobile";
import { Footer } from "./Footer";
import { cn } from "@/common/lib/utils";

export const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();


  return (
    <div className="flex-1 flex lg:u-container">
      <aside className="hidden lg:flex lg:mr-7.5 sticky top-7.5 h-(--layout-sidebar-height)">
        <Sidebar />
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-4 top-4 bottom-4">
            <Sidebar onClose={() => {
              setSidebarOpen(false)
            }} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col">

        <div className="sticky top-(--layout-header-sticky-top) z-40 lg:shadow-[0_-30px_0_0_#fcfcfc]">
          < Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className={cn("flex-1 mt-4", isMobile && "u-container")}>
          <Outlet />
        </main>

        <Footer variant={isMobile ? 'mobile' : 'desktop'} />
      </div>
    </div >
  );
};