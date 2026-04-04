const fs = require('fs');

const js = fs.readFileSync('dist/bundle.js', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Universe Eater</title>
<style>${css}</style>
</head>
<body>
<canvas id="game"></canvas>
<script>${js}</script>
</body>
</html>`;

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/universe-eater.html', html);
console.log(`Built dist/universe-eater.html (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
