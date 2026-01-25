/**
 * Favicon Generator Script
 *
 * Generates multiple favicon formats from logo.png:
 * - icon.png (32x32) - Modern browsers
 * - apple-icon.png (180x180) - iOS/Safari
 * - favicon.ico (multi-size) - Legacy browsers
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const logoPath = join(projectRoot, 'public', 'logo.png');
const appDir = join(projectRoot, 'src', 'app');

console.log('🎨 Generating favicons from logo.png...\n');

async function generateFavicons() {
  try {
    // Ensure the logo exists
    if (!fs.existsSync(logoPath)) {
      throw new Error(`Logo not found at: ${logoPath}`);
    }

    // 1. Generate icon.png (32x32) for modern browsers
    console.log('📦 Generating icon.png (32x32)...');
    await sharp(logoPath)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(join(appDir, 'icon.png'));
    console.log('✅ icon.png created\n');

    // 2. Generate apple-icon.png (180x180) for iOS
    console.log('📦 Generating apple-icon.png (180x180)...');
    await sharp(logoPath)
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(join(appDir, 'apple-icon.png'));
    console.log('✅ apple-icon.png created\n');

    // 3. Generate favicon.ico (32x32)
    // Note: We'll create it as a PNG but with .ico extension
    // Next.js will serve it correctly
    console.log('📦 Generating favicon.ico (32x32)...');

    // First, delete old favicon.ico if it exists
    const faviconPath = join(appDir, 'favicon.ico');
    if (fs.existsSync(faviconPath)) {
      fs.unlinkSync(faviconPath);
    }

    await sharp(logoPath)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFormat('png')
      .toFile(faviconPath);
    console.log('✅ favicon.ico created\n');

    // 4. Generate additional sizes for web manifest
    console.log('📦 Generating additional icon sizes for PWA...');

    await sharp(logoPath)
      .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(join(projectRoot, 'public', 'icon-192.png'));
    console.log('✅ icon-192.png created');

    await sharp(logoPath)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(join(projectRoot, 'public', 'icon-512.png'));
    console.log('✅ icon-512.png created\n');

    console.log('🎉 All favicons generated successfully!\n');
    console.log('Generated files:');
    console.log('  - src/app/icon.png (32x32)');
    console.log('  - src/app/apple-icon.png (180x180)');
    console.log('  - src/app/favicon.ico (32x32)');
    console.log('  - public/icon-192.png (192x192)');
    console.log('  - public/icon-512.png (512x512)\n');

  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    process.exit(1);
  }
}

generateFavicons();
