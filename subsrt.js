var fs = require('fs');
var subsrt = require('subsrt');

//Read a .srt file
var content = fs.readFileSync('D:/test_sub/test.srt', 'utf8');


//Parse the content
var options = { verbose: true };
var captions = subsrt.parse(content, options);

//Output to console
console.log(captions);
