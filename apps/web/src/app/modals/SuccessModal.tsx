import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/common/components/ui/dialog";
import { useIsMobile } from "@/common/hooks/useIsMobile";
import { Check } from "lucide-react";


interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export const SuccessModal = ({
  isOpen,
  onClose,
  title = "Changes saved",
  description = "Your changes were successfully saved.",
}: SuccessModalProps) => {
  const isMobile = useIsMobile()
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="flex flex-col items-center gap-6 px-6 py-10 text-center lg:max-w-[420px]"
        isMobileFullWidth={isMobile}
      >
        <DialogDescription className="sr-only">
          {description}
        </DialogDescription>

        <DialogTitle className="typo-h2 text-center text-ui-black">
          {title}
        </DialogTitle>

        <div className="flex size-20 items-center justify-center rounded-full bg-accent-green">
          <Check className="size-12 text-white" />
        </div>

        <p className="typo-main">
          {description}
        </p>
      </DialogContent>
    </Dialog>
  );
};