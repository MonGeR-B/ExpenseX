"use client";

import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import Lottie from "lottie-react";
import underwaterAnimation from "../../assets/Underwater Ocean Fish and Turtle.json";

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-full bg-transparent text-white font-sans flex flex-col relative">
            {/* Global Background */}
            <div className="fixed inset-0 -z-50 bg-[#e0f7fa] w-screen h-screen overflow-hidden pointer-events-none">
                <Lottie
                    animationData={underwaterAnimation}
                    loop={true}
                    className="absolute inset-0 w-full h-full"
                    style={{ width: '100vw', height: '100vh', objectFit: 'cover' }}
                    rendererSettings={{
                        preserveAspectRatio: "xMidYMid slice",
                        className: "w-full h-full"
                    }}
                />
            </div>

            <Topbar />
            <main className="flex-1 px-4 sm:px-6 py-4 sm:py-8 relative z-10 overflow-y-auto overflow-x-hidden pb-24 lg:pb-8">
                {children}
            </main>
            <MobileNav />
        </div>
    );
}
