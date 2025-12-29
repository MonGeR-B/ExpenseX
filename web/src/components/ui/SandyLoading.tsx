"use client";

import React from "react";
import Lottie from "lottie-react";
import animationData from "@/assets/Money-Transfer.json";

const SandyLoading = () => {
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="w-32 h-32 md:w-40 md:h-40">
                <Lottie animationData={animationData} loop={true} />
            </div>
        </div>
    );
};

export default SandyLoading;
