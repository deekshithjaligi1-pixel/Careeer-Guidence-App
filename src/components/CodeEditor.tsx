import { useRef, type KeyboardEvent } from "react";

const INDENT = "  ";

// Lightweight code editor: a textarea with a line-number gutter, Tab /
// Shift+Tab indentation and auto-indent on Enter.
export function CodeEditor({
  value,
  onChange,
  minHeight = 440,
}: {
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
}) {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const lineCount = value.split("\n").length;

  const replaceSelection = (text: string, start: number, end: number, caret: number) => {
    const el = textRef.current!;
    onChange(value.slice(0, start) + text + value.slice(end));
    requestAnimationFrame(() => el.setSelectionRange(caret, caret));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const { selectionStart: start, selectionEnd: end } = el;

    if (e.key === "Tab") {
      e.preventDefault();
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      if (e.shiftKey) {
        if (value.startsWith(INDENT, lineStart)) {
          replaceSelection(
            "",
            lineStart,
            lineStart + INDENT.length,
            Math.max(lineStart, start - INDENT.length),
          );
        }
      } else {
        replaceSelection(INDENT, start, end, start + INDENT.length);
      }
    } else if (e.key === "Enter") {
      // Keep the current indentation, and indent one more level after { : (
      e.preventDefault();
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const line = value.slice(lineStart, start);
      const indent = line.match(/^\s*/)?.[0] ?? "";
      const extra = /[{:([]\s*$/.test(line) ? INDENT : "";
      const insert = "\n" + indent + extra;
      replaceSelection(insert, start, end, start + insert.length);
    }
  };

  return (
    <div
      className="flex h-full overflow-hidden font-mono text-[13px] leading-6"
      style={{ minHeight }}
    >
      <div
        ref={gutterRef}
        aria-hidden
        className="select-none overflow-hidden border-r border-border/50 py-3 pl-3 pr-3 text-right text-muted-foreground/50"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={textRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onScroll={(e) => {
          if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop;
        }}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        wrap="off"
        aria-label="Code editor"
        className="flex-1 resize-none overflow-auto bg-transparent px-4 py-3 text-emerald-200 caret-primary outline-none"
        style={{ fontVariantLigatures: "none", tabSize: 2 }}
      />
    </div>
  );
}
