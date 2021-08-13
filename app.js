const express = require('express');
const cors = require('cors');
const api = require('./api');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	res.json({
		message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
	});
});

app.use('/api', api);

module.exports = app;
