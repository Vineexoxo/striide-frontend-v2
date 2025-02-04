"use client";

import React, { useEffect } from "react";
import Feedback from "@/components/feedback/Feedback";
import { checkAuthCookie } from "@/lib/check-auth";
import { useRouter } from "next/navigation";

const Page = () => {
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

    return <Feedback />;
};

export default Page;
