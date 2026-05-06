import { cn } from "@/common/lib/utils";

export const footerText = `© ${new Date().getFullYear()} Verify. All Rights Reserved.`;

type FooterVariant = "mobile" | "desktop";

interface FooterProps {
  variant?: FooterVariant;
  className?: string;
  textClassName?: string;
}

const footerVariants: Record<FooterVariant, string> = {
  mobile: " py-[50px]",
  desktop: "w-full pt-6",
};

const textVariants: Record<FooterVariant, string> = {
  mobile: "text-center text-ui-black",
  desktop: "text-placeholder text-end",
};

export const Footer = ({
  variant = "desktop",
  className,
  textClassName,
}: FooterProps) => {
  return (
    <footer className={cn(footerVariants[variant], className)}>
      <small className={cn("block font-medium text-[14px] leading-[24px]", textVariants[variant], textClassName)}>
        © {new Date().getFullYear()} Verify. All Rights Reserved.
      </small>
    </footer>
  );
};