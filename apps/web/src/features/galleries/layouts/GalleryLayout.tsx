import { Outlet } from "react-router-dom";

export const GalleryLayout = () => {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-nature-white rounded-lg shadow-block">
      <Outlet />
    </div>
  );
};