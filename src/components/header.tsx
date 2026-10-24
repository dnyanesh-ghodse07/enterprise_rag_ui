import { SidebarTrigger } from "./ui/sidebar";
import { Button } from "./ui/button";
import { User2, SettingsIcon } from "lucide-react";
import { useLocation } from "react-router";

export default function Header() {
    const location = useLocation();

    const getPageTitle = () => {
        if (location.pathname.startsWith("/documents")) return "Documents";
        if (location.pathname.startsWith("/chat")) return "Chat Assistant";
        return "Cognix";
    };

    return (
        <header className="flex justify-between items-center w-full py-2 px-4 border-b bg-background">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="text-xl" />
                <h1 className="text-sm font-medium">{getPageTitle()}</h1>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon-sm" aria-label="Settings">
                    <SettingsIcon />
                </Button>
                <Button variant="outline" size="icon-sm" aria-label="Profile">
                    <User2 />
                </Button>
            </div>
        </header>
    );
}
