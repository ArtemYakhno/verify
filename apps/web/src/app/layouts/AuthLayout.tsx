import { Outlet, useLocation } from 'react-router-dom';
import logoText from '@/assets/logo-text.svg';
import clsx from 'clsx';
import { RoutePath } from '../routes/configs/root.config';
import { Footer } from './Footer';

export const AuthLayout = () => {
  const isSignIn = useLocation().pathname === RoutePath.SignIn;

  return (
    <div className='flex-1 grid bg-nature-white lg:grid-cols-2 '>
      <div className={clsx('flex flex-col  justify-between pt-7.5 px-4 box-content lg:mx-auto lg:w-[441px] lg:py-15 lg:px-8 ', isSignIn && 'lg:justify-center')}>
        <div className='lg:hidden'></div>
        <Outlet />
        <Footer className='lg:hidden' />
      </div>

      <div className='hidden lg:block sticky top-0 h-dvh  bg-[url(/images/auth-bg.webp)] bg-cover bg-center rounded-bl-[200px]'>
        <div className='flex flex-col items-center justify-between w-full h-full py-10 px-25'>
          <div />

          <div className='flex flex-col items-center gap-10'>
            <div className='flex flex-col items-center justify-center rounded-md bg-nature-white/5 backdrop-blur-[20px] border border-nature-white/5 w-[clamp(260px,35dvh,375px)]
    h-[clamp(280px,38dvh,390px)]'>
              <img src={logoText} alt='Verify logo' className='max-w-[80%] max-h-[80%] object-contain' />
            </div>

            {isSignIn && <p className='typo-h1 text-nature-white '>
              Welcome back 👋
            </p>}

          </div>

          <Footer textClassName='text-nature-white self-end ' />
        </div>
      </div>

    </div >
  );
};

