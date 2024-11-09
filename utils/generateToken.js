export const generateToken = (res, user) => {
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, "secretKey", { expiresIn: "1d" });

    console.log("Generated Token:", token); // Log the token

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Secure if in production
        maxAge: 60 * 60 * 1000,  // 1 hour
        sameSite: 'None',        // Ensure it's accessible cross-site
        domain: '.yourdomain.com' // Adjust for cross-domain cookies
    });
};
