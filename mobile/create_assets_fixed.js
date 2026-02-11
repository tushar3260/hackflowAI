
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
}

// A valid 1x1 Blue Pixel PNG with correct CRC
const bluePixel = Buffer.from('89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000c49444154789c6360640500000600023081d02f0000000049454e44ae426082', 'hex');

// A valid 1x1 White Pixel PNG with correct CRC
const whitePixel = Buffer.from('89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000c49444154789c63f8ff1f00030001fbf04d7c0000000049454e44ae426082', 'hex');

const files = [
    { name: 'icon.png', content: bluePixel },
    { name: 'splash.png', content: bluePixel },
    { name: 'adaptive-icon.png', content: bluePixel },
    { name: 'favicon.png', content: whitePixel }
];

files.forEach(f => {
    fs.writeFileSync(path.join(assetsDir, f.name), f.content);
    console.log(`Created valid ${f.name}`);
});
