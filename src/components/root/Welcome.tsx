"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "../Button";
import Link from "next/link";
import log from "@/logger";

import Image from "next/image";


const WelcomePage = () => {
    return (
        
        <div className="relative z-10 w-full flex flex-col justify-evenly">
      <div className="absolute top-0 left-0 w-full ">
            <Image
            src="/png2.svg"
            alt="Striide for BITS GOA"
            width={1920}     
            height={1080}     
            className="w-full h-auto" 
        />
      </div>
            <div className="flex h-fit w-full flex-col items-center gap-[82px]">
                <div className=" text-secondary-white flex w-full justify-center gap-[10px] ">
            
                    <motion.div
                initial={{ opacity: 0,x: 140, y: 170 }}
                animate={{ opacity: 1, x: 140, y: 220, transition: { duration: 1, delay: 0.8 } }}
                className="font-playfair text-secondary-white text-[40px]  text-center font-normal"
            >
                Striide
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 170 , x:35}}
                animate={{ opacity: 1, y: 270, x:35, transition: { duration: 1, delay: 0.5 } }}
                className="font-playfair text-secondary-white text-[30px] text-center font-thin"

            >
                <span className="font-poiret font-thin">for</span> BITS GOA
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 150 }}
                animate={{ opacity: 1, y: 50, transition: { duration: 1, delay: 1 } }}
                className="flex w-full flex-col items-center justify-center gap-[20px] pt-[50px]"
            ></motion.div>

                </div>
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: 1,
                        transition: { duration: 0.5, delay: 0.5 },
                    }}
                    className="font-nunito text-secondary-white w-[323px] pl-[5px] text-[20px] font-light leading-[28px]"
                >

                </motion.h2>
            </div>
            <motion.div
                initial={{
                    opacity: 0,
                    y: 150,
                }}
                animate={{
                    opacity: 1,
                    y: 80,
                    transition: {
                        duration: 1,
                        delay: 1,
                    },
                }}
                className="flex w-full flex-col items-center justify-center gap-[20px] pt-[50px]"
            >
                <Link
                    href="/user/signup"
                    className="flex w-full items-center justify-center"
                >
                    <Button variant="secondary" size="full" className="w-[80%]">
                        Sign Up
                    </Button>
                </Link>
                <Link
                    href="/user/login"
                    className="flex w-full items-center justify-center"
                >
                    <Button
                        variant="transparent"
                        size="full"
                        className="w-[80%]"
                    >
                        Log In
                    </Button>
                </Link>
            </motion.div>
        </div>
    );
};

export default WelcomePage;
