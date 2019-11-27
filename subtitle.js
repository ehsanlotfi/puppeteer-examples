const puppeteer = require('puppeteer-core');
var find = require('findit');
var fs = require("fs");
var replaceall = require("replaceall");

let _dir_ = 'D:/test_sub';

var finder = find(_dir_);
var path = require('path');
let files = [];

finder.on('file', function (file, stat) {
  if(path.extname(file) === '.srt'){
    if(!files.includes(files)){
      files.push(file);
    }
  }
});
 
finder.on('end', async function () {
   console.log('\x1b[36m%s\x1b[0m', '=======================> finish search file ');
   console.log(`${files.length} finded file`);

   fs.readFile(files[0], "utf-8", function(err, buf) {
    console.log(buf);
  });

   await files.forEach(file =>{
    const fileName = path.basename(file,path.extname(file));
    fs.createReadStream(file)
    .pipe(fs.createWriteStream(`${path.dirname(file)}/txtTranslateTemp--${fileName}.txt`));
   });

   files =  files.map(file => {
    const fileName = path.basename(file,path.extname(file));
      return `${path.dirname(file)}/txtTranslateTemp--${fileName}.txt`;
   });


  // openFile(0);
})
/*
function parseArabic(str) {
  return str.replace(/[٠١٢٣٤٥٦٧٨٩]/g, function(d) {
      return d.charCodeAt(0) - 1632; 
  }).replace(/[۰۱۲۳۴۵۶۷۸۹]/g, function(d) {
      return d.charCodeAt(0) - 1776; 
  }) ;
}



const openFile = (i) => {
  file = files[i];
  if(!file.includes("-fa.srt")){
    (async () => {
      const browser = await puppeteer.launch(
      {
         headless: true,
         executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
         
      });
      const page = await browser.newPage();
      await page.goto('https://translate.google.com/#view=home&op=docs&sl=en&tl=fa');
    
      try {
        const input = await page.$('#tlid-file-input')
        await input.uploadFile(file)
        
        await Promise.all([
          page.click('.tlid-translate-doc-button.button'),
          page.waitForNavigation({ waitUntil: 'networkidle0' })
          ]);
    
          const element = await page.$("pre");
          let text = await page.evaluate(element => element.textContent, element);
    
          text = replaceall(": ",":", text);
          text = replaceall("->","-->", text);
          text = replaceall("،",",", text);
          const fileName = path.basename(file,path.extname(file));
          const fileNameDelete = path.basename(file,path.extname(file));
  
          let newFile = `${path.dirname(file)}/${fileName}-fa.srt`;
          newFile = replaceall("txtTranslateTemp--","", newFile);
  
          const bom = '\uFEFF';
  
          fs.writeFile(newFile, bom + text, 'utf8' , (err) => {
            if (err) console.log(err);
            console.log(`${i+1} Successfully Written to File.`);
          });
      } catch {

        console.log('\x1b[36m%s\x1b[0m', 'fail');

      } finally {
        await browser.close();
        nextFile(i);

      }
      
    })();
  }
}

nextFile = (i) => {
  if(files[i + 1]){
    openFile(i + 1);
   } else {
    console.log('\x1b[36m%s\x1b[0m', '=======================> finish');
    files.forEach(f => {
      fs.unlinkSync(f);
    })
    process.exit(1);
   }
}
*/
