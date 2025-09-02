const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '1010076677532-0nqc9aqdev36oe5bvnfa39hdlv86rpp2.apps.googleusercontent.com');

// Verify Google ID token
const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID || '1010076677532-0nqc9aqdev36oe5bvnfa39hdlv86rpp2.apps.googleusercontent.com',
    });
    
    const payload = ticket.getPayload();
    return {
      googleId: payload['sub'],
      email: payload['email'],
      name: payload['name'],
      picture: payload['picture'],
      givenName: payload['given_name'],
      familyName: payload['family_name'],
    };
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw new Error('Invalid Google token');
  }
};

// Verify user authentication
exports.verifyAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required'
      });
    }

    const userInfo = await verifyGoogleToken(idToken);
    
    res.json({
      success: true,
      message: 'Token verified successfully',
      user: userInfo
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

// Get user profile (placeholder for future use)
exports.getUserProfile = async (req, res) => {
  try {
    // This would typically fetch user data from database
    // For now, return a placeholder response
    res.json({
      success: true,
      message: 'User profile endpoint',
      user: {
        id: 'placeholder',
        name: 'User',
        email: 'user@example.com'
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
};
