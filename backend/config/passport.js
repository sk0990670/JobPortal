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
passport.use(
  new LinkedInStrategy(
    {
      clientID:     process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL:  process.env.LINKEDIN_CALLBACK_URL,
      // Requires "Sign In with LinkedIn using OpenID Connect" product in LinkedIn Console
      scope: ['openid', 'profile', 'email'],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email      = profile.emails?.[0]?.value;
        const fullName   = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
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
            if (!user.profiles.linkedin && profile.profileUrl) {
              user.profiles.linkedin = profile.profileUrl;
            }
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
            profiles: { linkedin: profile.profileUrl || '' },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

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
