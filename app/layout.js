import "./globals.css";

export const metadata = {
  title: "Chai ya Code? — Talk to Hitesh or Piyush (AI)",
  description:
    "An AI-simulated chat with the teaching personas of Hitesh Choudhary and Piyush Garg — pick a mentor and ask your coding questions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
