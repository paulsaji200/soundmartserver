export const generateToken = (res, user) => {
    console.log("User object:", user); // Ensure user is correctly passed

    if (!user || !user._id || !user.email || !user.name) {
        return res.status(400).json({ error: "User data is missing required fields." });
    }

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, "secretKey", { expiresIn: "1d" });
    console.log("Generated token:", token); // Log the token for debugging

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only set secure in production
        maxAge: 60 * 60 * 1000, // 1 hour
        sameSite: 'strict', // Ensures the cookie is sent with cross-site requests in a safer manner
    });

    res.status(200).json({ message: "Token generated and cookie set" });
};
