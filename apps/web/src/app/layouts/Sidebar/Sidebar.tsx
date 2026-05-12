import { X, LogOut, Image, User } from "lucide-react";
import { NavLink, useMatch } from "react-router-dom";
import logoText from "@/assets/logo-text-hor.svg";
import { Button } from "@/common/components/ui/button";
import { Separator } from "@/common/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/common/components/ui/accordion";
import { useLogout } from "@/features/auth/queries/auth.mutations";
import { cn } from "@/common/lib/utils";
import { NavItem } from "./NavItem";
import { UserAvatar } from "@/common/components/ui/user-avatar";
import { RoutePath } from "@/app/routes/configs/root.config";
import { useGetMe } from "@/features/profile/queries/profile.queries";

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar = ({ onClose }: SidebarProps) => {
  const { mutate: logoutUser, isPending } = useLogout();
  const { data: user } = useGetMe();
  const isGalleryActive = useMatch(`${RoutePath.Galleries}/*`);

  return (
    <div className="relative flex h-full w-[290px] flex-col justify-between rounded-lg bg-nature-white  py-9 shadow-block">
      <div className="px-5">
        <img
          src={logoText}
          alt="Verify logo"
          className="mb-9 h-16 w-[158px] m-auto"
        />

        {onClose && (
          <Button
            onClick={onClose}
            aria-label="Close menu"
            variant="transparent"
            size="auto"
            className="absolute right-4 top-4 p-4 lg:hidden"
          >
            <X size={16} className="text-ui-black" />
          </Button>
        )}

        <Separator className="absolute left-0 right-0" />

        <nav className="flex flex-col gap-6 pt-9">
          <Accordion type="single" collapsible defaultValue="gallery">
            <AccordionItem value="gallery" className="border-none">
              <AccordionTrigger
                className={cn(
                  "hover:no-underline px-0 py-0 font-semibold cursor-pointer",
                )}
              >
                <span className="flex items-center gap-2">
                  <Image
                    size={24}
                    className={cn(isGalleryActive ? "text-green" : "text-grey")}
                  />
                  <span className={cn("typo-nav", isGalleryActive && "text-ui-black font-bold")}>Gallery</span>
                </span>
              </AccordionTrigger>

              <AccordionContent className="mt-4 pb-0 h-fit">
                <div className="flex flex-col gap-5 pl-8">
                  <NavItem
                    to={RoutePath.Galleries}
                    label="List of galleries"
                    onClose={onClose}
                    end
                  />
                  <NavItem
                    to={RoutePath.GalleriesSearch}
                    label="Search among galleries"
                    onClose={onClose}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <NavItem
            to={RoutePath.UserManagement}
            label="User management"
            icon={User}
            onClose={onClose}
          />
        </nav>
      </div>

      {user && (
        <div className="flex flex-col gap-6 ">
          <NavLink
            to={RoutePath.Profile}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md mx-2.5  p-2.5",
                isActive ? "bg-light-green" : "hover:bg-light-green"
              )
            }
          >
            <UserAvatar name={`${user.firstname} ${user.lastname}`} />
            <div className="flex flex-col overflow-hidden">
              <span className="truncate typo-h3 text-ui-black">
                {user.firstname} {user.lastname}
              </span>
              <span className="truncate typo-third text-grey">{user.email}</span>
            </div>
          </NavLink>
          <Button
            variant="transparent"
            size="auto"
            className="justify-start py-0.75 typo-nav hover:text-ui-black px-5"
            onClick={() => logoutUser()}
            disabled={isPending}
          >
            <LogOut className='size-6' />
            <span>Log Out</span>
          </Button>
        </div>)}
    </div>
  );
};