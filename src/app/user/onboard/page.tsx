"use client";
import React, { useEffect } from "react";
import Wrapper from "@/components/Wrapper";
import { useRouter } from "next/navigation";

import OnboardingForm from "@/components/root/OnboardingForm";

const Onboard = async () => {
    // const user = await auth();
    // if (!user) {
    //     redirect("/user/login");
    // }
     const router = useRouter();
     useEffect(() => {
            const checkUserAuthentication = async () => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get-user`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    const data = await response.json();
                    if (!data.user || data.user.role !== 'authenticated') {
                        router.push('/user/login');
                    }
                } catch (error) {
                    console.error('Error checking user authentication:', error);
                }
            };
    
            checkUserAuthentication();
        }, [router]);

    return (
        <Wrapper className="bg-secondary-white text-secondary-black">
            <div className="relative flex h-full w-[90%] items-center justify-center">
                <OnboardingForm />
            </div>
        </Wrapper>
    );
};

export default Onboard;