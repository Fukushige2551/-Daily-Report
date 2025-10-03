export default function RootLayout({ children }) {
  const styles = {
    body: { background: '#222', color: '#fff' }
  }
  return (
    <html lang="jp">
      <body style={ styles.body }>
        {children}
      </body>
    </html>
  );
}
