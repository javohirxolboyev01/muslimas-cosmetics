import type { ReactNode } from 'react';
import './Accordion.css';

export interface AccordionItem {
  title: ReactNode;
  content: ReactNode;
  defaultOpen?: boolean;
}

export function Accordion({ items, className }: { items: AccordionItem[]; className?: string }) {
  return (
    <div className={className ? `acc ${className}` : 'acc'}>
      {items.map((it, i) => (
        <details key={i} open={it.defaultOpen}>
          <summary>{it.title}</summary>
          <div className="dc">{it.content}</div>
        </details>
      ))}
    </div>
  );
}
