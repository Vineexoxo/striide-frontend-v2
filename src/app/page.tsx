"use client";

import * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/root/Logo";
import Welcome from "@/components/root/Welcome";
import Wrapper from "@/components/Wrapper";
export default function Home() {
    const router = useRouter();

    return (
        <Wrapper className="bg-landing-linear-gradient">
            <Logo
                exit={{
                    fontSize: "30px",
                     top: "30%",
                    x: 0,
                    opacity: 0,
                    transition: { duration: 1, ease: "easeInOut" },
                }}
                animate={true}
            >
                <Welcome />
            </Logo>
        </Wrapper>
    );
}