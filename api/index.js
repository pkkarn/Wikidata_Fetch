const express = require('express');
const router = express.Router();
const wiki = require('./wiki');

router.get('/', (req, res) => {
	res.json({
		message: 'API -👋🌎🌍🌏',
	});
});

router.use('/wiki', wiki);

module.exports = router;
