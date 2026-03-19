import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-ivory text-primary">
        <nav className="p-4 border-b flex justify-between">
          <h1 className="font-bold">Accelerator</h1>
        </nav>
        {children}
        <footer className="p-4 border-t text-center text-sm">
          © Accelerator
        </footer>
      </body>
    </html>
  );
}