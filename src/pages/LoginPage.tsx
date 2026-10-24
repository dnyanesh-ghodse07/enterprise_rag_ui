import { useState } from "react";
import { useNavigate } from "react-router";
import { apiPost, saveTokens } from "../api/client";
import { Button } from "../components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Spinner } from "../components/ui/spinner";
import type { AuthTokens } from "../types";
import { 
    Sparkles, 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    AlertCircle, 
    ArrowRight 
} from "lucide-react";

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("alice@acme.com");
    const [password, setPassword] = useState("MyStr0ngP@ssword!");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setError("Please provide both email and password.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await apiPost<AuthTokens>("/auth/login", {
                email: email.trim(),
                password: password,
            });
            saveTokens(res.access_token, res.refresh_token);
            navigate("/chat/conversations");
        } catch (err: any) {
            console.error("Login failed:", err);
            setError(err?.message || "Invalid email or password. Please verify your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFillDemo = () => {
        setEmail("alice@acme.com");
        setPassword("MyStr0ngP@ssword!");
        setError(null);
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-background overflow-hidden selection:bg-primary/20">
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-primary/15 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-purple-500/15 blur-[120px]" />

            <div className="w-full max-w-md relative z-10 animate-in fade-in-50 zoom-in-95 duration-200">
                {/* Brand Logo Header */}
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-purple-600 text-primary-foreground shadow-md mb-3 ring-4 ring-primary/10">
                        <Sparkles className="size-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Cognix
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                        Intelligent Document Knowledge Base & Chat Assistant
                    </p>
                </div>

                {/* Login Card */}
                <Card className="border-border/80 bg-card/90 backdrop-blur-md shadow-xl overflow-hidden">
                    <CardHeader className="space-y-1 p-6 pb-4 border-b border-border/50">
                        <CardTitle className="text-lg font-semibold tracking-tight">
                            Sign in to your account
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Enter your organizational credentials to continue
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 pt-5">
                        <form onSubmit={handleLogin} className="space-y-4">
                            {/* Error Alert */}
                            {error && (
                                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5 animate-in fade-in-50 duration-150">
                                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                                    <span className="leading-snug">{error}</span>
                                </div>
                            )}

                            {/* Email Input */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-medium">
                                    Email address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="user@organization.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                        required
                                        className="pl-9 h-10 text-xs sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-medium">
                                        Password
                                    </Label>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                        required
                                        className="pl-9 pr-9 h-10 text-xs sm:text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 transition-colors"
                                        title={showPassword ? "Hide password" : "Show password"}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-10 text-xs sm:text-sm font-semibold gap-2 mt-2 shadow-sm"
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner className="size-4" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight className="size-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    {/* Demo Credentials & Register Footer */}
                    <CardFooter className="flex flex-col gap-2.5 p-4 bg-muted/40 border-t border-border/50 text-center">
                        <button
                            type="button"
                            onClick={handleFillDemo}
                            className="text-[11px] text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 mx-auto"
                        >
                            <span>Need test login?</span>
                            <span className="font-semibold text-primary underline underline-offset-2">Use demo credentials</span>
                        </button>
                        <p className="text-xs text-muted-foreground pt-1 border-t border-border/40 w-full">
                            Don't have an account?{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/register")}
                                className="font-semibold text-primary hover:underline underline-offset-2"
                            >
                                Register organization
                            </button>
                        </p>
                    </CardFooter>
                </Card>

                {/* Footer copyright */}
                <p className="text-[11px] text-center text-muted-foreground/60 mt-6">
                    Cognix AI Platform · Powered by Agentic Architecture
                </p>
            </div>
        </div>
    );
}
