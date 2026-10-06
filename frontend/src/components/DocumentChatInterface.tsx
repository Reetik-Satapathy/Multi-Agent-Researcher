import { Bot, LoaderCircle, Send, UserRound } from 'lucide-react';
import { MarkdownContent } from './MarkdownContent';
import type { DocumentChatMessage } from '../services/documentService';

interface DocumentChatInterfaceProps {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  placeholder: string;
  activityLabel: string;
  messages: DocumentChatMessage[];
  question: string;
  setQuestion: (value: string) => void;
  onSubmit: () => void;
  busy: boolean;
}

export function DocumentChatInterface({
  title,
  description,
  emptyTitle,
  emptyDescription,
  placeholder,
  activityLabel,
  messages,
  question,
  setQuestion,
  onSubmit,
  busy,
}: DocumentChatInterfaceProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#D9D7D0] bg-white shadow-[0_12px_36px_rgba(23,37,84,0.06)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E9E7E1] bg-gradient-to-r from-white to-[#F7F9FF] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#1D4ED8]">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-[#171717]">{title}</h3>
            <p className="mt-0.5 text-xs text-[#6B6B67]">{description}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <span className="rounded-full border border-[#D9D7D0] bg-white px-2.5 py-1 text-[11px] font-medium text-[#6B6B67]">
            {Math.ceil(messages.length / 2)} {messages.length === 2 ? 'exchange' : 'exchanges'}
          </span>
        )}
      </header>

      <div
        className="max-h-[min(56vh,520px)] min-h-60 space-y-5 overflow-y-auto bg-[#FAFAF8] px-4 py-5 sm:px-6"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {messages.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#DBEAFE] bg-white text-[#1D4ED8] shadow-sm">
              <Bot className="h-6 w-6" />
            </span>
            <p className="text-sm font-semibold text-[#292929]">{emptyTitle}</p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#777770]">{emptyDescription}</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={`${message.role}-${index}`}
                className={`chat-message-enter flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  isUser ? 'bg-[#E9E7E1] text-[#55554F]' : 'bg-[#1D4ED8] text-white'
                }`}>
                  {isUser ? <UserRound className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </span>
                <div className={`max-w-[min(88%,680px)] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'rounded-tr-md bg-[#1D4ED8] text-white'
                    : 'rounded-tl-md border border-[#E8E6E0] bg-white text-[#292929]'
                }`}>
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="[&_div]:text-[#292929] [&_h2]:text-base [&_h3]:text-sm [&_li]:leading-relaxed [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_strong]:font-semibold">
                      <MarkdownContent content={message.content} />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        {busy && (
          <div className="flex items-center gap-2.5 text-xs text-[#6B6B67]" role="status">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1D4ED8] text-white">
              <Bot className="h-4 w-4" />
            </span>
            <span className="flex items-center gap-2 rounded-full border border-[#E8E6E0] bg-white px-3 py-2">
              <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[#1D4ED8]" />
              {activityLabel}
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-[#E9E7E1] bg-white p-3 sm:p-4">
        <form
          className="flex items-end gap-2 rounded-2xl border border-[#D9D7D0] bg-[#FAFAF8] p-2 transition-colors focus-within:border-[#1D4ED8]/50 focus-within:ring-4 focus-within:ring-[#DBEAFE]/60"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={placeholder}
            aria-label="Ask a question"
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-[#171717] outline-none placeholder:text-[#92928B]"
          />
          <button
            type="submit"
            aria-label={busy ? 'Waiting for answer' : 'Send question'}
            disabled={busy || !question.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D4ED8] text-white transition hover:bg-[#1E40AF] disabled:cursor-not-allowed disabled:bg-[#B8C3D8]"
          >
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
        <p className="mt-2 px-2 text-[10px] text-[#92928B]">Press Enter to send · Answers are based on your uploaded documents</p>
      </div>
    </section>
  );
}
