const app = require("./startup/app");
const db = require("./startup/db");
require("./routers")(app);

app.use((err, req, res, next) => {
	let { statusCode, message } = err;
	statusCode = statusCode || 500;
	return res.status(statusCode).json({ message });
});

app.use((req, res, next) => {
	res.send("No page found");
});

db()
	.then(() => {
		app.listen(process.env.PORT, () => {
			console.log(`server started at port: ${process.env.PORT}`);
		});
	})
	.catch((err) => {
		throw err;
	});
