interface GalleryFormHeaderProps {
  title: string;
  description?: string;
}

export const GalleryFormHeader = ({ title, description }: GalleryFormHeaderProps) => (
  <div>
    <h2 className="typo-h2 text-ui-black">{title}</h2>
    {description && (
      <p className="typo-main text-placeholder mt-1.5 lg:mt-2">{description}</p>
    )}
  </div>
);