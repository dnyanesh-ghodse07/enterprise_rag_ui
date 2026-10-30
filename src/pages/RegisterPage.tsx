import { useState } from "react";
import { useNavigate } from "react-router";
import { registerUser } from "../api/client";
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
import { 
    Sparkles, 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    AlertCircle, 
    ArrowRight,
    User,
    Building2,
    Globe
} from "lucide-react";
import { ThemeToggle } from "../components/theme-toggle";

export default function RegisterPage() {
    const navigate = useNavigate();

    // Form fields
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [orgName, setOrgName] = useState("");
    const [slug, setSlug] = useState("");
    const [isCustomSlug, setIsCustomSlug] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-generate slug from organization name
    const slugify = (text: string) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    const handleOrgNameChange = (val: string) => {
        setOrgName(val);
        if (!isCustomSlug) {
            setSlug(slugify(val));
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!fullName.trim() || !email.trim() || !orgName.trim() || !password) {
            setError("All fields are required.");
            return;
        }

        const cleanSlug = (slug || slugify(orgName)).trim();
        if (!cleanSlug || cleanSlug.length < 2) {
            setError("Organization slug must be at least 2 characters long.");
            return;
        }

        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
            setError("Slug can only contain lowercase letters, numbers, and single hyphens.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            await registerUser({
                email: email.trim(),
                password: password,
                full_name: fullName.trim(),
                tenant: {
                    name: orgName.trim(),
                    slug: cleanSlug,
                },
            });

            navigate("/chat/conversations");
        } catch (err: any) {
            console.error("Registration failed:", err);
            setError(err?.message || "Registration failed. Please check your details or try a different slug.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 py-8 bg-background overflow-hidden selection:bg-primary/20">
            {/* Top right Theme Toggle */}
            <div className="absolute top-4 right-4 z-20">
                <ThemeToggle />
            </div>

            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-primary/15 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-purple-500/15 blur-[120px]" />

            <div className="w-full max-w-lg relative z-10 animate-in fade-in-50 zoom-in-95 duration-200">
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

                {/* Registration Card */}
                <Card className="border-border/80 bg-card/90 backdrop-blur-md shadow-xl overflow-hidden">
                    <CardHeader className="space-y-1 p-6 pb-4 border-b border-border/50">
                        <CardTitle className="text-lg font-semibold tracking-tight">
                            Create your organization account
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Get started with enterprise RAG and semantic knowledge search
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 pt-5">
                        <form onSubmit={handleRegister} className="space-y-4">
                            {/* Error Alert */}
                            {error && (
                                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5 animate-in fade-in-50 duration-150">
                                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                                    <span className="leading-snug">{error}</span>
                                </div>
                            )}

                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="fullName" className="text-xs font-medium">
                                    Full Name
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                    <Input
                                        id="fullName"
                                        type="text"
                                        placeholder="Alice Johnson"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        disabled={isLoading}
                                        required
                                        className="pl-9 h-10 text-xs sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* Email Input */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-medium">
                                    Work Email Address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="alice@acme.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                        required
                                        className="pl-9 h-10 text-xs sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* Organization Name & Slug in Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div className="space-y-1.5">
                                    <Label htmlFor="orgName" className="text-xs font-medium">
                                        Organization Name
                                    </Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                        <Input
                                            id="orgName"
                                            type="text"
                                            placeholder="Acme Corporation"
                                            value={orgName}
                                            onChange={(e) => handleOrgNameChange(e.target.value)}
                                            disabled={isLoading}
                                            required
                                            className="pl-9 h-10 text-xs sm:text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="slug" className="text-xs font-medium">
                                        Workspace Slug
                                    </Label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                        <Input
                                            id="slug"
                                            type="text"
                                            placeholder="acme-corp"
                                            value={slug}
                                            onChange={(e) => {
                                                setIsCustomSlug(true);
                                                setSlug(e.target.value.toLowerCase());
                                            }}
                                            disabled={isLoading}
                                            required
                                            className="pl-9 h-10 text-xs sm:text-sm font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Password & Confirm Password */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div className="space-y-1.5">
                                    <Label htmlFor="password" className="text-xs font-medium">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min 8 characters"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={isLoading}
                                            required
                                            minLength={8}
                                            className="pl-9 pr-8 h-10 text-xs sm:text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="confirmPassword" className="text-xs font-medium">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                        <Input
                                            id="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Re-type password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={isLoading}
                                            required
                                            minLength={8}
                                            className="pl-9 h-10 text-xs sm:text-sm"
                                        />
                                    </div>
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
                                        <span>Creating Account & Workspace...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Account & Workspace</span>
                                        <ArrowRight className="size-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    {/* Footer: Link to Sign In */}
                    <CardFooter className="flex flex-col gap-2 p-4 bg-muted/40 border-t border-border/50 text-center">
                        <p className="text-xs text-muted-foreground">
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="font-semibold text-primary hover:underline underline-offset-2"
                            >
                                Sign in
                            </button>
                        </p>
                    </CardFooter>
                </Card>

                {/* Footer copyright */}
                <p className="text-[11px] text-center text-muted-foreground/60 mt-6">
                    Cognix AI Platform · Enterprise RAG Ingestion & Vector Retrieval
                </p>
            </div>
        </div>
    );
}