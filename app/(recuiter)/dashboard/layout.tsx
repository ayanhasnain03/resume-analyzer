import { DashboardSidebar } from "@/modules/recuiter/ui/components/dashboard-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <aside>
        <DashboardSidebar />
      </aside>
      <section className="flex flex-col min-h-screen w-screen bg-muted ">
        <SidebarTrigger />
        {children}
      </section>
    </SidebarProvider>
  );
}
