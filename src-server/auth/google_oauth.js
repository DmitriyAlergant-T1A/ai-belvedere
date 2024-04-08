import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';

// Passport session setup.
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Use the GoogleStrategy within Passport.
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5500/auth/google/callback"
  },
  (accessToken, refreshToken, profile, cb) => {
    // In a real application, you might save the profile information in a database
    return cb(null, profile);
  }
));

// Initialize Passport and restore authentication state, if any, from the session.
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
