import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar/Sidebar";
import { Header } from "./Header/Header";
import { useIsMobile } from "@/common/hooks/useIsMobile";
import { Footer } from "./Footer/Footer";
import { cn } from "@/common/lib/utils";
import { useScrolled } from "@/common/hooks/useScrolled";

export const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const isScrolled = useScrolled();


  return (
    <div className="flex-1 flex lg:u-content-padding">
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

        <div className={cn("sticky top-0 z-40 p-4 lg:rounded-b-lg lg:pt-0 lg:px-4 lg:pb-10", isScrolled && "bg-nature-white lg:py-6")}>
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className={cn("flex flex-col flex-1", isMobile && 'u-content-padding')}>
          <Outlet />
        </main>

        <Footer />
      </div>
    </div >
  );
};