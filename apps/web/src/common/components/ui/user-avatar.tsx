import { cn } from "@/common/lib/utils";

interface UserAvatarProps {
  name: string;
  className?: string;
}

export const UserAvatar = ({ name, className }: UserAvatarProps) => {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-green text-[16px] leading-[150%] font-bold text-white",
        className
      )}
    >
      {initials}
    </div>
  );
};