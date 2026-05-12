import { Footer } from "@/app/layouts/Footer"
import { RoutePath } from "@/app/routes/configs/root.config";
import { Button } from "@/common/components/ui/button";
import { useIsMobile } from "@/common/hooks/useIsMobile";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col flex-1 pt-4 u-content-padding">
      <div className="flex-1 flex flex-col items-center justify-center bg-nature-white rounded-lg">
        <h1 className="typo-h1">Page not found</h1>
        <p className="typo-main mt-2">
          Sorry, the page you requested could not be found. Please go back to the home page.
        </p>
        <img
          src="/images/not-found.webp"
          alt="Not found page"
          loading="lazy"
          decoding="async"
          className="mt-10 w-full h-[clamp(200px,16vw,362px)] lg:max-w-[511px] object-contain"
        />
        <Button asChild className="w-[250px] mt-10">
          <Link to={RoutePath.Galleries}>
            Home page
            <ArrowRight size={24} />
          </Link>
        </Button>
      </div>
      <Footer variant={isMobile ? 'mobile' : 'desktop'} />
    </div>
  );
};