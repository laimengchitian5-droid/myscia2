import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SciaSource — 科学的リサーチ・アプローチ判定",
  description:
    "AI（Groq LLM）が最適な研究分野と調査手法を提案する、学術・日常の疑問解決ツール。中学生〜大学院生まで対応。",
  keywords: ["研究", "科学", "リサーチ", "統計", "AI", "学習"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
