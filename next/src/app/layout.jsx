'use client';

import { useState, useEffect } from 'react';
import { modalHook } from '@/hooks/common';
import '../style/style.scss'
import Page from './page';

export default function RootLayout({ children }) {
	const [theme, setTheme] = useState('dark');
	const { modal, setModal } = modalHook();

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
	};

	return (
		<html lang="jp">
			<body className={modal ? 'u-scroll-disabled' : ''}>
				{/* <button className='l-html--themeColor' onClick={toggleTheme}>L/D</button> */}
				{/* {children} */}
				<Page setModal={setModal} />
			</body>
		</html>
	);
}