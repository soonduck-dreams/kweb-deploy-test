const { ArticleDAO } = require("../DAO");

const indexPage = async (req, res, next) => {
    try {
        const { user } = req.session;
        return res.render("index.pug", { user });
    } catch (err) {
        next(err);
    }
};

const listArticles = async (req, res, next) => {
    try {
        const { user } = req.session;
        let { page } = req.params;
        if (page <= 0) throw new Error("BAD_REQUEST");

        page = parseInt(page);
        const articles = await ArticleDAO.getList(10 * ((page - 1)), 10);
        const hasPrev = page > 1;

        const articleNumber = await ArticleDAO.getTotalCount();
        const hasNext = articleNumber > page * 10;

        return res.render("articles/index.pug", {user, articles, page, hasPrev, hasNext});

    } catch (err) {
        next(err);
    }
};

const latestArticles = async (req, res, next) => {
    try {
        return res.redirect("/articles/page/1");
    } catch (err) {
        next(err);
    }
};

module.exports = {
    indexPage,
    listArticles,
    latestArticles,
};