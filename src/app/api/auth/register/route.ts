import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const POST = async (request: NextRequest) => {
    const body = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: body.email,
            password: body.password,
            name: body.name,
            ip: body.ip,
        }),
    });

    const responseData = await response.json();

    if (response.status === 200) {
        // Set cookie if needed
        // cookies().set("auth_cookie", responseData.body.refresh_token);

        return NextResponse.json(
            {
                message: "Successful Signup",
            },
            { status: 200 } // Explicitly set status
        );
    } else {
        return NextResponse.json(
            {
                message: responseData.message || "Signup failed",
                error: responseData.error || "An error occurred during Signup",
            },
            { status: response.status } // Forward the exact status code from backend
        );
    }
};
