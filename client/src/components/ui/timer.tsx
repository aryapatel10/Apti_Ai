import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TimerProps {
  initialTime: number; // in seconds
  onTimeUp?: () => void;
  className?: string;
  variant?: "question" | "total";
}

export function Timer({ initialTime, onTimeUp, className, variant = "total" }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isLowTime = timeLeft <= 300; // 5 minutes
  const isCritical = timeLeft <= 60; // 1 minute

  return (
    <div className="text-center">
      <p className="text-xs text-slate-400 mb-1">
        {variant === "question" ? "Question Time" : "Total Time"}
      </p>
      <div
        className={cn(
          "px-4 py-2 rounded-lg",
          variant === "question" && "timer-glow bg-emerald-500/20",
          variant === "total" && "bg-slate-700/50",
          isLowTime && "bg-yellow-500/20",
          isCritical && "bg-red-500/20",
          className
        )}
      >
        <span
          className={cn(
            "font-mono text-lg",
            variant === "question" && "text-emerald-400",
            variant === "total" && "text-white",
            isLowTime && "text-yellow-400",
            isCritical && "text-red-400"
          )}
        >
          {display}
        </span>
      </div>
    </div>
  );
}
