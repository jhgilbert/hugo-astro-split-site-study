import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
import Tabs from '../src/components/Tabs';

const twoTabs = [
  { label: 'First', content: '<p>First content</p>' },
  { label: 'Second', content: '<p>Second content</p>' },
];

const threeTabs = [
  { label: 'One', content: '<p>Panel one</p>' },
  { label: 'Two', content: '<p>Panel two</p>' },
  { label: 'Three', content: '<p>Panel three</p>' },
];

describe('Tabs', () => {
  it('renders with correct initial state (2 tabs)', () => {
    const { container } = render(<Tabs tabs={twoTabs} id="test" />);
    const tabs = container.querySelectorAll('[role="tab"]');
    const panels = container.querySelectorAll('[role="tabpanel"]');

    expect(tabs).toHaveLength(2);
    expect(panels).toHaveLength(2);

    // First tab is selected
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');

    // First panel is visible, second is hidden
    expect(panels[0].hidden).toBe(false);
    expect(panels[1].hidden).toBe(true);
  });

  it('renders with correct initial state (3 tabs)', () => {
    const { container } = render(<Tabs tabs={threeTabs} id="test3" />);
    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs).toHaveLength(3);
  });

  it('switches tabs on click', () => {
    const { container } = render(<Tabs tabs={twoTabs} id="click" />);
    const tabs = container.querySelectorAll('[role="tab"]');
    const panels = container.querySelectorAll('[role="tabpanel"]');

    fireEvent.click(tabs[1]);

    expect(tabs[0].getAttribute('aria-selected')).toBe('false');
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(panels[0].hidden).toBe(true);
    expect(panels[1].hidden).toBe(false);
  });

  it('has correct ARIA attributes', () => {
    const { container } = render(<Tabs tabs={twoTabs} id="aria" />);
    const tablist = container.querySelector('[role="tablist"]');
    const tabs = container.querySelectorAll('[role="tab"]');
    const panels = container.querySelectorAll('[role="tabpanel"]');

    expect(tablist).toBeTruthy();

    tabs.forEach((tab, i) => {
      expect(tab.getAttribute('aria-controls')).toBe(`aria-panel-${i}`);
      expect(tab.id).toBe(`aria-tab-${i}`);
    });

    panels.forEach((panel, i) => {
      expect(panel.getAttribute('aria-labelledby')).toBe(`aria-tab-${i}`);
      expect(panel.id).toBe(`aria-panel-${i}`);
    });
  });

  it('supports arrow key navigation', () => {
    const { container } = render(<Tabs tabs={threeTabs} id="keys" />);
    const tablist = container.querySelector('[role="tablist"]')!;
    const tabs = container.querySelectorAll('[role="tab"]');

    // Focus the first tab and press ArrowRight
    (tabs[0] as HTMLElement).focus();
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });

    expect(tabs[1].getAttribute('aria-selected')).toBe('true');

    // ArrowRight again
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');

    // ArrowRight wraps to first
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');

    // ArrowLeft wraps to last
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');

    // Home goes to first
    fireEvent.keyDown(tablist, { key: 'Home' });
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');

    // End goes to last
    fireEvent.keyDown(tablist, { key: 'End' });
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');
  });

  it('matches snapshot (2 tabs)', async () => {
    const { container } = render(<Tabs tabs={twoTabs} id="snap2" />);
    await expect(container.innerHTML).toMatchFileSnapshot(
      '__snapshots__/Tabs/two-tabs.html'
    );
  });

  it('matches snapshot (3 tabs)', async () => {
    const { container } = render(<Tabs tabs={threeTabs} id="snap3" />);
    await expect(container.innerHTML).toMatchFileSnapshot(
      '__snapshots__/Tabs/three-tabs.html'
    );
  });
});
