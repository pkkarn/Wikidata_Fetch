const app = require('./app');

const port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log('---------------------x------------------x---------------');
	console.log(`Listening: http://localhost:${port}`);
	console.log('---------------------x------------------x---------------');
});
