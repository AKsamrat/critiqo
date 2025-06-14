import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "./services/AuthService";

type Role = keyof typeof roleBasedPrivateRoutes;

const authRoutes = ["/login", "/register"];

const roleBasedPrivateRoutes = {
    ADMIN: [
        /^\/admin$/,
        /^\/admin\/user$/,
        /^\/admin\/reviews$/,
        /^\/admin\/aPublished$/,
        /^\/admin\/aUnpublished$/,
        /^\/admin\/createcategory$/,
        /^\/profile$/,
        /^\/reviews\/[^\/]+$/, // PRIVATE: /reviews/[reviewId]
    ],
    GUEST: [
        /^\/guest$/,
        /^\/guest\/myreviews$/,
        /^\/guest\/myreviews\/[^\/]+$/, // ✅ Added this line for dynamic review ID
        /^\/guest\/mypurchases$/,
        /^\/profile$/,
        /^\/reviews\/[^\/]+$/, // PRIVATE: /reviews/[reviewId]
    ]
};


export const middleware = async (request: NextRequest) => {
    const { pathname } = request.nextUrl;

    // Get the current user
    const userInfo = await getCurrentUser();

    // Check if pathname is a public route
    const isPublicRoute = authRoutes.includes(pathname) || pathname === "/reviews";

    // If NOT logged in
    if (!userInfo) {
        if (isPublicRoute) {
            return NextResponse.next();
        }

        if (/^\/reviews\/[^\/]+$/.test(pathname)) {
            return NextResponse.redirect(
                new URL(`/login?redirectPath=${pathname}`, request.url)
            );
        }

        return NextResponse.redirect(
            new URL(`/login?redirectPath=${pathname}`, request.url)
        );
    }

    // ✅ Handle logged-in users

    // If user is logged in and the route is public, allow
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Role-based access control
    if (userInfo.role && roleBasedPrivateRoutes[userInfo.role as Role]) {
        const allowedRoutes = roleBasedPrivateRoutes[userInfo.role as Role];

        if (allowedRoutes.some((route) => route.test(pathname))) {
            return NextResponse.next();
        }
    }

    // If no access, redirect
    return NextResponse.redirect(new URL("/", request.url));
};


export const config = {
    matcher: [
        "/login",
        "/register",
        "/admin/:path*",
        "/guest/:path*",
        "/guest",
        "/profile",
        "/reviews/:path*", // ensures middleware runs on /reviews/[id]
    ],
};
