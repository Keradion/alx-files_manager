const fs = require('fs');
const path = require('path');

// Suppose this is your image buffer (from Base64)
const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wIAAgkA+2e4xwAAAABJRU5ErkJggg==";
const imageBuffer = Buffer.from(base64Image, 'base64');

// Save to file
const filePath = path.join(__dirname, 'myImage.png');
fs.writeFileSync(filePath, imageBuffer);
console.log(`Image saved at ${filePath}`);

