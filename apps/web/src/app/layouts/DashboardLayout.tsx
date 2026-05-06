import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar/Sidebar";
import { Header } from "./Header";
import { useIsMobile } from "@/common/hooks/useIsMobile";
import { Footer } from "./Footer";
import { scrollTop } from "@/common/utils/scrollTop";
import { cn } from "@/common/lib/utils";
import { useScrolled } from "@/common/hooks/useScrolled";

export const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const isScrolled = useScrolled();


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
              scrollTop()
            }} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col">

        <div className={cn("sticky top-(--layout-header-sticky-top) z-40 bg-light-bg lg:rounded-lg", isScrolled && 'bg-nature-white')}>
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className={cn("flex-1 mt-4", isMobile && "u-container")}>
          <Outlet />
        </main>

        <Footer variant={isMobile ? 'mobile' : 'desktop'} />
      </div>
    </div>
  );
};