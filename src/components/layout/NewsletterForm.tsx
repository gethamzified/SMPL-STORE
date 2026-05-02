"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Check } from "lucide-react";
import { subscribeToNewsletter } from "@/lib/api/newsletter";
import { cn } from "@/lib/utils";

interface NewsletterFormProps {
    className?: string;
    placeholder?: string;
    dark?: boolean;
}

export function NewsletterForm({ className, placeholder = "Email Address", dark }: NewsletterFormProps) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) return;

        setStatus("loading");
        setMessage("");

        try {
            const result = await subscribeToNewsletter(email);

            if (result.error) {
                setStatus("error");
                setMessage(result.error);
            } else {
                setStatus("success");
                setMessage(result.message || "Successfully subscribed!");
                setEmail("");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Something went wrong. Please try again.");
        }
    };

    return (
        <div className={cn("w-full", className)}>
            {status === "success" ? (
                <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium py-2">
                    <Check className="w-5 h-5" />
                    <span>{message}</span>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="relative group">
                    <div className={cn(
                        "flex items-center border-b-2 transition-colors duration-300 pb-2",
                        dark ? "border-white/20 focus-within:border-white" : "border-black/20 focus-within:border-black"
                    )}>
                        <input
                            type="email"
                            placeholder={placeholder}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status === "loading"}
                            className={cn(
                                "bg-transparent placeholder:text-black/40 text-lg md:text-xl font-medium w-full focus:outline-none transition-colors",
                                dark ? "text-white placeholder:text-white/40" : "text-black placeholder:text-black/40",
                                status === "loading" && "opacity-50"
                            )}
                        />
                        <button
                            type="submit"
                            disabled={status === "loading" || !email.trim()}
                            className={cn(
                                "transition-colors disabled:opacity-30 ml-4 font-bold uppercase tracking-wider text-sm",
                                dark ? "text-white hover:text-white/70" : "text-black hover:text-black/70"
                            )}
                            aria-label="Subscribe"
                        >
                            {status === "loading" ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "OK"
                            )}
                        </button>
                    </div>

                    {status === "error" && message && (
                        <p className="absolute -bottom-6 left-0 text-red-500 text-xs font-medium">{message}</p>
                    )}
                </form>
            )}
        </div>
    );
}
