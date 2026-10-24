// src/layout/app-layout.tsx
import { Outlet } from "react-router";
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import Header from "../components/header";

export default function AppLayout() {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-full overflow-hidden bg-background">
                {/* Persistent Sidebar */}
                <AppSidebar />

                {/* Main Content Area */}
                <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
                    <Header />
                    <main className="flex-1 min-h-0 overflow-y-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
