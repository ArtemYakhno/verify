import { ChevronLeft } from "lucide-react";
import { Button } from "./button";
import { useBack } from "@/common/hooks/useBack";

interface IBackProps {
  onBack?: () => void;
  label?: string;
}

export const Back = ({ onBack, label = "Back" }: IBackProps) => {
  const smartBack = useBack();

  const handleClick = () => {
    if (onBack) {
      onBack();
      return;
    }

    smartBack();
  };

  return (
    <Button
      onClick={handleClick}
      className="typo-secondary leading-[30px]"
      variant="transparent"
      size="auto"
    >
      <ChevronLeft size={24} className="text-ui-black" />
      {label}
    </Button>
  );
};