import React, { Children } from 'react';
import MainHeader from '@/components/header';

interface AppLayoutProps {
    pageName: string;
    children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({
    pageName,
    children
}) => {
  return (
    <div className='h-full w-full min-h-screen flex flex-col'>
      <MainHeader 
        currentPage={pageName && pageName}
      />
      <div className='h-full w-full flex items-center justify-center p-5'>
        {children}
      </div>
    </div>
  )
}

export default AppLayout
