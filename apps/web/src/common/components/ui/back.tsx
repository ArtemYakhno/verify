import { ChevronLeft } from 'lucide-react';
import { Button } from './button';
import { useGoBack } from '@/common/hooks/useGoBack';

interface IBackProps {
  onBack?: () => void;
  label?: string;
}

export const Back = ({ onBack, label = 'Back' }: IBackProps) => {
  const goBack = useGoBack();

  const handleClick = () => {
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  };

  return (
    <Button onClick={handleClick} className="typo-secondary leading-[30px]" variant='transparent' size='auto'><ChevronLeft size={24} className="text-ui-black" />{label}</Button>
  );
};
