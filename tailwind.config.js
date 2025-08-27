
//**@type {import('tailwindcss').config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'serif': ['Playfair Display', 'serif'],
                'sans': ['Inter', 'sans-serif'],
                'mono': ['JetBrains Mono', 'monospace'],
            },
            colors: {
                wood: {
                    50: '#fdf8f6',
                    100: '#f2e8e5',
                    200: '#eaddd7',
                    300: '#e0cec7',
                    400: '#d2bab0',
                    500: '#bfa094',
                    600: '#a18072',
                    700: '#8b6f5e',
                    800: '#73614f',
                    900: '#5c4f42',
                },
                rustic: {
                    50: '#faf7f0',
                    100: '#f4ede1',
                    200: '#e8dcc3',
                    300: '#dbc59f',
                    400: '#c9a876',
                    500: '#b8935a',
                    600: '#a17c4e',
                    700: '#856442',
                    800: '#6d523a',
                    900: '#5a4530',
                },
                sage: {
                    50: '#f6f7f6',
                    100: '#e3e8e3',
                    200: '#c8d3c8',
                    300: '#a3b8a3',
                    400: '#7a9a7a',
                    500: '#5c7f5c',
                    600: '#486548',
                    700: '#3a513a',
                    800: '#304030',
                    900: '#283528',
                },                
            },
            backgroundImage: {
                'wood-grain': "url('/wood-texture.jpg')",
                'paper-texture': "url('/paper-texture.jpg')",
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                '0%': { opacity: '0' },
                '100%': { opacity: '1' },
                },
                slideUp: {
                '0%': { transform: 'translateY(20px)', opacity: '0' },
                '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                float: {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-10px)' },
                }            
            }
        },
    },
    plugins: [],
}