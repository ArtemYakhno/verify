import { Footer } from "@/app/layouts/Footer"
import { RoutePath } from "@/app/routes/configs/root.config";
import { Button } from "@/common/components/ui/button";
import { Plug } from "@/common/components/ui/plug";
import { useIsMobile } from "@/common/hooks/useIsMobile";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  const isMobile = useIsMobile();

  const BackHomeButton = <Button asChild className="w-[250px] mt-10">
    <Link to={RoutePath.Galleries}>
      Home page
      <ArrowRight size={24} />
    </Link>
  </Button>

  return (
    <div className="flex flex-col flex-1 pt-4 u-content-padding">
      <div className="flex-1 flex flex-col items-center justify-center bg-nature-white rounded-lg">
        <Plug
          title="Page not found"
          description="Sorry, the page you requested could not be found. Please go back to the home page."
          imageSrc="/images/not-found.webp"
          imageAlt="Not found page"
          action={BackHomeButton}>
        </Plug>
      </div>
      <Footer variant={isMobile ? 'mobile' : 'desktop'} />
    </div>
  );
};