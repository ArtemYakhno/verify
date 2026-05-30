import { Outlet } from "react-router-dom";

export const GalleryLayout = () => {
  return (
    <div className="flex flex-col flex-1 bg-nature-white rounded-lg shadow-block p-4 lg:p-7.5">
      <Outlet />
    </div>
  );
};