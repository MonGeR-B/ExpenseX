"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import SandyLoading from "@/components/ui/SandyLoading";

interface ImmersiveRevealProps {
    isLoading: boolean;
}

const ImmersiveReveal: React.FC<ImmersiveRevealProps> = ({ isLoading }) => {
    return (
        <AnimatePresence mode="wait">
            {isLoading && (
                <motion.div
                    key="immersive-loader"
                    initial={{ y: 0 }}
                    exit={{ y: "-100%" }}
                    transition={{
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1], // Custom "heavy curtain" bezier
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black"
                >
                    <SandyLoading />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ImmersiveReveal;
