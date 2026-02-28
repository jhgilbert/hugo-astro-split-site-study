import { useState, useRef, useId } from 'preact/hooks';

interface CollapsibleProps {
  title: string;
  defaultOpen?: boolean;
  children: preact.ComponentChildren;
  'data-testid'?: string;
}

export default function Collapsible({ title, defaultOpen = false, children, 'data-testid': testId }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const id = useId();
  const contentId = `collapsible-content-${id}`;
  const headerId = `collapsible-header-${id}`;

  return (
    <div
      class={`collapsible${isOpen ? ' collapsible--open' : ''}`}
      data-testid={testId}
    >
      <button
        class="collapsible__header"
        id={headerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen(!isOpen)}
        data-testid={testId ? `${testId}-header` : undefined}
      >
        <span class="collapsible__icon" aria-hidden="true">▶</span>
        {title}
      </button>
      <div
        class="collapsible__content"
        id={contentId}
        role="region"
        aria-labelledby={headerId}
        data-testid={testId ? `${testId}-content` : undefined}
      >
        <div class="collapsible__content-inner">
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
