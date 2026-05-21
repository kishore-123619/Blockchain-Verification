import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Student from "../models/Student.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_REDIRECT_URI ||
        "https://blockchain-verification-x6sp.onrender.com/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await Student.findOne({ email: profile.emails[0].value });

        if (!user) {
          // Create a new user if one doesn't exist
          user = await Student.create({
            username: profile.emails[0].value.split("@")[0],
            email: profile.emails[0].value,
            name: profile.displayName,
            rollNumber: `G-${profile.id.substring(0, 10)}`,
            department: "General",
            year: new Date().getFullYear(),
            role: "student",
            isEmailVerified: true,
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Student.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
