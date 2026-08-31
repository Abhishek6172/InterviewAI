"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Mic, MicOff, Send, Keyboard, RefreshCw, AlertCircle } from "lucide-react";
import { BrowserSpeechService } from "@/lib/utils/speech";
import { cn } from "@/lib/utils/cn";

interface AnswerInputProps {
  isListening: boolean;
  onToggleListening: () => void;
  onSubmitAnswer: (text: string, mode: "voice" | "text") => void;
  disabled?: boolean;
  externalTranscript?: string;
}

export function AnswerInput({
  isListening,
  onToggleListening,
  onSubmitAnswer,
  disabled = false,
  externalTranscript = "",
}: AnswerInputProps) {
  const [answerText, setAnswerText] = useState("");
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  // Check speech recognition capability on mount
  useEffect(() => {
    const supported = BrowserSpeechService.isSpeechRecognitionSupported();
    setIsSpeechSupported(supported);
    if (!supported) {
      setIsTypingMode(true);
    }
  }, []);

  // Synchronize live speech transcript
  useEffect(() => {
    if (externalTranscript) {
      setAnswerText(externalTranscript);
    }
  }, [externalTranscript]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!answerText.trim() || disabled) return;
    onSubmitAnswer(answerText.trim(), isTypingMode ? "text" : "voice");
    setAnswerText("");
  };

  const wordCount = answerText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="w-full max-w-2xl flex flex-col items-center space-y-4">
      {/* Mode Switcher */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
        <button
          type="button"
          onClick={() => setIsTypingMode(false)}
          disabled={!isSpeechSupported || disabled}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all",
            !isTypingMode
              ? "bg-primary text-white font-medium shadow-sm"
              : "text-muted-foreground hover:text-white disabled:opacity-40"
          )}
        >
          <Mic className="w-3.5 h-3.5" />
          Voice Answer
        </button>
        <button
          type="button"
          onClick={() => setIsTypingMode(true)}
          disabled={disabled}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all",
            isTypingMode
              ? "bg-primary text-white font-medium shadow-sm"
              : "text-muted-foreground hover:text-white"
          )}
        >
          <Keyboard className="w-3.5 h-3.5" />
          Type Answer
        </button>
      </div>

      {!isSpeechSupported && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-950/30 border border-amber-500/20 px-3 py-1.5 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Speech recognition not supported in this browser. Text input active.</span>
        </div>
      )}

      {/* Voice Mode Main Controls */}
      {!isTypingMode && isSpeechSupported && (
        <div className="flex flex-col items-center space-y-3 w-full">
          <div className="relative">
            {isListening && (
              <span className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-ping" />
            )}
            <Button
              type="button"
              onClick={onToggleListening}
              disabled={disabled}
              className={cn(
                "w-20 h-20 rounded-full transition-all duration-300 shadow-xl flex flex-col items-center justify-center gap-1",
                isListening
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30 scale-105"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 hover:scale-105"
              )}
            >
              {isListening ? (
                <>
                  <MicOff className="w-7 h-7 animate-pulse" />
                  <span className="text-[10px] font-semibold tracking-wide uppercase">Stop</span>
                </>
              ) : (
                <>
                  <Mic className="w-7 h-7" />
                  <span className="text-[10px] font-semibold tracking-wide uppercase">Tap</span>
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {isListening ? (
              <span className="text-emerald-400 font-medium animate-pulse">Listening... (Speak clearly into your microphone)</span>
            ) : (
              "Tap to answer with your voice, then review your transcript below."
            )}
          </p>
        </div>
      )}

      {/* Editable Live Transcript / Typing Area */}
      <div className="w-full glass-panel rounded-2xl p-4 border border-white/10 space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{isTypingMode ? "Your Typed Answer" : "Live Editable Transcript"}</span>
          <span>{wordCount} words {wordCount > 0 && wordCount < 20 ? "(Aim for 40+ words for detail)" : ""}</span>
        </div>

        <textarea
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder={
            isTypingMode
              ? "Type your structured response here (STAR format recommended for behavioral answers)..."
              : "Your spoken response will appear here in real time. You can edit it anytime before submitting..."
          }
          rows={3}
          disabled={disabled}
          className="w-full bg-transparent border-0 resize-none text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-0 leading-relaxed"
        />

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={() => setAnswerText("")}
            disabled={!answerText || disabled}
            className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Clear
          </button>

          <Button
            type="button"
            variant="glow"
            size="sm"
            onClick={() => handleSubmit()}
            disabled={!answerText.trim() || disabled}
            className="gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            Submit Answer
          </Button>
        </div>
      </div>
    </div>
  );
}
