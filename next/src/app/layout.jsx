'use client';

import { useState, useEffect } from 'react';
import { modalHook } from '@/hooks/common';
import '../style/style.scss'
import Page from './page';

export default function RootLayout({ children }) {
	const [theme, setTheme] = useState('dark');
	const { modal, setModal } = modalHook();

	const toggleTheme = () => {
		setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
	};

	return (
		<html lang="jp" data-theme={theme}>
			<body className={modal ? 'u-scroll-disabled' : ''}>
				{/* <button className='l-html--themeColor' onClick={toggleTheme}>L/D</button> */}
				{/* {children} */}
				<Page setModal={setModal} />
			</body>
		</html>
	);
}