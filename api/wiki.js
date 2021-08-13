const Router = require('express').Router();
const wikiSnippet = require('../modules/wiki_snippet');

Router.get('/', async (req, res) => {
    const response = await wikiSnippet(req.query);
    res.send({ data: response });
});

module.exports = Router;