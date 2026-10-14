import { memo, type ReactNode } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// The assistant is told never to write links or images; rendering links as
// plain text and dropping images enforces that if it slips.
const components: Components = {
  h1: ({ children }) => <SectionHeading>{children}</SectionHeading>,
  h2: ({ children }) => <SectionHeading>{children}</SectionHeading>,
  h3: ({ children }) => <h3 className="mt-5 font-semibold text-ink">{children}</h3>,
  h4: ({ children }) => <h4 className="mt-4 font-medium text-ink">{children}</h4>,
  p: ({ children }) => <p className="mt-3 leading-relaxed first:mt-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="mt-2.5 list-disc space-y-1.5 pl-5 marker:text-leaf-400">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-2.5 list-decimal space-y-1.5 pl-5 marker:text-leaf-600">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-0.5 leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  a: ({ children }) => <span>{children}</span>,
  hr: () => <hr className="my-6 border-leaf-100" />,
  blockquote: ({ children }) => (
    <blockquote className="mt-3 border-l-2 border-leaf-200 pl-4 text-ink-soft">{children}</blockquote>
  ),
  table: ({ children }) => (
    <div className="mt-4 overflow-x-auto rounded-xl border border-leaf-100">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-leaf-50 text-ink">{children}</thead>,
  th: ({ children }) => (
    <th className="px-2.5 py-2 font-semibold whitespace-nowrap sm:px-3">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-t border-leaf-100 px-2.5 py-2 align-top sm:px-3">{children}</td>
  ),
  pre: ({ children }) => <div className="mt-3">{children}</div>,
  code: ({ children }) => (
    <code className="rounded bg-sand px-1.5 py-0.5 text-[0.9em]">{children}</code>
  ),
};

function SectionHeading({ children }: { children?: ReactNode }) {
  return (
    <h2 className="mt-8 font-display text-xl font-medium tracking-tight text-ink first:mt-0 sm:text-2xl">
      {children}
    </h2>
  );
}

export const ChatMarkdown = memo(function ChatMarkdown({ content }: { content: string }) {
  return (
    <div className="min-w-0 text-[0.95rem] break-words text-ink/90">
      <Markdown remarkPlugins={[remarkGfm]} components={components} skipHtml disallowedElements={["img"]}>
        {content}
      </Markdown>
    </div>
  );
});
