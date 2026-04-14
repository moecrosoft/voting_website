import { League_Spartan, Teachers } from "next/font/google";
import "./globals.css";

const league = League_Spartan({
  subsets: ["latin"],
  weight: ["600"],
});

const teachers = Teachers({
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata = {
  title: "ITC VOTING",
  icons: {
    icon: "/itc.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${teachers.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}