import { cn } from "@/common/lib/utils";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

interface NavItemProps {
  to: string;
  label: string;
  icon?: LucideIcon;
  end?: boolean;
  onClose?: () => void;
}

export const NavItem = ({ to, label, icon: IconComponent, end, onClose }: NavItemProps) => (
  <NavLink
    to={to}
    end={end}
    className='no-underline decoration-transparent'
    onClick={onClose}
  >
    {({ isActive }) => (
      <div
        className='flex items-center gap-2 rounded-md'
      >
        {IconComponent && (
          <IconComponent
            size={24}
            className={cn(isActive ? "text-green" : "text-placeholder")}
          />
        )}
        <span className={cn(
          "typo-nav",
          isActive ? "text-ui-black font-medium" : "text-placeholder hover:text-grey"
        )}>{label}</span>
      </div>
    )}
  </NavLink>
);