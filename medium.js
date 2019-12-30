const puppeteer = require('puppeteer-core');
const fs = require('fs');

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

  const writeFile = (path, data, opts = 'utf8') => {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, data, opts, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
  

(async () => {
  const browser = await puppeteer.launch({
    args: [`--proxy-server=http=${randProxy}`, "--incognito"],
    headless: true,
    executablePath: 'C:/Users/e.lotfi/AppData/Local/Chromium/Application/chrome.exe'
  });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0); 

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
      return doms.map(f => {
        if(f.tagName.toUpperCase() === "FIGURE"){
          elements = [...f.querySelectorAll('img')];
          
          const imageProxcis = elements
            .filter(f => f.offsetWidth > 250)
          
            if(imageProxcis.length){
              const hash = imageProxcis[0].src.split("/").slice(-1)[0];
              return {tagName: f.tagName, text: f.innerText, url: `https://miro.medium.com/proxy/${hash}`}
            } else {
              return {tagName: f.tagName, text: f.innerText}
            } 
        } else {
          return {tagName: f.tagName, text: f.innerText}
        }
      });
    });

    contentList.push({tagName: 'title', text: title})
    if(excerpt){
      contentList.push({tagName: 'excerpt', text: excerpt})
    }

    
    

    const CleanText = contentList.map(f=>f.text).join("***");
   
    await writeFile("temp.txt", CleanText);

    await page.goto('https://translate.google.com/#view=home&op=docs&sl=en&tl=fa');

    const input = await page.$('#tlid-file-input')


    await input.uploadFile("temp.txt")
    
     await Promise.all([
        page.click('.tlid-translate-doc-button.button'),
        page.waitForNavigation({ waitUntil: 'networkidle0' })
      ]);

      const element = await page.$("pre");
      let text = await page.evaluate(element => element.textContent, element);

      text = text.replace(/\* \*/gm, '**')

      text.split("***").forEach((text, i) => {
        contentList[i]['translate'] = text;
      });
      let content = '';
      contentList.filter(f => f.tagName !== 'title' && f.tagName !== 'excerpt' ).forEach(f => {
        if(f.tagName.toUpperCase() === "FIGURE"){
          content += `<img src="${f.url}"/>`;
        } else {
          content += `<${f.tagName.toLowerCase()}>${f.translate}</${f.tagName.toLowerCase()}>`;
        };
      })

      await writeFile("temp.html", content);

      
  await browser.close();
})();
