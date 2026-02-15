const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const svgPath = path.join(__dirname, 'public', 'icons', 'icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

const sizes = [16, 48, 128];

Promise.all(
  sizes.map(size =>
    sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, 'public', 'icons', `icon${size}.png`))
  )
).then(() => {
  console.log('Icons generated: icon16.png, icon48.png, icon128.png');
}).catch(err => {
  console.error('Error generating icons:', err);
});
