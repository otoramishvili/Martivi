import './globals.css';

export const metadata = {
  title: 'ხელოსანი თბილისში',
  description: 'ხელოსნები და სახლის სერვისები თბილისში.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ka">
      <body id="top">{children}</body>
    </html>
  );
}
