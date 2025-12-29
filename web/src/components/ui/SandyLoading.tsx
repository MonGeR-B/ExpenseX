"use client";

import React from "react";
import Lottie from "lottie-react";
import animationData from "@/assets/Flying Coin.json";

const SandyLoading = () => {
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="w-52 h-52 md:w-40 md:h-40">
                <Lottie animationData={animationData} loop={true} />
            </div>
        </div>
    );
};

export default SandyLoading;
