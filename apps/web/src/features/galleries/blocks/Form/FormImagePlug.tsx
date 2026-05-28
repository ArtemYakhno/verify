import { Camera } from 'lucide-react'

type FormImagePlugProps = {
  withAdditionalInfo?: boolean;
}

export const FormImagePlug = ({ withAdditionalInfo }: FormImagePlugProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square flex flex-col items-center justify-center gap-1.5 rounded-md border border-border"
          >
            <Camera size={32} className="text-border" />
            <span className="font-bold text-[12px] leading-[150%] text-border">
              Photo preview
            </span>
          </div>
        ))}
      </div>
      {withAdditionalInfo && (
        <p className="typo-main text-grey mt-4 lg:mt-7.5 text-center lg:text-left">
          Upload a maximum of <span className="font-bold">50 photos</span>, no
          more than <span className="font-bold">5MB</span> each.
        </p>
      )}
    </>
  )
}
