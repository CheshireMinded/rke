/**
 * GestureManager - Handles touch gestures and mobile interactions
 */
class GestureManager {
  constructor() {
    this.startX = 0;
    this.startY = 0;
    this.endX = 0;
    this.endY = 0;
    this.minSwipeDistance = 50;
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Touch events for mobile gestures
    document.addEventListener('touchstart', (e) => {
      this.handleTouchStart(e);
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      this.handleTouchEnd(e);
    }, { passive: true });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });

    // Long press detection
    let longPressTimer;
    document.addEventListener('touchstart', (e) => {
      longPressTimer = setTimeout(() => {
        this.handleLongPress(e);
      }, 500);
    });

    document.addEventListener('touchend', () => {
      clearTimeout(longPressTimer);
    });

    document.addEventListener('touchmove', () => {
      clearTimeout(longPressTimer);
    });
  }

  handleTouchStart(e) {
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
  }

  handleTouchEnd(e) {
    const touch = e.changedTouches[0];
    this.endX = touch.clientX;
    this.endY = touch.clientY;
    
    this.detectSwipe();
  }

  detectSwipe() {
    const deltaX = this.endX - this.startX;
    const deltaY = this.endY - this.startY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine if it's a horizontal or vertical swipe
    if (absDeltaX > absDeltaY && absDeltaX > this.minSwipeDistance) {
      // Horizontal swipe
      if (deltaX > 0) {
        this.handleSwipeRight();
      } else {
        this.handleSwipeLeft();
      }
    } else if (absDeltaY > absDeltaX && absDeltaY > this.minSwipeDistance) {
      // Vertical swipe
      if (deltaY > 0) {
        this.handleSwipeDown();
      } else {
        this.handleSwipeUp();
      }
    }
  }

  handleSwipeLeft() {
    // Swipe left - could switch to next theme
    if (window.themeManager) {
      window.themeManager.toggleTheme();
      window.themeManager.triggerHaptic('light');
    }
  }

  handleSwipeRight() {
    // Swipe right - could switch to previous theme
    if (window.themeManager) {
      window.themeManager.toggleTheme();
      window.themeManager.triggerHaptic('light');
    }
  }

  handleSwipeUp() {
    // Swipe up - could show accessibility panel
    if (window.themeManager) {
      window.themeManager.toggleAccessibilityPanel();
      window.themeManager.triggerHaptic('light');
    }
  }

  handleSwipeDown() {
    // Swipe down - could hide panels
    const panel = document.getElementById('accessibilityPanel');
    if (panel.style.display === 'block') {
      panel.style.display = 'none';
      if (window.themeManager) {
        window.themeManager.triggerHaptic('light');
      }
    }
  }

  handleLongPress(e) {
    // Long press - could show context menu or additional options
    if (window.themeManager) {
      window.themeManager.triggerHaptic('medium');
    }
    
    // Show a subtle indication that long press was detected
    const target = e.target;
    if (target && target.classList) {
      target.classList.add('long-press-active');
      setTimeout(() => {
        target.classList.remove('long-press-active');
      }, 200);
    }
  }

  handleKeyboardShortcuts(e) {
    // Keyboard shortcuts for accessibility
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 't':
          e.preventDefault();
          if (window.themeManager) {
            window.themeManager.toggleTheme();
          }
          break;
        case 'a':
          e.preventDefault();
          if (window.themeManager) {
            window.themeManager.toggleAccessibilityPanel();
          }
          break;
        case 's':
          e.preventDefault();
          if (window.dreadCalculator) {
            window.dreadCalculator.saveCurrentWeek();
          }
          break;
        case 'n':
          e.preventDefault();
          if (window.dreadCalculator) {
            window.dreadCalculator.addPlayer();
          }
          break;
      }
    }
    
    // Escape key to close panels
    if (e.key === 'Escape') {
      const panel = document.getElementById('accessibilityPanel');
      if (panel && panel.style.display === 'block') {
        window.themeManager.closeAccessibilityPanel();
      }
    }
  }

  // Utility method to check if device supports touch
  isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  // Utility method to check if device is mobile
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Add visual feedback for touch interactions
  addTouchFeedback(element) {
    if (this.isTouchDevice()) {
      element.addEventListener('touchstart', () => {
        element.classList.add('touch-active');
      });
      
      element.addEventListener('touchend', () => {
        setTimeout(() => {
          element.classList.remove('touch-active');
        }, 150);
      });
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GestureManager;
}
