import { Images, Upload } from "lucide-react";
import { Button } from "@/common/components/ui/button";

export const GalleryUploader = () => (
  <div className="flex flex-col items-center justify-center bg-light-green gap-5 border border-dashed border-green rounded-lg bg-primary-5 p-9 box-border">
    <Images className="text-placeholder" size={64} />
    <div>
      <h3 className="typo-h3 text-center">Drag and drop photo here</h3>
      <p className="typo-third text-center mt-2.5">JPEG, PNG (max 5MB / picture)</p>
    </div>

    <div className="flex items-center gap-3 w-full">
      <div className="h-px flex-1 bg-border" />
      <span className="typo-h3 text-placeholder">OR</span>
      <div className="h-px flex-1 bg-border" />
    </div>

    <Button type="button" className="w-full gap-2">
      <Upload size={24} />
      Upload
    </Button>
  </div>
);