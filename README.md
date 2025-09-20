# Alliance Dread Calculator PWA

A Progressive Web App for tracking weekend dreadnought kills for alliance players in your game.

## Features

- **Player Management**: Add/remove players with custom names
- **Dread Tracking**: Track start and end dread counts for each player
- **Automatic Calculation**: Automatically calculates dreads killed (end - start)
- **Base Coverage**: Link players to other bases for coverage tracking
- **Leaderboard**: See who performed best each weekend
- **Export/Import**: Export data as JSON or CSV, import previous data
- **PWA Features**: Installable, works offline, mobile-friendly

## How to Use

1. **Add Players**: Click "Add Player" to add alliance members
2. **Enter Data**: For each player, enter their starting and ending dread counts
3. **Track Coverage**: Optionally note which players are covering other bases
4. **View Results**: See the leaderboard and summary statistics
5. **Export Data**: Save your results to share with alliance members

## GitHub Pages Deployment

1. Push this repository to GitHub
2. Enable GitHub Pages in repository settings
3. The app will be available at `https://yourusername.github.io/repository-name`

## PWA Installation

- **Desktop**: Click the install button in your browser's address bar
- **Mobile**: Use "Add to Home Screen" from your browser menu
- **Offline**: The app works offline once installed

## File Structure

```
/
├── index.html          # Main application
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── icons/             # PWA icons (generate with generate-icons.html)
├── generate-icons.html # Icon generator tool
└── README.md          # This file
```

## Icon Generation

1. Open `generate-icons.html` in your browser
2. Click "Generate Icons" 
3. Download all the generated icons
4. Place them in the `icons/` directory

## Customization

The app uses a dark theme with blue accents. You can customize colors by modifying the CSS variables in `index.html`:

- `#1a1a2e` - Background color
- `#64b5f6` - Primary blue color
- `#ff6b35` - Dread accent color
- `#10b981` - Success/positive color
- `#ef4444` - Danger/negative color

## Browser Support

- Chrome/Edge: Full PWA support
- Firefox: Basic functionality, limited PWA features
- Safari: Basic functionality, limited PWA features
- Mobile browsers: Full support on modern devices
