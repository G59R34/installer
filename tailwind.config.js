'use strict';

module.exports = {
    purge: {
        mode: 'jit',
        content: [
            './src/**/*.html',
            './src/**/*.jsx',
            './src/**/*.tsx',
        ],
    },
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            height: {
                '450px': '450px',
            },
            width: {
                '520px': '520px',
                '700px': '700px',
            },
            spacing: {
                '14.06px': '14.06px',
                '17.01px': '17.01px',
            },
            colors: {
                'quasi-white': '#FAFAFA',
                grey:  {
                    medium: '#EDEDED',
                },
                cyan: {
                    DEFAULT: '#00E0FE',
                    medium: '#00C4F5',
                    dark: 'var(--color-brand-cyan-dark)',
                },
                dodger: {
                    light: '#00BBFF'
                },
                navy: {
                    DEFAULT: '#171E2C',
                    light: '#1F2A3C',
                    lightest: '#273347',
                    lighter: '#222c3d',
                    dark: '#0E131B',
                },
                red: {
                    DEFAULT: '#FC3A3A',
                    dark: '#F70404',
                    darker: '#E40303',
                    darkest: '#D10303',
                },
                'utility': {
                    'red': 'var(--color-utility-red)',
                    'green': 'var(--color-utility-green)',
                    'orange': 'var(--color-utility-orange)',
                    'amber': 'var(--color-utility-amber)',
                    'blue': 'var(--color-utility-blue)',
                    'purple': 'var(--color-utility-purple)',
                    'pink': 'var(--color-utility-pink)',
                    'salmon': 'var(--color-utility-salmon)',
                    'grey': 'var(--color-utility-grey)',
                    'dark-grey': 'var(--color-utility-dark-grey)',
                    'grey-blue': 'var(--color-utility-grey-blue)',
                },
            },
            boxShadow: {
                'inner-sm': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'glow-cyan': '0 0 28px -6px rgba(0, 224, 254, 0.35)',
                'panel-deep': '0 28px 56px -16px rgba(0, 0, 0, 0.55)',
                'nav-active': '0 4px 14px -4px rgba(0, 224, 254, 0.25)',
            },
            transitionTimingFunction: {
                'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
                'in-out-soft': 'cubic-bezier(0.45, 0, 0.55, 1)',
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(14px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'panel-in': {
                    '0%': { opacity: '0', transform: 'scale(0.94) translateY(12px)' },
                    '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
                },
                'hero-in': {
                    '0%': { opacity: '0.85', transform: 'scale(1.03)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                'attention-pulse': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(234, 179, 8, 0.45)' },
                    '50%': { boxShadow: '0 0 20px 4px rgba(234, 179, 8, 0.25)' },
                },
            },
            animation: {
                'spin-reverse': 'spin 1s linear infinite reverse',
                'fade-in': 'fade-in 0.45s ease-out forwards',
                'fade-in-up': 'fade-in-up 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'panel-in': 'panel-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'hero-in': 'hero-in 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'attention-pulse': 'attention-pulse 2.4s ease-in-out infinite',
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
                manrope: ['Manrope', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            borderRadius: {
                'sm-md': '4px',
            },
            /** Explicit px scale — readable on large desktops; not tied to html rem root */
            fontSize: {
                'fbw-xs': ['11px', { lineHeight: '1.45' }],
                'fbw-sm': ['12px', { lineHeight: '1.5' }],
                'fbw-base': ['14px', { lineHeight: '1.55' }],
                'fbw-md': ['15px', { lineHeight: '1.55' }],
                'fbw-lg': ['18px', { lineHeight: '1.35' }],
                'fbw-xl': ['22px', { lineHeight: '1.3' }],
            },
            maxWidth: {
                /** Main configure column — scales with large windows (was 900px). */
                configure: '1680px',
            },
        },
    },
    variants: {
        extend: {
            boxShadow: ['active'],
            translate: ['active'],
            brightness: ['hover', 'focus'],
            backgroundColor: ['first'],
        }
    },
    plugins: [require('@flybywiresim/tailwind-config')],
};
