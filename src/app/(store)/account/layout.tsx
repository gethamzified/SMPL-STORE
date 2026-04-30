import { AccountSidebar } from "@/components/account/AccountSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Account | SMPL",
    robots: {
        index: false,
        follow: false,
    }
}

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-10 md:py-16">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
                    <AccountSidebar />
                    <div className="flex-1 min-w-0">
                        {children}
                    </div>
                </div>
            </div>
        </main>
    );
}
