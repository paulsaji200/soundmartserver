import jwt from "jsonwebtoken";

export const generateToken = (res, user) => {
    const IS_PRODUCTION = process.env.NODE_ENV === 'production';
    
    if (!user || !user._id || !user.email || !user.name) {
        console.error("User data is incomplete:", user);
        return;
    }

    console.log("Generating token for user:", user);

    const token = jwt.sign(
        { id: user._id, email: user.email, name: user.name },
        "secretKey",
        { expiresIn: "1d" }
    );

    res.cookie('token', token, {
        httpOnly: true,
        secure: IS_PRODUCTION, // Only secure in production
        maxAge: 60 * 60 * 1000, // 1 hour
        sameSite: 'None',       // Required for cross-site cookies
        domain: 'soundmart.life'
    });
};
