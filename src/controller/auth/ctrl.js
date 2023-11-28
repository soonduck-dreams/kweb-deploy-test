const { UserDAO } = require("../../DAO");
const { verifyPassword, generatePassword } = require("../../lib/authentication");

// GET /auth/sign-in
const signInForm = async (req, res, next) => {
    try {
        const { user } = req.session;
        if (user == undefined) {
            return res.render("auth/sign-in.pug", { user });
        } else {
            return res.redirect("/");
        }
    } catch (err) {
        return next(err);
    }
};

// POST /auth/sign-in
const signIn = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) throw new Error("BAD_REQUEST");

        const user = await UserDAO.getByUsername(username);
        if (!user) throw new Error("UNAUTHORIZED");

        const isTrue = await verifyPassword(password, user.password);
        if (!isTrue) throw new Error("UNAUTHORIZED");

        const { id, displayName, isActive, isStaff } = user;
        req.session.user = { id, username, displayName, isActive, isStaff };
        return res.redirect("/");

    } catch (err) {
        return next(err);
    }
};

// GET /auth/sign_up
const signUpForm = async (req, res, next) => {
    try {
        const { user } = req.session;
        return res.render("auth/sign-up.pug", { user });
    } catch (error) {
        next(error);
    }
};

// POST /auth/sign_up
const signUp = async (req, res, next) => {
    try {
        const { username, password, displayName } = req.body;
        if (!username || !password || !displayName || username.length > 16 || displayName.length > 32) {
            throw new Error("BAD_REQUEST");
        }
        const hashedPassword = await generatePassword(password);
        await UserDAO.create(username, hashedPassword, displayName);
        return res.redirect("/auth/sign_in");
    } catch (error) {
        next(error);
    }
};

// GET /auth/sign_out
const signOut = async (req, res, next) => {
    try {
        req.session.destroy((err) => {
            if (err) throw err;
            else return res.redirect("/");
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    signInForm,
    signIn,
    signUpForm,
    signUp,
    signOut
};