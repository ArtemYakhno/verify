import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar/Sidebar";
import { Header } from "./Header/Header";
import { useIsMobile } from "@/common/hooks/useIsMobile";
import { Footer } from "./Footer";
import { cn } from "@/common/lib/utils";
import { useScrolled } from "@/common/hooks/useScrolled";

export const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const isScrolled = useScrolled();


  return (
    <div className="flex-1 flex min-h-0 lg:u-container">
      <aside className="hidden lg:flex lg:mr-7.5">
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

      <div className="flex flex-1 flex-col min-h-0">

        <div className={cn("sticky top-0 z-40 p-4 lg:px-0 lg:pt-1.5 lg:pb-10 lg:block", isScrolled && "bg-nature-white")}>

          < Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className={cn("flex flex-col flex-1 min-h-0", isMobile && "u-container")}>
          <Outlet />
        </main>

        <Footer />
      </div>
    </div >
  );
};