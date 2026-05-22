import { Menu } from "lucide-react";
import { useHeaderConfigs } from "./hooks/useHeaderConfigs";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { title, action } = useHeaderConfigs();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center justify-between w-full lg:w-auto lg:flex-1 min-w-0">
        <h1 className="truncate typo-h1 text-ui-black">
          {title}
        </h1>

        <button
          type="button"
          onClick={onMenuClick}
          className="p-1 lg:hidden flex-shrink-0 ml-3"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {action && action}
    </header>
  );
};