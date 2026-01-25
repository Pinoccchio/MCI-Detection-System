# Favicon Setup Guide

## Overview

The MCI Detection System uses a custom brain logo for all favicons and app icons across different platforms and devices.

## Generated Files

### App Directory Icons (`src/app/`)
These files are automatically detected by Next.js 13+ using the file-based metadata API:

- **`icon.png`** (32x32) - Standard favicon for modern browsers
- **`apple-icon.png`** (180x180) - iOS/Safari home screen icon
- **`favicon.ico`** (32x32) - Legacy browser support

### Public Directory Icons (`public/`)
- **`logo.png`** - Original source logo (500x500)
- **`icon-192.png`** (192x192) - PWA icon for Android
- **`icon-512.png`** (512x512) - PWA icon for high-resolution displays
- **`site.webmanifest`** - Web app manifest for PWA support

## Metadata Configuration

The favicon metadata is configured in `src/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/favicon.ico' },
    ],
  },
  manifest: '/site.webmanifest',
  themeColor: '#2563eb', // Clinical blue
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MCI Detect',
  },
}
```

## Regenerating Favicons

If you update the logo, regenerate all favicons using:

```bash
npm run generate:favicons
```

This script (`scripts/generate-favicons.mjs`) will:
1. Read `public/logo.png`
2. Generate all required favicon sizes
3. Place them in the correct directories

## Browser Support

| Icon Type | File | Browser/Platform |
|-----------|------|------------------|
| Standard Favicon | `icon.png` | Chrome, Firefox, Edge, Safari |
| Legacy Favicon | `favicon.ico` | Internet Explorer, older browsers |
| Apple Touch Icon | `apple-icon.png` | iOS Safari, macOS Safari |
| PWA Icons | `icon-192.png`, `icon-512.png` | Android Chrome, PWA installs |

## Vercel Deployment

When deployed to Vercel, the custom favicon will automatically replace the default Vercel triangle icon. The icons are served from:

- **Production**: `https://your-domain.vercel.app/icon.png`
- **Preview**: `https://your-preview.vercel.app/icon.png`

## Testing

To verify the favicon is working:

1. **Local Development**:
   ```bash
   npm run dev
   ```
   Check browser tab at `http://localhost:3000`

2. **Build Preview**:
   ```bash
   npm run build
   npm start
   ```

3. **Vercel Preview**: Deploy and check the preview URL

4. **Clear Cache**: If you don't see changes, clear browser cache:
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - Safari: Cmd+Option+E

## Troubleshooting

### Favicon not showing
- Clear browser cache
- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Check that files exist in `src/app/` directory
- Verify metadata in `layout.tsx`

### Wrong icon on mobile
- Check `apple-icon.png` exists and is 180x180
- Verify `site.webmanifest` is accessible
- Test on actual device, not just emulator

### Vercel still showing triangle
- Ensure deployment completed successfully
- Wait a few minutes for CDN propagation
- Check that favicon files are included in build output

## Additional Resources

- [Next.js Metadata Files Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
- [Web App Manifest Spec](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Favicon Best Practices](https://web.dev/add-manifest/)

---

**Last Updated**: January 26, 2026
**Maintained By**: Development Team
