import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Spinner } from "../ui/spinner";
import { changePassword } from "../../api/client";
import { KeyRound, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

interface ChangePasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function ChangePasswordDialog({
    isOpen,
    onClose,
    onSuccess,
}: ChangePasswordDialogProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    const resetForm = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError(null);
        setSuccessMessage(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!currentPassword) {
            setError("Current password is required.");
            return;
        }

        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        if (newPassword === currentPassword) {
            setError("New password cannot be the same as current password.");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await changePassword({
                current_password: currentPassword,
                new_password: newPassword,
            });

            setSuccessMessage(res.message || "Password changed successfully!");
            setTimeout(() => {
                handleClose();
                if (onSuccess) onSuccess();
            }, 1200);
        } catch (err: any) {
            console.error("Change password failed:", err);
            setError(err?.message || "Failed to change password. Please check your current password.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50 duration-150">
            <Card className="w-full max-w-md bg-background border-border/80 shadow-2xl overflow-hidden">
                <CardHeader className="p-5 pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                            <KeyRound className="size-4.5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-foreground">
                                Change Password
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                Update your account security credentials
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="p-5 space-y-4">
                        {/* Error Alert */}
                        {error && (
                            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5">
                                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                                <span className="leading-snug">{error}</span>
                            </div>
                        )}

                        {/* Success Message */}
                        {successMessage && (
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                                <CheckCircle2 className="size-4 shrink-0" />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        {/* Current Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="current_password" className="text-xs font-medium">
                                Current Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                <Input
                                    id="current_password"
                                    type={showCurrentPassword ? "text" : "password"}
                                    placeholder="Enter current password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    disabled={isSubmitting || Boolean(successMessage)}
                                    required
                                    className="pl-9 pr-9 h-9 text-xs sm:text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                                    tabIndex={-1}
                                >
                                    {showCurrentPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="new_password" className="text-xs font-medium">
                                New Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                <Input
                                    id="new_password"
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="Minimum 8 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={isSubmitting || Boolean(successMessage)}
                                    required
                                    minLength={8}
                                    className="pl-9 pr-9 h-9 text-xs sm:text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                                    tabIndex={-1}
                                >
                                    {showNewPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm New Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="confirm_password" className="text-xs font-medium">
                                Confirm New Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                <Input
                                    id="confirm_password"
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="Re-type new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isSubmitting || Boolean(successMessage)}
                                    required
                                    minLength={8}
                                    className="pl-9 pr-9 h-9 text-xs sm:text-sm"
                                />
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="p-4 bg-muted/20 border-t border-border/60 flex items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="text-xs h-8.5"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isSubmitting || Boolean(successMessage)}
                            className="text-xs h-8.5 font-medium gap-1.5"
                        >
                            {isSubmitting ? (
                                <>
                                    <Spinner className="size-3.5" />
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <KeyRound className="size-3.5" />
                                    <span>Change Password</span>
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
