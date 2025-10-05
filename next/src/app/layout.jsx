import '../style/style.scss'

export default function RootLayout({ children }) {
  return (
    <html lang="jp">
      <body>
        {children}
      </body>
    </html>
  );
}