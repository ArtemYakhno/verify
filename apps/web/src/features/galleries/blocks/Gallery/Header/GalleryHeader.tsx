import { GalleryFilter } from "./GalleryFilter";
import { GalleryInput } from "./GalleryInput";
import { GallerySort } from "./GallerySort";
import type { useGalleriesParams } from "@/features/galleries/hooks/useGalleriesParams";

type GalleriesParamsActions = Pick<
  ReturnType<typeof useGalleriesParams>,
  "setSearch" | "setPerPage" | "setSorting" | "setFilters" | "resetFilters"
>;

type GalleryHeaderParams = Pick<
  ReturnType<typeof useGalleriesParams>["params"],
  "orderBy" | "orderDir" | 'createdFrom' | 'createdTo' | 'search' | 'maxImages' | 'minImages'
>;

interface GalleryHeaderProps {
  params: GalleryHeaderParams;
  actions: GalleriesParamsActions
}

export const GalleryHeader = ({ params, actions }: GalleryHeaderProps) => {
  return (
    <div className="flex justify-between items-center gap-8 mb-4 lg:mb-8">
      <GalleryInput search={params.search} onSetSearch={actions.setSearch} />
      <div className="flex  items-center gap-4">
        <GallerySort onSetSorting={actions.setSorting} orderBy={params.orderBy} orderDir={params.orderDir} />
        <GalleryFilter
          filters={{
            createdFrom: params.createdFrom,
            createdTo: params.createdTo,
            minImages: params.minImages,
            maxImages: params.maxImages,
          }}
          onSetFilter={actions.setFilters}
          onResetFilter={actions.resetFilters}
        />
      </div>

    </div>
  )
}
