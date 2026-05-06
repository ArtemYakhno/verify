import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { RoutePath } from "@/app/routes/configs/root.config";

interface HeaderProps {
  onMenuClick: () => void;
}

const HEADER_TITLES: Record<string, string> = {
  [RoutePath.Gallery]: "Gallery",
  [RoutePath.GallerySearch]: "Search among galleries",
  [RoutePath.Profile]: "Profile settings",
  [RoutePath.UserManagement]: "User management",
  [RoutePath.PrivacyPolicy]: "Privacy policy",
  [RoutePath.TermsConditions]: "Terms and conditions",
};

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { pathname } = useLocation();

  const title = HEADER_TITLES[pathname] ?? "Verify";

  return (
    <header className="flex items-center justify-between gap-4 p-5">
      <h1 className="min-w-0 flex-1 truncate typo-h1 text-ui-black">
        {title}
      </h1>

      <button
        type="button"
        onClick={onMenuClick}
        className="p-1 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>
    </header>
  );
};