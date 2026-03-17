// Copies SVG/PNG icons from nodes/** into dist/nodes/** after tsc compile.
const fs = require('fs');
const path = require('path');

function copyIcons(srcDir, destDir) {
	if (!fs.existsSync(srcDir)) return;
	for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
		const srcPath = path.join(srcDir, entry.name);
		const destPath = path.join(destDir, entry.name);
		if (entry.isDirectory()) {
			fs.mkdirSync(destPath, { recursive: true });
			copyIcons(srcPath, destPath);
		} else if (/\.(svg|png)$/i.test(entry.name)) {
			fs.copyFileSync(srcPath, destPath);
			console.log(`Copied: ${srcPath} → ${destPath}`);
		}
	}
}

copyIcons(
	path.join(__dirname, '..', 'nodes'),
	path.join(__dirname, '..', 'dist', 'nodes'),
);
