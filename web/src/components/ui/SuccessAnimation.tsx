"use client";

import React from "react";
import Lottie from "lottie-react";
import animationData from "@/assets/successful.json";

const SuccessAnimation = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="w-48 h-48">
                <Lottie
                    animationData={animationData}
                    loop={false}
                    autoplay={true}
                />
            </div>
            <p className="text-slate-900 font-bold text-lg mt-4">Transaction Added!</p>
        </div>
    );
};

export default SuccessAnimation;
