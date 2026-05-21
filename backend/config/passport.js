const passport = require('passport');
const GoogleStrategy   = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');

/* ─── Google OAuth Strategy ─── */
passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email    = profile.emails?.[0]?.value;
        const fullName = profile.displayName;
        const avatar   = profile.photos?.[0]?.value || '';
        const googleId = profile.id;

        if (!email) return done(new Error('No email returned from Google'), null);

        let user = await User.findOne({ googleId });

        if (!user) {
          user = await User.findOne({ email });
          if (user) {
            user.googleId   = googleId;
            user.isVerified = true;
            if (!user.avatar) user.avatar = avatar;
            await user.save({ validateBeforeSave: false });
          }
        }

        if (!user) {
          user = await User.create({ fullName, email, googleId, avatar, isVerified: true });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

/* ─── LinkedIn OAuth Strategy ─── */
const linkedInStrategy = new LinkedInStrategy(
  {
    clientID:     process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL:  process.env.LINKEDIN_CALLBACK_URL,
    scope: ['openid', 'profile', 'email'],
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email      = profile.emails?.[0]?.value;
      const fullName   = profile.displayName;
      const avatar     = profile.photos?.[0]?.value || '';
      const linkedinId = profile.id;

      if (!email) return done(new Error('No email returned from LinkedIn'), null);

      // 1. Already linked with this LinkedIn account
      let user = await User.findOne({ linkedinId });

      // 2. Account exists with same email — link LinkedIn
      if (!user) {
        user = await User.findOne({ email });
        if (user) {
          user.linkedinId = linkedinId;
          user.isVerified = true;
          if (!user.avatar) user.avatar = avatar;
          // Note: profileUrl is not in OIDC response by default, omit if missing
          await user.save({ validateBeforeSave: false });
        }
      }

      // 3. Brand new user — create account
      if (!user) {
        user = await User.create({
          fullName,
          email,
          linkedinId,
          avatar,
          isVerified: true,
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
);

// Override the userProfile method to hit LinkedIn's new OIDC /v2/userinfo endpoint
// using native fetch to properly format the Authorization Bearer header.
linkedInStrategy.userProfile = async function(accessToken, done) {
  try {
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`LinkedIn API returned ${response.status}: ${response.statusText}`);
    }
    
    const json = await response.json();
    const profile = {
      provider: 'linkedin',
      id: json.sub,
      displayName: json.name,
      name: {
        givenName: json.given_name,
        familyName: json.family_name
      },
      emails: [{ value: json.email }],
      photos: json.picture ? [{ value: json.picture }] : [],
      _raw: JSON.stringify(json),
      _json: json
    };
    
    done(null, profile);
  } catch(e) {
    done(new Error('failed to fetch user profile from LinkedIn OIDC endpoint: ' + e.message));
  }
};

passport.use(linkedInStrategy);

// Minimal session serialization (we use JWT, not sessions)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
