/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
	  './pages/**/*.{js,ts,jsx,tsx}', // Scan all files in the `pages` directory
	  './components/**/*.{js,ts,jsx,tsx}', // Scan all files in the `components` directory
	  './app/**/*.{js,ts,jsx,tsx}', // If you're using the new App Directory feature
	],
	theme: {
	  extend: {
		
	  },
	},
	plugins: [],
  };
  