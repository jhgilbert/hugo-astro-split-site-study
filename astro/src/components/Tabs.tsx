import { useState, useRef, useCallback } from 'preact/hooks';

interface Tab {
  label: string;
  content: string;
}

interface TabsProps {
  tabs: Tab[];
  id: string;
}

export default function Tabs({ tabs, id }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      let newIndex = activeIndex;

      switch (e.key) {
        case 'ArrowRight':
          newIndex = (activeIndex + 1) % tabs.length;
          break;
        case 'ArrowLeft':
          newIndex = (activeIndex - 1 + tabs.length) % tabs.length;
          break;
        case 'Home':
          newIndex = 0;
          break;
        case 'End':
          newIndex = tabs.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      setActiveIndex(newIndex);
      tabRefs.current[newIndex]?.focus();
    },
    [activeIndex, tabs.length]
  );

  return (
    <div class="tabs" data-testid={`tabs-${id}`}>
      <div class="tabs__nav" role="tablist" aria-label={`${id} tabs`} onKeyDown={handleKeyDown}>
        {tabs.map((tab, i) => (
          <button
            key={i}
            class={`tabs__tab${i === activeIndex ? ' tabs__tab--active' : ''}`}
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === activeIndex}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={i === activeIndex ? 0 : -1}
            onClick={() => setActiveIndex(i)}
            ref={(el) => { tabRefs.current[i] = el; }}
            data-testid={`tab-${id}-${i}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={i}
          class="tabs__panel"
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== activeIndex}
          data-testid={`panel-${id}-${i}`}
          dangerouslySetInnerHTML={{ __html: tab.content }}
        />
      ))}
    </div>
  );
}
