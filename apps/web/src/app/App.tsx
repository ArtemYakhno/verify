import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

function App() {
  return (
    <div className="min-h-dvh lg:h-dvh flex flex-col">
      <Outlet />
      <Toaster
        position="top-right"
        richColors
        expand
        visibleToasts={6}
        gap={12}
        offset={24}
      />    </div>
  );
}

export default App;