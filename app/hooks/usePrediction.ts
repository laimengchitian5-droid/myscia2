"use client";

import { useState, useCallback } from "react";
import type { PredictRequest, PredictResponse, UserType } from "@/app/types";

interface UsePredictionState {
  data: PredictResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function usePrediction() {
  const [state, setState] = useState<UsePredictionState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const predict = useCallback(async (request: PredictRequest) => {
    setState({ data: null, isLoading: true, error: null });

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const json = (await res.json()) as PredictResponse;

      if (!res.ok) {
        setState({ data: json, isLoading: false, error: json.errorMessage ?? "APIエラー" });
        return;
      }

      setState({ data: json, isLoading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "ネットワークエラーが発生しました";
      setState({ data: null, isLoading: false, error: msg });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, predict, reset };
}

export type { UserType };
