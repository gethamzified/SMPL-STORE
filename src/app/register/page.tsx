"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowLeft, ArrowRight, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
// import { sendOTP, verifyOTP } from "@/app/login/actions"; // REMOVED


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useAuth } from "@/context/UserAuthContext"; // ADDED

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const otpSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type OTPFormValues = z.infer<typeof otpSchema>;

export default function RegisterPage() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { sendOTP, verifyOTP } = useAuth(); // ADDED

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const onEmailSubmit = async (data: EmailFormValues) => {
    setLoading(true);
    try {
      const result = await sendOTP(data.email);

      if (!result.success) { // CHANGED: check 'success' instead of 'error' presence
        toast.error(result.error);
      } else {
        setEmail(data.email);
        setStep("otp");
        toast.success("Code sent!", { description: "Check your email for the verification code." });
      }
    } catch (error) {
      toast.error("Something went wrong sending the code.");
    } finally {
      setLoading(false);
    }
  };

  const onOTPSubmit = async (data: OTPFormValues) => {
    setLoading(true);
    try {
      const result = await verifyOTP(email, data.code);

      if (!result.success) {
        toast.error("Invalid Code", { description: result.error });
        otpForm.setValue("code", "");
      } else {
        toast.success("Account Created", { description: "Welcome to SMPL." });
        // Redirect is handled by context state or logic, but for register we go to /account or /shop
        // Actually verifyOTP in context doesn't redirect. We do it here.
        router.push('/account');
      }
    } catch (error) {
      toast.error("Failed to verify code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex lg:grid lg:grid-cols-2 overflow-hidden">
      {/* Editorial Side - Hidden on mobile */}
      <div className="hidden lg:block relative bg-white border-r border-white/5">
        <Image
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1976&auto=format&fit=crop"
          alt="Editorial"
          fill
          className="object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out"
          priority
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Link href="/" className="text-2xl font-display uppercase tracking-[0.3em] font-black text-white hover:opacity-70 transition-opacity">
            SMPL
          </Link>
          <div className="space-y-4">
            <h2 className="text-5xl font-display uppercase tracking-widest font-bold text-white leading-tight">
              Join<br />SMPL
            </h2>
            <p className="text-white/40 max-w-sm tracking-wide leading-relaxed uppercase text-xs">
              Exclusive access to new drops, private sales, and curated content.
            </p>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full relative flex items-center justify-center p-8 bg-black">
        {/* Back Button */}
        <Link
          href="/login"
          className="absolute top-8 left-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors group z-10"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back
        </Link>
        <div className="w-full max-w-[380px] space-y-12 mt-8 lg:mt-0">
          <div className="space-y-4">
            <div className="lg:hidden">
              <Link href="/" className="text-xl font-display uppercase tracking-widest font-black text-white mb-12 block text-center">
                SMPL
              </Link>
            </div>
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-3xl font-display uppercase tracking-[0.2em] font-light text-white italic">
                {step === "email" ? "Membership" : "Confirmation"}
              </h1>
              <p className="text-sm text-white/40 tracking-wider">
                {step === "email"
                  ? "Create your account to begin."
                  : `Please enter the 6-digit code sent to ${email}`}
              </p>
            </div>
          </div>

          <div>
            {step === "email" ? (
              <div key="email-step" className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-8">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold ml-1">Email Address</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white transition-colors" />
                              <Input
                                placeholder="name@domain.com"
                                {...field}
                                className="bg-transparent border-white/10 rounded-none h-14 pl-12 focus:border-white focus:ring-0 transition-all text-white placeholder:text-white/20"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase tracking-widest" />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full h-14 rounded-none bg-white text-black hover:bg-neutral-200 uppercase tracking-[0.3em] font-black text-xs transition-all duration-300 group"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span className="flex items-center gap-2">
                          Continue <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="text-center pt-4">
                  <Link href="/login" className="text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">
                    Already a member? Login
                  </Link>
                </div>
              </div>
            ) : (
              <div key="otp-step" className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-300">
                <Form {...otpForm}>
                  <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-10">
                    <div className="space-y-4">
                      <FormLabel className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold ml-1 block text-center lg:text-left">Activation Code</FormLabel>
                      <div className="flex justify-center lg:justify-start">
                        <FormField
                          control={otpForm.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormControl>
                                <InputOTP maxLength={6} {...field} className="w-full flex justify-between gap-2">
                                  <InputOTPGroup className="gap-2 sm:gap-4 w-full justify-between">
                                    {[0, 1, 2, 3, 4, 5].map((i) => (
                                      <InputOTPSlot
                                        key={i}
                                        index={i}
                                        className="w-10 sm:w-12 h-14 sm:h-16 rounded-none border-white/10 bg-transparent text-white focus:border-white focus:ring-1 focus:ring-white transition-all text-lg font-light"
                                      />
                                    ))}
                                  </InputOTPGroup>
                                </InputOTP>
                              </FormControl>
                              <FormMessage className="text-[10px] uppercase tracking-widest text-center" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Button
                        type="submit"
                        className="w-full h-14 rounded-none bg-white text-black hover:bg-neutral-200 uppercase tracking-[0.3em] font-black text-xs transition-all"
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Complete Registration"}
                      </Button>
                      <Button
                        variant="link"
                        className="w-full text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors flex items-center justify-center gap-2 group"
                        onClick={() => setStep("email")}
                        type="button"
                      >
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Change Email
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </div>

          {/* Footer Branding */}
          <div className="pt-24 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              <UserPlus className="w-3 h-3 text-white/20" />
              <span className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-bold">Account Registration</span>
            </div>
            <p className="text-[10px] text-white/10 tracking-widest">© 2026 SMPL VISIONARY LABS. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
