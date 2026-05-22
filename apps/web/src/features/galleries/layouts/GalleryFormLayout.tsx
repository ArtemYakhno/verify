import { Outlet } from 'react-router-dom'

export const GalleryFormLayout = () => {
  return (
    <div className="flex flex-col flex-1 min-h-0 p-4 lg:p-7.5">
      <Outlet />
    </div>
  )
}
