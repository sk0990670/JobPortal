const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email      = profile.emails?.[0]?.value;
        const fullName   = profile.displayName;
        const avatar     = profile.photos?.[0]?.value || '';
        const googleId   = profile.id;

        if (!email) return done(new Error('No email returned from Google'), null);

        // 1. Already linked with this Google account
        let user = await User.findOne({ googleId });

        // 2. Account exists with same email (email/password signup) — link Google
        if (!user) {
          user = await User.findOne({ email });
          if (user) {
            user.googleId   = googleId;
            user.isVerified = true;
            if (!user.avatar) user.avatar = avatar;
            await user.save({ validateBeforeSave: false });
          }
        }

        // 3. Brand new user — create account
        if (!user) {
          user = await User.create({
            fullName,
            email,
            googleId,
            avatar,
            isVerified: true,
            // password field is skipped — OAuth users have no local password
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Minimal session serialization (we use JWT, not sessions, but passport needs these)
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
