/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		spacing: {
			sp72: '72px'
		},
		extend: {
			colors: {
				green: {
					100: '#DBE3E8'
				}
			},
			fontFamily: {
				dubai: ['Dubai']
			}
		}
	},
	plugins: []
};
