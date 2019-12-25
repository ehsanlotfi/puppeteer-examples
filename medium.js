const puppeteer = require('puppeteer-core');

const url = "https://medium.com/towards-artificial-intelligence/deep-learning-series-chapter-1-introduction-to-deep-learning-d790feb974e2"


const proxies = [
  "194.67.37.90:3128",
  "41.215.74.234:53028",
  "50.7.87.220:38082",
  "91.230.199.174:54990",
  "103.111.56.60:53281",
  "94.43.142.190:58365"
];

const randProxy = () =>
  proxies[Math.floor(Math.random() * (proxies.length - 1))];

const autoScroll = page =>
  page.evaluate(
    async () =>
      await new Promise((resolve, reject) => {
        let totalHeight = 0;
        let distance = 100;
        let timer = setInterval(() => {
          let scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 300);
      })
  );

(async () => {
  const browser = await puppeteer.launch({
    args: [`--proxy-server=http=${randProxy}`, "--incognito"],
    headless: false,
    executablePath: 'C:/Users/e.lotfi/AppData/Local/Chromium/Application/chrome.exe'
  });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });

  await page.setDefaultNavigationTimeout(0); 

   const title = await page.evaluate(() => {
    return document.querySelector('article > div > section h1').innerText;
    });

    const excerpt = await page.evaluate(() => {
        return document.querySelector('article > div > section h2').innerText;
    });

    let contentList = await page.evaluate(() => {
      const doms = [...document.querySelectorAll("section > div.n.p:last-child > div > *")];
      return doms.map(f => ({tagName: f.tagName, text: f.innerText}));
    });

  await browser.close();
})();