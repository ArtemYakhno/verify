import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/common/components/ui/dialog";
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
  title,
  description,
}: SuccessModalProps) => {
  return (
    <Dialog data-testid="success-modal" open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="flex flex-col items-center gap-4 pb-10! text-center lg:max-w-[420px]"
      >
        <DialogDescription className="sr-only">
          {description}
        </DialogDescription>

        <DialogTitle className="typo-h2 text-center text-ui-black">
          {title}
        </DialogTitle>

        <div className="flex size-20 items-center justify-center rounded-full bg-accent-green">
          <Check data-testid="check-icon" className="size-12 text-white" />
        </div>

        <p className="typo-main">
          {description}
        </p>
      </DialogContent>
    </Dialog>
  );
};