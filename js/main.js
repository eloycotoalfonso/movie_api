const os = require ('os');
const fs = require ('fs');

console.log('type: ' + os.type());

fs.readFile('./node.txt', 'utf-8', (err, data) => {
    if (err) { throw err; }
    console.log('data: ', data);
  });

  const http = require('http');
