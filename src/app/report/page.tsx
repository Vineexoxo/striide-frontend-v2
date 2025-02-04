
"use client";
import { FC, useEffect } from 'react'
import ReportForm from '@/components/reports/ReportsForm'
import { checkAuthCookie } from '@/lib/check-auth';
import { useRouter } from 'next/navigation'

const page: FC = ({ }) => {
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

    return <ReportForm />
}


export default page