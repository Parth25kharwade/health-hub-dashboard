import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { ReactNode } from "react";

interface Props { children: ReactNode; title?: string }

const DashboardLayout = ({ children, title }: Props) => (
  <div className="flex h-screen overflow-hidden bg-background">
    <Sidebar />
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Navbar title={title} />
      <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        {children}
      </main>
    </div>
  </div>
);

export default DashboardLayout;
