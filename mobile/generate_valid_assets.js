
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
}

// A known valid 1x1 transparent PNG
// const validPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";
// A known valid 64x64 blue PNG to satisfy dimensions better if needed
const validPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAQUlEQVRo3u3NSwoAAAjE0PoX7n8jvhckBvbOhptXX1Pf9wEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAYE9C+gUCcpv8lV4AAAAAElFTkSuQmCC";

const buffer = Buffer.from(validPngBase64, 'base64');

const files = [
    { name: 'icon.png' },
    { name: 'splash.png' },
    { name: 'adaptive-icon.png' },
    { name: 'favicon.png' }
];

files.forEach(f => {
    fs.writeFileSync(path.join(assetsDir, f.name), buffer);
    console.log(`Created valid ${f.name}`);
});
