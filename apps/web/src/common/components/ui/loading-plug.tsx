import { Spinner } from '@/common/components/ui/spinner'

export const LoadingPlug = () => {
  return (
    <div className='flex-1 flex items-center justify-center'>
      <Spinner className='size-20 text-green' />
    </div>
  )
}
