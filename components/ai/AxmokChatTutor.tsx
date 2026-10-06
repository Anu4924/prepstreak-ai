"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  AxmokChatMessage,
  AxmokAIService,
  QuickActionItem,
} from "@/services/ai/axmok-ai-service";
import { AxmokAvatar } from "./AxmokAvatar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/services/auth/auth-context";
import {
  Send,
  Trash2,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";

interface AxmokChatTutorProps {
  examId: string;
  examName: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  activePromptFromDeck?: string | null;
  onClearActivePrompt?: () => void;
  className?: string;
}

export function AxmokChatTutor({
  examId,
  examName,
  subjectId,
  subjectName,
  topicId,
  topicName,
  activePromptFromDeck,
  onClearActivePrompt,
  className = "",
}: AxmokChatTutorProps) {
  const { profile, user } = useAuth();
  const studentName = profile?.name || user?.user_metadata?.full_name || "Student";

  const [messages, setMessages] = useState<AxmokChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const quickActions: QuickActionItem[] = AxmokAIService.getQuickActions();

  // Initialize intro greeting on topic change
  useEffect(() => {
    const greeting = AxmokAIService.getInitialGreeting(examName, subjectName, topicName);
    setMessages([greeting]);
    setErrorMessage(null);
  }, [examName, subjectName, topicName, topicId]);

  // Handle external prompts (e.g., from learning deck)
  useEffect(() => {
    if (activePromptFromDeck) {
      handleSendMessage(activePromptFromDeck);
      onClearActivePrompt?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePromptFromDeck]);

  // Smooth scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSendMessage = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isThinking) return;

    const userMessage: AxmokChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);
    setErrorMessage(null);

    try {
      const response = await AxmokAIService.generateResponse({
        examId,
        examName,
        subjectId,
        subjectName,
        topicId,
        topicName,
        prompt: trimmed,
        conversationHistory: [...messages, userMessage],
      });

      const aiMessage: AxmokChatMessage = {
        id: `axmok-${Date.now()}`,
        sender: "axmok",
        text: response.text,
        timestamp: Date.now(),
        callout: response.callout,
        suggestedFollowUps: response.suggestedFollowUps,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Axmok is temporarily unavailable. Please try again.";
      setErrorMessage(msg);
      setLastFailedPrompt(trimmed);
    } finally {
      setIsThinking(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedPrompt) {
      handleSendMessage(lastFailedPrompt);
    }
  };

  const handleClearConversation = () => {
    const greeting = AxmokAIService.getInitialGreeting(examName, subjectName, topicName);
    setMessages([greeting]);
    setErrorMessage(null);
    setLastFailedPrompt(null);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderInlineFormatting = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-charcoal-950">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(
        /`([^`]+)`/g,
        '<code class="px-1.5 py-0.5 rounded bg-charcoal-100 font-mono text-[11px] text-forest-900 border border-charcoal-200/60">$1</code>'
      );
  };

  const formatMessageText = (content: string) => {
    const lines = content.split("\n");
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Handle Markdown Code Block delimiters (```java, ```cpp, ```, etc.)
      if (trimmed.startsWith("```")) {
        if (inCodeBlock) {
          // Closing code block
          elements.push(
            <pre
              key={`code-${idx}`}
              className="my-2 p-3 rounded-2xl bg-forest-950 text-almond-100 font-mono text-[11px] overflow-x-auto border border-forest-800 shadow-xs"
            >
              <code>{codeBuffer.join("\n")}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          // Opening code block
          inCodeBlock = true;
          codeBuffer = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (!trimmed) {
        elements.push(<div key={`empty-${idx}`} className="h-1.5" />);
        return;
      }

      // Horizontal separator
      if (trimmed === "---" || trimmed === "***") {
        elements.push(
          <hr key={`hr-${idx}`} className="my-2 border-t border-charcoal-200/80" />
        );
        return;
      }

      // Markdown H3: ###
      if (trimmed.startsWith("### ")) {
        elements.push(
          <h4
            key={`h3-${idx}`}
            className="text-xs sm:text-sm font-extrabold text-charcoal-900 mt-3 mb-1"
          >
            {trimmed.replace("### ", "")}
          </h4>
        );
        return;
      }

      // Markdown bullets: - or *
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const bulletText = trimmed.replace(/^[-*]\s+/, "");
        elements.push(
          <div key={`bullet-${idx}`} className="flex items-start gap-1.5 text-xs text-charcoal-800 ml-1">
            <span className="text-forest-700 font-bold leading-none mt-1">•</span>
            <span dangerouslySetInnerHTML={{ __html: renderInlineFormatting(bulletText) }} />
          </div>
        );
        return;
      }

      // Numbered list: 1. 2. 3.
      if (/^\d+\.\s/.test(trimmed)) {
        elements.push(
          <div key={`num-${idx}`} className="flex items-start gap-1.5 text-xs text-charcoal-800 ml-1">
            <span dangerouslySetInnerHTML={{ __html: renderInlineFormatting(trimmed) }} />
          </div>
        );
        return;
      }

      // Single-line Formula or Rules box
      if (
        trimmed.startsWith("Rule:") ||
        trimmed.startsWith("Step:") ||
        trimmed.startsWith("Formula:") ||
        trimmed.startsWith("Shortcut:")
      ) {
        elements.push(
          <div
            key={`box-${idx}`}
            className="my-1.5 p-2.5 rounded-xl bg-forest-950 text-almond-100 font-mono text-[11px] border border-forest-800"
          >
            {trimmed}
          </div>
        );
        return;
      }

      elements.push(
        <p
          key={`p-${idx}`}
          className="text-xs leading-relaxed text-charcoal-800"
          dangerouslySetInnerHTML={{ __html: renderInlineFormatting(trimmed) }}
        />
      );
    });

    // If code block remains unclosed
    if (inCodeBlock && codeBuffer.length > 0) {
      elements.push(
        <pre
          key="code-unclosed"
          className="my-2 p-3 rounded-2xl bg-forest-950 text-almond-100 font-mono text-[11px] overflow-x-auto border border-forest-800"
        >
          <code>{codeBuffer.join("\n")}</code>
        </pre>
      );
    }

    return <div className="space-y-1.5">{elements}</div>;
  };

  const getStudentInitials = () => {
    if (!studentName) return "ST";
    const parts = studentName.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return studentName.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className={`flex flex-col h-[650px] sm:h-[720px] bg-white rounded-3xl border-2 border-forest-900/30 shadow-card overflow-hidden ${className}`}
    >
      {/* 1. Axmok AI Tutor Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-forest-950 via-forest-900 to-forest-800 text-white flex items-center justify-between border-b border-forest-800 shrink-0">
        <div className="flex items-center gap-3">
          <AxmokAvatar size="md" showStatus />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Axmok AI
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-forest-700/80 text-almond-200 border border-forest-600">
                  Tutor
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-almond-200/90 truncate max-w-[200px] sm:max-w-xs">
              Personal Study Companion • {topicName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleClearConversation}
            className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-xl bg-forest-800/80 hover:bg-forest-700 text-almond-200 hover:text-white transition-colors border border-forest-700/60"
            title="Reset conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </div>

      {/* 2. Suggested Quick Actions Ribbon */}
      <div className="p-3 bg-almond-50/70 border-b border-almond-200/60 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-600 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-forest-700" />
            Axmok AI Commands
          </span>
          <span className="text-[10px] text-charcoal-400">Click to ask tutor</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {quickActions.map((action, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(action.prompt)}
              disabled={isThinking}
              className="text-[11px] font-medium px-3 py-1.5 rounded-xl bg-white border border-charcoal-200/80 text-charcoal-800 hover:bg-forest-50 hover:text-forest-900 hover:border-forest-300 transition-all shrink-0 shadow-2xs disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-charcoal-50/20">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-charcoal-500">
            <AxmokAvatar size="lg" className="mb-3" />
            <h4 className="text-sm font-bold text-charcoal-800 mb-1">
              Start learning with Axmok AI
            </h4>
            <p className="text-xs text-charcoal-500 max-w-sm">
              Ask anything about {topicName}, request step-by-step examples, shortcuts, or practice questions.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.sender === "user";

            return (
              <div
                key={message.id}
                className={`flex items-start gap-2.5 sm:gap-3 ${
                  isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                {isUser ? (
                  <div className="w-8 h-8 rounded-xl bg-forest-900 text-almond-100 flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                    {getStudentInitials()}
                  </div>
                ) : (
                  <AxmokAvatar size="sm" />
                )}

                {/* Message Body */}
                <div
                  className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3.5 sm:p-4 text-xs shadow-xs transition-all ${
                    isUser
                      ? "bg-forest-900 text-white rounded-tr-none font-medium"
                      : "bg-white text-charcoal-900 rounded-tl-none border border-charcoal-200/80"
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-charcoal-100">
                      <span className="text-[11px] font-bold text-forest-900 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Axmok AI Tutor
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyText(message.id, message.text)}
                          className="text-[10px] text-charcoal-400 hover:text-charcoal-700 flex items-center gap-0.5 p-0.5 rounded"
                          title="Copy explanation"
                        >
                          {copiedId === message.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <span className="text-[10px] text-charcoal-400">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Message Content */}
                  {isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  ) : (
                    <div>{formatMessageText(message.text)}</div>
                  )}

                  {/* Optional Callout Box */}
                  {message.callout && (
                    <div
                      className={`mt-3 p-3 rounded-xl border text-xs flex items-start gap-2 ${
                        message.callout.type === "rule"
                          ? "bg-forest-50/80 border-forest-200 text-forest-950"
                          : message.callout.type === "warning"
                          ? "bg-amber-50 border-amber-200 text-amber-900"
                          : message.callout.type === "example"
                          ? "bg-almond-50 border-almond-200 text-charcoal-900"
                          : "bg-forest-50/60 border-forest-200 text-forest-900"
                      }`}
                    >
                      {message.callout.type === "warning" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      ) : message.callout.type === "rule" ? (
                        <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                      ) : (
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold text-[11px] mb-0.5">
                          {message.callout.title}
                        </div>
                        <div className="text-[11px] leading-relaxed">
                          {message.callout.content}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Suggested Follow-up Prompts */}
                  {message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-charcoal-100">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500 mb-1.5">
                        Ask Follow-up:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {message.suggestedFollowUps.map((prompt, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => handleSendMessage(prompt)}
                            disabled={isThinking}
                            className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-charcoal-100/80 hover:bg-forest-50 text-charcoal-700 hover:text-forest-900 transition-colors border border-charcoal-200/60 text-left"
                          >
                            &ldquo;{prompt}&rdquo;
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* 4. Axmok AI Thinking / Loading State */}
        {isThinking && (
          <div className="flex items-start gap-2.5 sm:gap-3 animate-in fade-in duration-200">
            <AxmokAvatar size="sm" />
            <div className="p-3.5 rounded-2xl bg-white border border-charcoal-200/80 rounded-tl-none shadow-xs flex items-center gap-2.5 text-xs text-charcoal-600">
              <span className="font-semibold text-forest-900">Axmok AI is thinking...</span>
              <div className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-forest-700 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-forest-700 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-forest-700 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. Error State with Retry */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="text-xs bg-white text-rose-700 border-rose-300 hover:bg-rose-100 shrink-0 py-1 px-2.5"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 6. Message Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-3 sm:p-4 bg-white border-t border-charcoal-200/80 flex items-center gap-2 shrink-0"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={`Ask Axmok AI anything about ${topicName}... (Press Enter to send)`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isThinking}
          className="flex-1 text-xs sm:text-sm bg-charcoal-50/80 border border-charcoal-200 rounded-2xl px-4 py-3 text-charcoal-900 focus:outline-hidden focus:ring-2 focus:ring-forest-800 focus:bg-white placeholder:text-charcoal-400 transition-all disabled:opacity-50"
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!input.trim() || isThinking}
          className="rounded-2xl px-4 py-3 shrink-0"
          aria-label="Send question to Axmok AI"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
