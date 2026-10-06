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
    <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#101512]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] bg-[#0C100E] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#6F9B83]/30 bg-[#16231D] text-[#6F9B83]">
            <Bot className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-[#F5F7F3]">{title}</h3>
            <p className="mt-0.5 text-[11px] text-[#A5ADA7]">{description}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <span className="rounded-md border border-white/[0.08] bg-[#16231D] px-2.5 py-1 font-mono text-[10px] text-[#6F9B83]">
            {Math.ceil(messages.length / 2)} {messages.length === 2 ? 'exchange' : 'exchanges'}
          </span>
        )}
      </header>

      <div
        className="max-h-[min(56vh,520px)] min-h-60 space-y-4 overflow-y-auto bg-[#070807] px-4 py-5 sm:px-6"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {messages.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center text-center">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-[#101512] text-[#6F9B83]">
              <Bot className="h-5 w-5" />
            </span>
            <p className="text-xs font-semibold text-[#F5F7F3]">{emptyTitle}</p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#737B76]">{emptyDescription}</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={`${message.role}-${index}`}
                className={`chat-message-enter flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
                  isUser ? 'bg-[#16231D] text-[#6F9B83] border border-[#6F9B83]/30' : 'bg-[#315C4B] text-[#F5F7F3]'
                }`}>
                  {isUser ? <UserRound className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </span>
                <div className={`max-w-[min(88%,680px)] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#315C4B] text-[#F5F7F3]'
                    : 'border border-white/[0.08] bg-[#101512] text-[#F5F7F3]'
                }`}>
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="[&_div]:text-[#F5F7F3] [&_h2]:text-sm [&_h3]:text-xs [&_li]:leading-relaxed [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_strong]:font-semibold text-xs">
                      <MarkdownContent content={message.content} />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        {busy && (
          <div className="flex items-center gap-2 text-xs text-[#6F9B83]" role="status">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#315C4B] text-[#F5F7F3]">
              <Bot className="h-3.5 w-3.5" />
            </span>
            <span className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#101512] px-3 py-1.5 font-mono text-[11px]">
              <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[#6F9B83]" />
              {activityLabel}
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-white/[0.06] bg-[#0C100E] p-3 sm:p-4">
        <form
          className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#101512] p-1.5 transition-colors focus-within:border-[#6F9B83]"
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
            className="min-w-0 flex-1 bg-transparent px-3 py-1.5 text-xs text-[#F5F7F3] outline-none placeholder:text-[#737B76]"
          />
          <button
            type="submit"
            aria-label={busy ? 'Waiting for answer' : 'Send question'}
            disabled={busy || !question.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#315C4B] text-[#F5F7F3] transition hover:bg-[#3D705C] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </button>
        </form>
        <p className="mt-2 px-1 text-[10px] text-[#737B76]">Press Enter to send · Answers are grounded in document citations</p>
      </div>
    </section>
  );
}
