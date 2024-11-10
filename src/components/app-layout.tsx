import React from "react";
import MainHeader from "@/components/header";

interface AppLayoutProps {
  pageName: string;
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ pageName, children }) => {
  return (
    <div className="flex h-full min-h-screen w-full flex-col">
      <MainHeader currentPage={pageName && pageName} />
      <div className="flex h-full w-full items-center justify-center p-5">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
