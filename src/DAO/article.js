const { runQuery } = require("../lib/database");

const formatDate = date => {
    const yr = date.getFullYear();
    const mon = date.getMonth() + 1;
    const dt = date.getDate();
    const hrs = date.getHours();
    const mins = date.getMinutes();
    const secs = date.getSeconds();
    return `${yr}. ${mon}. ${dt} ${hrs}:${mins}:${secs}`;
};

const replaceDate = article => {
    if (article) {
        article.createdAt = formatDate(article.createdAt);
        article.lastUpdated = formatDate(article.lastUpdated);
    }
    return article;
};

const getList = async (start, count) => {
    const sql = 'SELECT B.id AS id, B.title AS title, B.created_at AS createdAt, B.last_updated AS lastUpdated, A.display_name AS displayName FROM users AS A INNER JOIN articles AS B ON A.id = B.author WHERE B.is_active = 1 AND B.is_deleted = 0 ORDER BY B.id DESC LIMIT ?, ?';
    let res = await runQuery(sql, [start, count]);
    for (let row of res) {
        replaceDate(row);
    }
    return res;
    // res.map(replaceDate); 라고 해도 같음
};

const getTotalCount = async () => {
    const sql = 'SELECT COUNT(*) AS cnt FROM articles WHERE is_active=1 AND is_deleted=0';
    let res = await runQuery(sql, []);
    return res[0].cnt;
};

const getById = async (id) => {
    const sql = 'SELECT B.id AS id, B.title AS title, B.content AS content, B.created_at AS createdAt, B.last_updated AS lastUpdated, B.author AS author, A.display_name AS displayName FROM users AS A INNER JOIN articles AS B ON A.id = B.author WHERE B.id = ? AND B.is_active = 1 AND B.is_deleted = 0';
    let res = await runQuery(sql, [id]);
    
    return replaceDate(res[0]);
};

const getByIdAndAuthor = async (id, author) => {
    const sql = 'SELECT title, content, author, created_at AS createdAt, last_updated AS lastUpdated FROM articles WHERE id = ? AND author = ? AND is_active = 1 AND is_deleted = 0';
    let res = await runQuery(sql, [id, author.id]);

    return replaceDate(res[0]);
};

const create = async (title, content, author) => {
    const sql = 'INSERT INTO articles VALUES (DEFAULT, ?, ?, ?, DEFAULT, DEFAULT, DEFAULT, DEFAULT)';
    let res = await runQuery(sql, [title, content, author.id]);
    return res.insertId;
};

const update = async (id, title, content) => {
    const sql = 'UPDATE articles SET title=?, content=? WHERE id = ?';
    await runQuery(sql, [title, content, id]);
};

const remove = async (id) => {
    const sql = 'UPDATE articles SET is_deleted=1 WHERE id=?';
    await runQuery(sql, [id]);
};

module.exports = {
    getList,
    getTotalCount,
    getById,
    getByIdAndAuthor,
    create,
    update,
    remove,
};