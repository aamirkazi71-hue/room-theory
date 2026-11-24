import { Fragment, type ElementType, type ReactNode } from 'react';

/**
 * Splits text into masked words for staggered reveals. Wrap a phrase in
 * *asterisks* to set it in italic. Screen readers receive the plain text.
 */
export function SplitWords({ text, as: Tag = 'span', className, italicClass = 'italic', delay, id, reveal = true, children }: {
  id?: string;
  /** Set false when a parent timeline animates the words itself */
  reveal?: boolean;
  text: string;
  as?: ElementType;
  className?: string;
  italicClass?: string;
  delay?: number;
  children?: ReactNode;
}) {
  const plain = text.replace(/\*/g, '').replace(/\|/g, ' ');
  const segments = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <Tag id={id} className={className} aria-label={plain} data-reveal={reveal ? 'words' : undefined} data-delay={delay}>
      {segments.map((seg, si) => {
        const italic = seg.startsWith('*');
        const clean = seg.replace(/\*/g, '');
        // A "|" forces a line break at that point (deliberate editorial breaks).
        return clean.split('|').map((line, li, lines) => (
          <Fragment key={`${si}-${li}`}>
            {line.split(/\s+/).filter(Boolean).map((w, wi) => (
              <span key={wi} className="split-word" aria-hidden>
                <span className={`split-inner ${italic ? italicClass : ''}`}>{w}</span>
                {' '}
              </span>
            ))}
            {li < lines.length - 1 && <br />}
          </Fragment>
        ));
      })}
      {children}
    </Tag>
  );
}

/** Renders *italic* markup inline without splitting; "|" becomes a line break. */
export function Emph({ text, italicClass = 'italic' }: { text: string; italicClass?: string }) {
  return (
    <>
      {text.split('|').map((line, li, lines) => (
        <Fragment key={li}>
          {line.split(/(\*[^*]+\*)/g).filter(Boolean).map((seg, i) =>
            seg.startsWith('*') ? <em key={i} className={italicClass}>{seg.replace(/\*/g, '')}</em> : <Fragment key={i}>{seg}</Fragment>,
          )}
          {li < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  );
}
