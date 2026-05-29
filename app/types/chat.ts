// ============================================================
//  SciaSource — チャットスレッド型定義
// ============================================================
import type { PredictResponse, AgeGroup } from "@/app/types";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  jsonData?: PredictResponse; // assistant メッセージのみ保持
  timestamp: number;
}

export interface ChatThread {
  id: string;
  title: string;           // 最初の質問の先頭20文字
  messages: ChatMessage[];
  // スレッドごとに設定を保存（履歴復元時に再現される）
  userTypeIdx: number;
  ageGroup: AgeGroup;
  showSources: boolean;
  showChart: boolean;
  createdAt: number;
}

/** ChatFooter / page.tsx 間で共有する設定型 */
export interface ThreadSettings {
  userTypeIdx: number;
  ageGroup: AgeGroup;
  showSources: boolean;
  showChart: boolean;
}
