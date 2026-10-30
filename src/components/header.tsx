import { SidebarTrigger } from "./ui/sidebar";
import { User2, LogOut, KeyRound } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useState } from "react";
import { clearTokens } from "../api/client";
import ChangePasswordDialog from "./auth/change-password-dialog";
import type { User } from "../types";


function ProfileMenu({ open: controlledOpen, setOpen: controlledSetOpen }: { open?: boolean; setOpen?: (open: boolean) => void } = {}) {
    const navigate = useNavigate();
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;
    const setOpen = isControlled ? (controlledSetOpen ?? (() => {})) : setUncontrolledOpen;

    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        try {
            const cached = localStorage.getItem("current_user");
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    });
    const handleLogout = () => {
        clearTokens();
        localStorage.removeItem("current_user");
        setCurrentUser(null);
        navigate(`/login`);
    };
    return (
        <>
            <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
                <DropdownMenuTrigger render={<Button variant="outline" size="icon-sm" aria-label="User Profile" />}>
                    <User2 className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {currentUser?.id && <DropdownMenuItem>
                        <User2 className="mr-2 h-4 w-4" />
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-medium text-sidebar-foreground truncate" title={currentUser.full_name}>
                                {currentUser.full_name || "User"}
                            </span>
                            {currentUser.role && (
                                <span className="text-[10px] text-muted-foreground capitalize">
                                    {currentUser.role}
                                </span>
                            )}
                        </div>
                    </DropdownMenuItem>}
                    <DropdownMenuItem 
                        onClick={() => {
                            setOpen(false);
                            setShowChangePassword(true);
                        }} 
                        className="text-xs"
                    >
                        <KeyRound className="size-3.5 text-muted-foreground" />
                        <span>Change Password</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={() => {
                            setOpen(false);
                            handleLogout();
                        }} 
                        className='text-xs'
                    >
                        <LogOut className="size-3.5 text-muted-foreground" />
                        <span>Sign Out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Change Password Dialog */}
            <ChangePasswordDialog
                isOpen={showChangePassword}
                onClose={() => setShowChangePassword(false)}
            />
        </>
    )
}

export default function Header() {
    const location = useLocation();
    const [openProfileMenu, setOpenProfileMenu] = useState(false);

    const getPageTitle = () => {
        if (location.pathname.startsWith("/documents")) return "Documents";
        if (location.pathname.startsWith("/chat")) return "Chat Assistant";
        return "Cognix";
    };

    return (
        <header className="flex justify-between items-center w-full py-2 px-3 sm:px-4 border-b bg-background shrink-0">
            <div className="flex items-center gap-2 min-w-0">
                <SidebarTrigger className="text-xl shrink-0" />
                <h1 className="text-sm font-medium truncate">{getPageTitle()}</h1>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <ThemeToggle />
                <ProfileMenu open={openProfileMenu} setOpen={setOpenProfileMenu} />
            </div>
        </header>
    );
}
