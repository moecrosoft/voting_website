import { League_Spartan, Teachers } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/navBar";

const league = League_Spartan({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-header",
});

const teachers = Teachers({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-body",
});

export const metadata = {
  title: "ITC VOTING",
  icons: {
    icon: "/itc.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${league.variable} ${teachers.variable} antialiased`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        {children}
      </body>
    </html>
  );
}