import type { Metadata } from "next";
import "./globals.css";
import "./service-marketplace.css";

export const metadata: Metadata = {
  title: "같이딜 | 서비스 공동구매·수요 매칭",
  description: "같은 서비스가 필요한 고객과 업체의 빈 시간·이동 경로를 연결해 절감 비용을 할인으로 돌려드립니다.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
