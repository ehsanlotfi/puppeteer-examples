var variables = require('./variable');
var https = require('https');
var http = require('http');
var fs = require('fs');

const puppeteer = require('puppeteer-core');
var cors = require('cors')

var express = require('express');
var app = express();

var optionsSSL = {
	pfx: fs.readFileSync('localhost.pfx'),
	passphrase: "12345678"
};
	

app.use(cors())

var bodyParser = require('body-parser');

app.use(bodyParser.json())

app.get('/', function (req, res) {
	console.log("get request!")
	res.send("'Get Request done!'");
})

app.post('/', function (req, res) {
	console.time("step1: Runing PDF Downloader!");
	req.setTimeout(0);


	(async () => {


		const browser = await puppeteer.launch(
			{
				headless: true,
				executablePath: variables.executablePath,
				ignoreHTTPSErrors: true
			});

		const timeout = 90000000;
        console.timeEnd("step1: Runing PDF Downloader!")
		console.time("step2: chrome Lanche!");

		const page = await browser.newPage()
        await page.goto(req.body.host, { timeout, waitUntil: 'networkidle0' }).catch(error => {
            console.log("host lanche", error);
        })

        console.timeEnd("step2: chrome Lanche!")

		console.time("step3: login!");
		await page.focus('.username')
		await page.keyboard.type('super-admin-systems')

		await page.focus('.password')
		await page.keyboard.type('123qwe!@#')

		await Promise.all([
			page.click("button.btn"),
			page.waitForNavigation({ timeout, waitUntil: 'networkidle0' }),
        ]).catch(error => {
			console.log("login", error);
        });

		console.timeEnd("step3: login!");


		console.time("step4: redirect to url");
        await page.goto(req.body.url, { timeout, waitUntil: 'networkidle0' }).catch(error => {
            console.log("redirect to url", error);
        })


		var removerElement = req.body.ignoreElements;

		for (let i = 0; i < removerElement.length; i++) {
			await page.evaluate((removerElement, i) => {
				console.log(removerElement[i]);
				let dom = document.querySelector(removerElement[i]);
				if (dom) {
					dom.parentNode.removeChild(dom);
				}
			}, removerElement, i);
		}

		console.timeEnd("step4: redirect to url");


		console.time("step5: create pdf");

		await page.emulateMedia('screen');

		const options = Object.assign({
			path: 'medium.pdf',
			format: 'A4',
			printBackground: true,
			PreferCSSPageSize: true,
		}, req.body.options);

		const buffer = await page.pdf(options)

		console.timeEnd("step5: create pdf");

		res.type('application/pdf');
		res.send(buffer);

		await browser.close()


	})();

})


http.createServer(app).listen(variables.httpPort);

https.createServer(optionsSSL, app).listen(5555 , function() {
	console.log('Listening on port: 5555');
});
