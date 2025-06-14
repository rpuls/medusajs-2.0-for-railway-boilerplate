@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-weight: 300;
    letter-spacing: -0.01em;
  }

  .font-serif {
    font-family: Georgia, "Times New Roman", Times, serif;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-weight: 300;
    letter-spacing: -0.02em;
  }
}

@layer utilities {
  .animate-gentle-pulse {
    animation: gentle-pulse 4s ease-in-out infinite;
  }
}

@keyframes gentle-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom selection color */
::selection {
  background-color: rgba(107, 70, 193, 0.1);
}

/* Minimal scrollbar */
::-webkit-scrollbar {
  width: 3px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(107, 70, 193, 0.2);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 70, 193, 0.4);
}

/* Ensure smooth transitions with luxury easing */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus styles for accessibility */
.focus-visible {
  outline: 2px solid rgba(107, 70, 193, 0.3);
  outline-offset: 2px;
}

/* Optimize font rendering */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* Loading shimmer effect */
.loading-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  /* Thumb-friendly touch targets */
  button {
    min-height: 44px;
    min-width: 44px;
  }

  /* Optimize text hierarchy for mobile */
  h1 {
    font-size: 3rem;
    line-height: 1.1;
  }

  /* Bottom 25% thumb zone optimization */
  .mobile-cta {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    z-index: 40;
  }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .bg-gradient-to-br {
    background: white;
  }

  .text-gray-400,
  .text-gray-500,
  .text-gray-600 {
    color: #000;
  }
}

/* Haptic feedback simulation for mobile */
@media (hover: none) and (pointer: coarse) {
  button:active {
    transform: scale(0.98);
    transition-duration: 0.1s;
  }
}

/* Elegant form field styling */
input:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(107, 70, 193, 0.1);
}

/* Success state styling */
.success-check {
  color: #10b981;
  animation: success-bounce 0.6s ease-out;
}

@keyframes success-bounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
