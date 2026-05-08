import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Outlet />
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;