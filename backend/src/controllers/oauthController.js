const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Temporary in-memory store for one-time OAuth exchange codes.
// These codes expire quickly and can only be used once.
const exchangeCodes = new Map();


// ============================================
// Generate PKCE Code Verifier
// ============================================

const generateCodeVerifier = () => {
    return crypto.randomBytes(32).toString('base64url');
};


// ============================================
// Generate PKCE Code Challenge
// ============================================

const generateCodeChallenge = (codeVerifier) => {
    return crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');
};


// ============================================
// Start Google OAuth
// ============================================

const googleLogin = (req, res) => {
    try {
        // Generate OAuth state
        const state = crypto
            .randomBytes(32)
            .toString('hex');

        // Generate PKCE verifier
        const codeVerifier = generateCodeVerifier();

        // Generate PKCE challenge
        const codeChallenge =
            generateCodeChallenge(codeVerifier);

        // Create Google authorization URL
        const authUrl = googleClient.generateAuthUrl({
            access_type: 'offline',

            scope: [
                'openid',
                'email',
                'profile'
            ],

            state,

            prompt: 'select_account',

            // PKCE
            code_challenge: codeChallenge,
            code_challenge_method: 'S256'
        });

        // Store OAuth state in HTTP-only cookie
        // secure:false is required for local HTTP development.
        res.cookie('oauth_state', state, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 10 * 60 * 1000
        });

        // Store PKCE verifier in HTTP-only cookie
        res.cookie('oauth_code_verifier', codeVerifier, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 10 * 60 * 1000
        });

        // Redirect user to Google
        res.redirect(authUrl);

    } catch (error) {
        console.error(
            'Google OAuth start error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Unable to start Google authentication'
        });
    }
};


// ============================================
// Google OAuth Callback
// ============================================

const googleCallback = async (req, res) => {
    try {
        const {
            code,
            state
        } = req.query;

        // ----------------------------------------
        // Validate required OAuth parameters
        // ----------------------------------------

        if (!code || !state) {
            return res.status(400).json({
                success: false,
                message: 'Missing OAuth code or state'
            });
        }


        // ----------------------------------------
        // Validate OAuth state
        // ----------------------------------------

        const savedState =
            req.cookies.oauth_state;

        if (
            !savedState ||
            savedState !== state
        ) {
            return res.status(403).json({
                success: false,
                message: 'Invalid OAuth state'
            });
        }


        // ----------------------------------------
        // Get PKCE verifier
        // ----------------------------------------

        const codeVerifier =
            req.cookies.oauth_code_verifier;

        if (!codeVerifier) {
            return res.status(403).json({
                success: false,
                message: 'Missing PKCE code verifier'
            });
        }


        // ----------------------------------------
        // Clear OAuth cookies
        // ----------------------------------------

        res.clearCookie('oauth_state', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });

        res.clearCookie('oauth_code_verifier', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });


        // ----------------------------------------
        // Exchange authorization code for tokens
        // ----------------------------------------

        const { tokens } =
            await googleClient.getToken({
                code,
                codeVerifier
            });


        if (!tokens.id_token) {
            return res.status(401).json({
                success: false,
                message: 'Google ID token was not returned'
            });
        }


        // ----------------------------------------
        // Verify Google ID token
        // ----------------------------------------

        const ticket =
            await googleClient.verifyIdToken({
                idToken: tokens.id_token,
                audience: process.env.GOOGLE_CLIENT_ID
            });


        const payload =
            ticket.getPayload();


        if (!payload) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Google ID token'
            });
        }


        // ----------------------------------------
        // Extract Google account information
        // ----------------------------------------

        const {
            sub: googleId,
            email,
            email_verified: emailVerified,
            name,
            picture
        } = payload;


        if (
            !email ||
            !emailVerified
        ) {
            return res.status(400).json({
                success: false,
                message: 'Google account email is not verified'
            });
        }


        // ----------------------------------------
        // Find existing Google user
        // ----------------------------------------

        let user =
            await User.findOne({
                googleId
            });


        // ----------------------------------------
        // If Google ID doesn't exist,
        // check existing email
        // ----------------------------------------

        if (!user) {
            user =
                await User.findOne({
                    email
                });


            if (user) {
                // Link Google account to
                // existing verified account
                user.googleId = googleId;
                user.authProvider = 'google';
                user.isVerified = true;

                await user.save();

            } else {
                // ----------------------------------------
                // Create new Google user
                // ----------------------------------------

                const generatedUsername =
                    name?.replace(/\s+/g, '').toLowerCase() ||
                    email.split('@')[0];

                let username =
                    generatedUsername;


                // Make username unique
                const usernameExists =
                    await User.findOne({
                        username
                    });


                if (usernameExists) {
                    username =
                        `${generatedUsername}${Date.now()}`;
                }


                user = new User({
                    username,

                    email,

                    googleId,

                    authProvider: 'google',

                    // New Google users are always normal users
                    role: 'user',

                    isVerified: true,

                    sustainabilityScore: 0,

                    wasteScore: 0
                });


                await user.save();
            }
        }


        // ----------------------------------------
        // Create application JWT
        // ----------------------------------------

        const token =
            jwt.sign(
                {
                    // Same payload shape as authController.js:
                    // authMiddleware reads decoded.user
                    user: {
                        id: user.id,
                        role: user.role
                    }
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: '1h'
                }
            );


        // ----------------------------------------
        // Generate one-time exchange code
        // ----------------------------------------

        const exchangeCode =
            crypto.randomBytes(32).toString('hex');


        exchangeCodes.set(
            exchangeCode,
            {
                token,

                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    authProvider: user.authProvider,
                    picture: picture || null
                },

                expiresAt:
                    Date.now() + 60 * 1000
            }
        );


        // ----------------------------------------
        // Redirect to frontend
        // ----------------------------------------

        const clientUrl =
            process.env.CLIENT_URL ||
            'http://localhost:5173';


        return res.redirect(
            `${clientUrl}/oauth/callback?code=${exchangeCode}`
        );


    } catch (error) {
        console.error(
            'Google OAuth error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Google authentication failed'
        });
    }
};


// ============================================
// Exchange One-Time OAuth Code
// ============================================

const exchangeOAuthCode = (req, res) => {
    try {
        const {
            code
        } = req.body;


        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Exchange code is required'
            });
        }


        const storedData =
            exchangeCodes.get(code);


        if (!storedData) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or already used exchange code'
            });
        }


        // Check expiration
        if (
            Date.now() >
            storedData.expiresAt
        ) {
            exchangeCodes.delete(code);

            return res.status(401).json({
                success: false,
                message: 'Exchange code expired'
            });
        }


        // Delete immediately.
        // This makes the code one-time use.
        exchangeCodes.delete(code);


        return res.status(200).json({
            success: true,
            token: storedData.token,
            user: storedData.user
        });


    } catch (error) {
        console.error(
            'OAuth exchange error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'OAuth code exchange failed'
        });
    }
};


// ============================================
// Export Controllers
// ============================================

module.exports = {
    googleLogin,
    googleCallback,
    exchangeOAuthCode
};