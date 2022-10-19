const http = require('http'),
    url = require('url'),
    fs = require('fs');

http.createServer((request, response) => {
    let address = request.url;
    let q = url.parse(address, true);
    let filePath = '';
    
    
   
    
    if(q.pathname.includes('documentation')){
        // response.writeHead(200, {'Content-Type': 'text/plain'});
        // response.end('Hello Node!\n');
        // console.log('aaa');
        // console.log(__dirname);
        // console.log(__filename);
        filePath = (__dirname + './../documentation.html');
        // console.log(filePath);
    }else{
        // response.writeHead(200, {'Content-Type': 'text/plain'});
        // response.end('Hello Node!\n');
        filePath = (__dirname + './../index.html');
        // console.log('bbb');
        // console.log(__dirname);
        // console.log(__filename);
    }

    fs.appendFile('./../miscelaneous/log.txt', 'URL: ' + address + '\n Timestamp: ' + new Date() + '\n\n', (err) => {
        if(err){
            console.log(err);
        }else{
            console.log('Added to log.');
        }
    });

    fs.readFile(filePath, (err, data)=>{
        if(err){
            throw err;
        }
        
        response.writeHead(200,{'Content-Type': 'text/html'});
        response.write(data);
        response.end();

    });
}).listen(8080);

console.log('Node server is running in port 8080');