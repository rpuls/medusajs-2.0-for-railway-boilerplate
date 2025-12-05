'use client'

import { createTheme } from '@mui/material/styles'

/**
 * Material UI Theme Configuration
 * 
 * This theme is designed to work alongside Tailwind CSS.
 * Use MUI components for complex UI elements (forms, dialogs, tables)
 * and Tailwind for layout and custom styling.
 */
const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2.25rem', // 3xl
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.875rem', // 2xl
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem', // xl
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem', // lg
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  palette: {
    primary: {
      main: '#519717', // Your primary green
      light: '#66ba20',
      dark: '#3d760e',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FCC100', // Your secondary yellow
      light: '#FCC100',
      dark: '#FCC100',
      contrastText: '#111827',
    },
    error: {
      main: '#EF4444',
      light: '#FEE2E2',
      dark: '#B91C1C',
    },
    success: {
      main: '#10B981',
      light: '#D1FAE5',
      dark: '#047857',
    },
    warning: {
      main: '#F59E0B',
      light: '#FEF3C7',
      dark: '#B45309',
    },
    info: {
      main: '#3B82F6',
      light: '#DBEAFE',
      dark: '#1D4ED8',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F9FAFB',
    },
    divider: '#E5E7EB',
  },
  shape: {
    borderRadius: 4, // Match your design system
  },
  components: {
    // Button customization
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Disable uppercase transformation
          borderRadius: '4px',
          fontWeight: 500,
          padding: '8px 16px',
          '&:hover': {
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    // TextField customization
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '4px',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#D1D5DB',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3B82F6',
              borderWidth: '2px',
            },
            // Completely remove Chrome autofill styling - hybrid approach
            '& input': {
              '&:-webkit-autofill': {
                WebkitAnimationName: 'autofill',
                WebkitAnimationFillMode: 'both',
                animationName: 'autofill',
                animationFillMode: 'both',
                WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset !important',
                boxShadow: '0 0 0 1000px #FFFFFF inset !important',
                WebkitTextFillColor: '#111827 !important',
                color: '#111827 !important',
                caretColor: '#111827 !important',
                transition: 'background-color 5000s ease-in-out 0s, color 5000s ease-in-out 0s !important',
                backgroundColor: '#FFFFFF !important',
              },
              '&:-webkit-autofill:hover': {
                WebkitAnimationName: 'autofill',
                WebkitAnimationFillMode: 'both',
                animationName: 'autofill',
                animationFillMode: 'both',
                WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset !important',
                boxShadow: '0 0 0 1000px #FFFFFF inset !important',
                WebkitTextFillColor: '#111827 !important',
                color: '#111827 !important',
              },
              '&:-webkit-autofill:focus': {
                WebkitAnimationName: 'autofill',
                WebkitAnimationFillMode: 'both',
                animationName: 'autofill',
                animationFillMode: 'both',
                WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset !important',
                boxShadow: '0 0 0 1000px #FFFFFF inset !important',
                WebkitTextFillColor: '#111827 !important',
                color: '#111827 !important',
              },
              '&:-webkit-autofill:active': {
                WebkitAnimationName: 'autofill',
                WebkitAnimationFillMode: 'both',
                animationName: 'autofill',
                animationFillMode: 'both',
                WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset !important',
                boxShadow: '0 0 0 1000px #FFFFFF inset !important',
                WebkitTextFillColor: '#111827 !important',
                color: '#111827 !important',
              },
            },
          },
        },
      },
    },
    // Card customization
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
    // Dialog customization
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '8px',
        },
      },
    },
    // Autocomplete customization
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '4px',
            // Completely remove Chrome autofill styling for Autocomplete
            '& input': {
              '&:-webkit-autofill': {
                WebkitAnimationName: 'autofill',
                WebkitAnimationFillMode: 'both',
                animationName: 'autofill',
                animationFillMode: 'both',
                WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset !important',
                boxShadow: '0 0 0 1000px #FFFFFF inset !important',
                WebkitTextFillColor: '#111827 !important',
                color: '#111827 !important',
                caretColor: '#111827 !important',
                transition: 'background-color 5000s ease-in-out 0s, color 5000s ease-in-out 0s !important',
                backgroundColor: '#FFFFFF !important',
              },
              '&:-webkit-autofill:hover': {
                WebkitAnimationName: 'autofill',
                WebkitAnimationFillMode: 'both',
                animationName: 'autofill',
                animationFillMode: 'both',
                WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset !important',
                boxShadow: '0 0 0 1000px #FFFFFF inset !important',
                WebkitTextFillColor: '#111827 !important',
                color: '#111827 !important',
              },
              '&:-webkit-autofill:focus': {
                WebkitAnimationName: 'autofill',
                WebkitAnimationFillMode: 'both',
                animationName: 'autofill',
                animationFillMode: 'both',
                WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset !important',
                boxShadow: '0 0 0 1000px #FFFFFF inset !important',
                WebkitTextFillColor: '#111827 !important',
                color: '#111827 !important',
              },
            },
          },
        },
      },
    },
    // InputLabel customization for autofill
    MuiInputLabel: {
      styleOverrides: {
        root: {
          zIndex: 1,
        },
      },
    },
    // OutlinedInput customization
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          // Completely remove Chrome autofill styling - hybrid approach
          '& input': {
            '&:-webkit-autofill': {
              WebkitAnimationName: 'autofill',
              WebkitAnimationFillMode: 'both',
              animationName: 'autofill',
              animationFillMode: 'both',
              WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset !important',
              boxShadow: '0 0 0 1000px #FFFFFF inset !important',
              WebkitTextFillColor: '#111827 !important',
              color: '#111827 !important',
              caretColor: '#111827 !important',
              transition: 'background-color 5000s ease-in-out 0s, color 5000s ease-in-out 0s !important',
              backgroundColor: '#FFFFFF !important',
            },
            '&:-webkit-autofill:hover': {
              WebkitAnimationName: 'autofill',
              WebkitAnimationFillMode: 'both',
              animationName: 'autofill',
              animationFillMode: 'both',
              WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset !important',
              boxShadow: '0 0 0 1000px #FFFFFF inset !important',
              WebkitTextFillColor: '#111827 !important',
              color: '#111827 !important',
            },
            '&:-webkit-autofill:focus': {
              WebkitAnimationName: 'autofill',
              WebkitAnimationFillMode: 'both',
              animationName: 'autofill',
              animationFillMode: 'both',
              WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset !important',
              boxShadow: '0 0 0 1000px #FFFFFF inset !important',
              WebkitTextFillColor: '#111827 !important',
              color: '#111827 !important',
            },
            '&:-webkit-autofill:active': {
              WebkitAnimationName: 'autofill',
              WebkitAnimationFillMode: 'both',
              animationName: 'autofill',
              animationFillMode: 'both',
              WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset !important',
              boxShadow: '0 0 0 1000px #FFFFFF inset !important',
              WebkitTextFillColor: '#111827 !important',
              color: '#111827 !important',
            },
          },
        },
      },
    },
  },
})

export default theme

