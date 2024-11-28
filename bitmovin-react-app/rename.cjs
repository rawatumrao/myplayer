const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist', 'assets');
const destDir = '/home/ubuntu/workspace_classic/Convey/web/include/react';

fs.readdir(distPath, (err, files) => {
  if (err) throw err;
  const jsFiles = files.filter(file => file.endsWith('.js'));
  jsFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    const newFilePath = path.join(destDir, 'index.js');
    fs.rename(filePath, newFilePath, err => {
      if (err) throw err;
      console.log(`${file} was renamed to index.js`);
    });
  });
});
