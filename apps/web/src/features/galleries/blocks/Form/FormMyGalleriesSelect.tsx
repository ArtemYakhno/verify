import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import type { Gallery } from "../../schemas/gallery-response.schema";
import { useGetMyGalleries } from "../../gueries/gallery.queries";
import { extractErrorMessage } from "@/common/utils/erros/errors";

type FormMyGalleriesSelectProps = {
  value?: number | null;
  excludeGalleryId?: number;
  setTargetGalleryId: (id: number) => void;
};

export const FormMyGalleriesSelect = ({
  value,
  excludeGalleryId,
  setTargetGalleryId,
}: FormMyGalleriesSelectProps) => {
  const { data: galleries, isLoading, isError, error } = useGetMyGalleries();

  if (isLoading) {
    return <div>Loading galleries...</div>;
  }

  if (isError) {
    console.error(extractErrorMessage(error));
    return <div className="text-destructive">Failed to load galleries</div>;
  }

  const availableGalleries =
    galleries?.filter((gallery: Gallery) => gallery.id !== excludeGalleryId) ?? [];

  return (
    <Select
      value={value ? String(value) : undefined}
      onValueChange={(value) => setTargetGalleryId(Number(value))}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a gallery" />
      </SelectTrigger>

      <SelectContent
        position="popper"
        className="max-h-[250px]"
      >
        <SelectGroup>
          {availableGalleries.map((gallery: Gallery) => (
            <SelectItem key={gallery.id} value={gallery.id.toString()}>
              {gallery.title}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};