# PWA Deployment Guide

## 🚀 Quick Deploy to GitHub Pages

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Alliance Dread Calculator PWA"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: main
   - Your app will be at: `https://yourusername.github.io/your-repo-name`

## 🔒 HTTPS Requirements

**Important**: PWAs require HTTPS for full functionality. GitHub Pages provides HTTPS automatically.

### For Custom Domains:
- Use a service like Cloudflare (free SSL)
- Or use Let's Encrypt for custom servers

## 📱 Mobile Installation

### Android (Chrome/Edge):
1. Open the PWA in Chrome/Edge
2. Look for "Install" button in address bar
3. Or use the floating "📱 Install App" button
4. Tap "Install" when prompted

### iOS (Safari):
1. Open the PWA in Safari
2. Tap the Share button (square with arrow)
3. Tap "Add to Home Screen"
4. Customize name and tap "Add"

## 🛡️ Security Features

✅ **Content Security Policy** - Prevents XSS attacks
✅ **HTTPS Only** - Encrypted connections
✅ **No External Dependencies** - All code is self-contained
✅ **Local Storage Only** - Data stays on device
✅ **Service Worker** - Offline functionality
✅ **Secure Headers** - Protection against common attacks

## 📊 PWA Audit

Test your PWA with:
- Chrome DevTools → Lighthouse → PWA audit
- Should score 100/100 for PWA criteria

## 🔧 Customization

### Change App Name:
Edit `manifest.json`:
```json
{
  "name": "Your Alliance Name - Dread Tracker",
  "short_name": "YourTracker"
}
```

### Change Colors:
Edit `manifest.json`:
```json
{
  "theme_color": "#your-color",
  "background_color": "#your-bg-color"
}
```

### Add Custom Domain:
1. Add CNAME file to repository root
2. Configure DNS with your domain provider
3. Enable custom domain in GitHub Pages settings

## 🚨 Troubleshooting

### PWA Not Installing:
- Ensure HTTPS is enabled
- Check that manifest.json is accessible
- Verify service worker is registered
- Test in Chrome DevTools → Application → Manifest

### Icons Not Showing:
- Verify all icon files exist in `/icons/` directory
- Check icon file sizes match manifest.json
- Ensure icons are PNG format

### Offline Not Working:
- Check service worker registration in DevTools
- Verify all assets are cached
- Test by going offline in DevTools

## 📈 Performance Tips

- All assets are optimized for mobile
- Service worker caches everything for offline use
- Local storage for data persistence
- No external API calls for security

## 🔄 Updates

When you update the app:
1. Update version in `manifest.json`
2. Update cache version in `sw.js`
3. Push changes to GitHub
4. Users will get update prompts automatically
