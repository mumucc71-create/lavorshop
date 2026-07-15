import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "백딜 | 100명이 만드는 특별한 가격",
  description: "100명이 모이면 최저가가 확정되는 공동구매 플랫폼",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
