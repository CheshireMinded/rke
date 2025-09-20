/**
 * ThemeManager - Handles theme switching and accessibility features
 */
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'dark';
    this.accessibilitySettings = JSON.parse(localStorage.getItem('accessibility') || '{}');
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.bindEvents();
    this.applyAccessibilitySettings();
  }

  bindEvents() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
      this.toggleTheme();
    });

    // Color scheme selector
    document.getElementById('colorScheme').addEventListener('change', (e) => {
      this.setTheme(e.target.value);
    });

    // Accessibility toggle
    document.getElementById('accessibilityToggle').addEventListener('click', () => {
      this.toggleAccessibilityPanel();
    });

    // Close accessibility panel
    document.getElementById('closeAccessibilityPanel').addEventListener('click', () => {
      this.closeAccessibilityPanel();
    });

    // Accessibility options
    document.getElementById('highContrast').addEventListener('change', (e) => {
      this.setAccessibilityOption('highContrast', e.target.checked);
    });

    document.getElementById('largeText').addEventListener('change', (e) => {
      this.setAccessibilityOption('largeText', e.target.checked);
    });

    document.getElementById('reduceMotion').addEventListener('change', (e) => {
      this.setAccessibilityOption('reduceMotion', e.target.checked);
    });

    // Font scaling
    document.getElementById('fontScale').addEventListener('input', (e) => {
      this.setFontScale(e.target.value);
    });
  }

  toggleTheme() {
    const themes = ['light', 'dark', 'blue', 'green'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
  }

  setTheme(theme) {
    this.currentTheme = theme;
    this.applyTheme(theme);
    localStorage.setItem('theme', theme);
    
    // Update color scheme selector
    const colorSchemeSelect = document.getElementById('colorScheme');
    if (colorSchemeSelect) {
      colorSchemeSelect.value = theme;
    }
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update theme toggle button text
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      const themeIcons = {
        light: '☀️',
        dark: '🌙',
        blue: '🔵',
        green: '🟢'
      };
      themeToggle.textContent = themeIcons[theme] || '🌙';
    }
  }

  toggleAccessibilityPanel() {
    const panel = document.getElementById('accessibilityPanel');
    if (panel) {
      const isVisible = panel.style.display === 'block';
      panel.style.display = isVisible ? 'none' : 'block';
      
      if (!isVisible) {
        panel.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  closeAccessibilityPanel() {
    const panel = document.getElementById('accessibilityPanel');
    if (panel) {
      panel.style.display = 'none';
    }
  }

  setAccessibilityOption(option, enabled) {
    this.accessibilitySettings[option] = enabled;
    this.applyAccessibilitySettings();
    localStorage.setItem('accessibility', JSON.stringify(this.accessibilitySettings));
  }

  applyAccessibilitySettings() {
    const body = document.body;
    
    // High contrast
    if (this.accessibilitySettings.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }
    
    // Large text
    if (this.accessibilitySettings.largeText) {
      body.classList.add('large-text');
    } else {
      body.classList.remove('large-text');
    }
    
    // Reduce motion
    if (this.accessibilitySettings.reduceMotion) {
      body.classList.add('reduce-motion');
    } else {
      body.classList.remove('reduce-motion');
    }
    
    // Update checkboxes
    const highContrastCheckbox = document.getElementById('highContrast');
    const largeTextCheckbox = document.getElementById('largeText');
    const reduceMotionCheckbox = document.getElementById('reduceMotion');
    
    if (highContrastCheckbox) {
      highContrastCheckbox.checked = this.accessibilitySettings.highContrast || false;
    }
    if (largeTextCheckbox) {
      largeTextCheckbox.checked = this.accessibilitySettings.largeText || false;
    }
    if (reduceMotionCheckbox) {
      reduceMotionCheckbox.checked = this.accessibilitySettings.reduceMotion || false;
    }
  }

  setFontScale(scale) {
    const body = document.body;
    
    // Remove existing font scale classes
    body.classList.remove('font-scale-80', 'font-scale-90', 'font-scale-100', 
                         'font-scale-110', 'font-scale-120', 'font-scale-130', 
                         'font-scale-140', 'font-scale-150', 'font-scale-160', 
                         'font-scale-170', 'font-scale-180', 'font-scale-190', 
                         'font-scale-200');
    
    // Add new font scale class
    const scaleClass = `font-scale-${scale}`;
    body.classList.add(scaleClass);
    
    // Save setting
    this.accessibilitySettings.fontScale = scale;
    localStorage.setItem('accessibility', JSON.stringify(this.accessibilitySettings));
  }

  triggerHaptic(type = 'light') {
    // Haptic feedback for supported devices
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50],
        success: [10, 10, 10],
        error: [50, 50, 50]
      };
      
      navigator.vibrate(patterns[type] || patterns.light);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}
