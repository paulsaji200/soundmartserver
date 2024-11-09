import jwt from "jsonwebtoken";

export const generateToken = (res, user) => {
    if (!user?._id || !user?.email || !user?.name) {
        throw new Error('Missing required user data for token generation');
    }

    // Use environment variable for JWT secret
    const JWT_SECRET = process.env.JWT_SECRET || "secretKey"; // Still, strongly recommend using env variable
    
    // Include only necessary user data in token
    const token = jwt.sign(
        {
            id: user._id,
            email: user.email,
            name: user.name
        },
        JWT_SECRET,
        {
            expiresIn: "24h"
        }
    );

    // Configure cookie options based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction, // Only true in production
        sameSite: isProduction ? 'none' : 'strict', // 'none' for cross-site requests in production
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        path: '/',
        domain: isProduction ? process.env.COOKIE_DOMAIN : 'localhost' // Set your domain in production
    });

    return token; // Optionally return token for additional uses
};

// Helper function to clear token
export const clearToken = (res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });
};