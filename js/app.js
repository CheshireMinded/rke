/**
 * Main Application Entry Point
 * Initializes all components and handles application lifecycle
 */

// Global application state
let dreadCalculator;
let themeManager;
let gestureManager;

// PWA Installation and Service Worker
let deferredPrompt;
let isInstalled = false;

// Initialize everything when the page loads
window.addEventListener('load', () => {
  console.log('Application starting...');
  
  // Initialize core components
  dreadCalculator = new DreadCalculator();
  themeManager = new ThemeManager();
  gestureManager = new GestureManager();
  
  // Make components globally available for debugging
  window.dreadCalculator = dreadCalculator;
  window.themeManager = themeManager;
  window.gestureManager = gestureManager;
  
  // Initialize additional features
  initializePWA();
  initializeServiceWorker();
  initializeKeyboardShortcuts();
  
  // Initialize charts after a short delay to ensure DOM is ready
  setTimeout(() => {
    if (dreadCalculator && typeof dreadCalculator.initializeCharts === 'function') {
      dreadCalculator.initializeCharts();
    }
  }, 100);
  
  console.log('Application initialized successfully');
});

// PWA Installation
function initializePWA() {
  // Check if app is already installed
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    isInstalled = true;
    console.log('PWA is already installed');
  }

  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA install prompt available');
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });

  // Listen for the appinstalled event
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    isInstalled = true;
    hideInstallButton();
    deferredPrompt = null;
  });
}

function showInstallButton() {
  if (isInstalled || document.getElementById('installBtn')) return;

  const installBtn = document.createElement('button');
  installBtn.id = 'installBtn';
  installBtn.textContent = '📱 Install App';
  installBtn.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    background: var(--accent-primary) !important;
    color: white !important;
    border: none !important;
    padding: 10px 15px;
    border-radius: 8px;
    font-size: 14px;
    min-height: 44px;
    transition: all 0.3s ease;
  `;
  
  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      deferredPrompt = null;
      hideInstallButton();
    }
  });
  
  document.body.appendChild(installBtn);
}

function hideInstallButton() {
  const installBtn = document.getElementById('installBtn');
  if (installBtn) {
    installBtn.remove();
  }
}

// Service Worker Registration
function initializeServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

// Keyboard Shortcuts
function initializeKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Global shortcuts that work anywhere in the app
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 't':
          e.preventDefault();
          if (themeManager) {
            themeManager.toggleTheme();
          }
          break;
        case 'a':
          e.preventDefault();
          if (themeManager) {
            themeManager.toggleAccessibilityPanel();
          }
          break;
        case 's':
          e.preventDefault();
          if (dreadCalculator) {
            dreadCalculator.saveCurrentWeek();
          }
          break;
        case 'n':
          e.preventDefault();
          if (dreadCalculator) {
            dreadCalculator.addPlayer();
          }
          break;
        case 'h':
          e.preventDefault();
          if (dreadCalculator) {
            dreadCalculator.toggleHistoryView();
          }
          break;
      }
    }
    
    // Escape key to close panels
    if (e.key === 'Escape') {
      const panel = document.getElementById('accessibilityPanel');
      if (panel && panel.style.display === 'block') {
        themeManager.closeAccessibilityPanel();
      }
    }
  });
}

// Utility functions
function showNotification(title, options = {}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: './icons/icon-192x192.png',
      badge: './icons/icon-72x72.png',
      ...options
    });
  }
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        showNotification('Notifications enabled!', {
          body: 'You\'ll now receive updates about your dread tracking progress.'
        });
      }
    });
  }
}

// Error handling
window.addEventListener('error', (e) => {
  console.error('Application error:', e.error);
  // Could send error reports to analytics service
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  // Could send error reports to analytics service
});

// Performance monitoring
window.addEventListener('load', () => {
  if ('performance' in window) {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`Page load time: ${loadTime}ms`);
  }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializePWA,
    initializeServiceWorker,
    initializeKeyboardShortcuts,
    showNotification,
    requestNotificationPermission
  };
}
