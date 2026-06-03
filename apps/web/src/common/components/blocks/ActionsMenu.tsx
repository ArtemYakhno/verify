import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle } from "@/common/components/ui/dialog";
import { cn } from "@/common/lib/utils";

export type ActionItem = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
};

interface ActionsMenuProps {
  actions: ActionItem[];
  title?: string;
}

export const ActionsMenu = ({ actions, title = "Actions" }: ActionsMenuProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="hidden lg:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button  variant="transparent" size="auto" className="p-1 rounded-circle bg-statuses">
              <MoreVertical data-testid="more-icon" className="text-ui-black" size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[132px] absolute right-[9px]">
            {actions.map((action) => (
              <DropdownMenuItem
                key={action.label}
                onClick={action.onClick}
                className={action.className}
              >
                {action.icon}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div >

      <div className="lg:hidden">
        <Button
          variant="transparent"
          size="auto"
          className="p-1 rounded-circle bg-statuses"
          onClick={() => setMobileOpen(true)}
        >
          <MoreVertical data-testid="more-icon" className="text-ui-black" size={18} />
        </Button>

        <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
          <DialogContent data-testid="mobile-actions-dialog" position="bottom" className="rounded-none w-full max-w-none p-0 rounded-t-lg">
            <DialogTitle className="typo-h3 text-ui-black py-5 px-6 bg-light-green rounded-t-md font-medium">
              {title}
            </DialogTitle>
            <div className="p-6 grid gap-4">
              {actions.map((action) => (
                <Button
                  key={action.label}
                  variant="transparent"
                  className={cn(
                    "text-[16px] w-full text-ui-black px-0 justify-start h-9 font-medium",
                    action.className
                  )}
                  onClick={() => { action.onClick(); setMobileOpen(false); }}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};