import { Button } from "@/common/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const ActionBtn = ({ to, label, backTo }: { to: string; label: string, backTo?: string; }) => {
  return (
    <Button asChild variant="secondary" className="group whitespace-nowrap w-full lg:w-[250px]">
      <Link to={to} state={{ backTo }}
      >
        {label}
        <ArrowRight
          size={20}
          strokeWidth={1.5}
          className="text-accent-green group-hover:text-nature-white transition-colors"
        />
      </Link>
    </Button>
  )
};