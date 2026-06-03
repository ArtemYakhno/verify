import { Button } from "@/common/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/common/components/ui/dialog";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  action: React.ReactNode;
}

export const ActionModal = ({
  isOpen,
  onClose,
  title,
  description,
  action,
}: ActionModalProps) => {
  return (
    <Dialog data-testid="action-modal" open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col items-center text-center lg:max-w-[400px]">
        {description && (
          <DialogDescription className="sr-only">
            {description}
          </DialogDescription>
        )}

        <DialogTitle className="text-[24px] font-bold text-center text-ui-black">
          {title}
        </DialogTitle>

        {description && (
          <p className="typo-main text-placeholder mt-4">{description}</p>
        )}

        <div className="flex flex-col items-center gap-6 w-full mt-7.5">
          {action}

          <Button
            variant='cancel'
            size='auto'
            className="w-[250px] p1 w-fit"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};