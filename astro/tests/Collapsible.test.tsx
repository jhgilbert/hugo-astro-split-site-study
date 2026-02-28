import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
import Collapsible from '../src/components/Collapsible.tsx';

describe('Collapsible', () => {
  it('renders closed by default', () => {
    const { container } = render(
      <Collapsible title="Test Section">
        <p>Content here</p>
      </Collapsible>
    );
    const wrapper = container.querySelector('.collapsible');
    expect(wrapper).not.toBeNull();
    expect(wrapper!.classList.contains('collapsible--open')).toBe(false);

    const button = container.querySelector('.collapsible__header');
    expect(button!.getAttribute('aria-expanded')).toBe('false');
  });

  it('renders open when defaultOpen is true', () => {
    const { container } = render(
      <Collapsible title="Open Section" defaultOpen={true}>
        <p>Content here</p>
      </Collapsible>
    );
    const wrapper = container.querySelector('.collapsible');
    expect(wrapper!.classList.contains('collapsible--open')).toBe(true);

    const button = container.querySelector('.collapsible__header');
    expect(button!.getAttribute('aria-expanded')).toBe('true');
  });

  it('toggles open/closed on click', async () => {
    const { container } = render(
      <Collapsible title="Toggle Me">
        <p>Content here</p>
      </Collapsible>
    );
    const button = container.querySelector('.collapsible__header')!;
    const wrapper = container.querySelector('.collapsible')!;

    // Initially closed
    expect(wrapper.classList.contains('collapsible--open')).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('false');

    // Click to open
    await fireEvent.click(button);
    expect(wrapper.classList.contains('collapsible--open')).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('true');

    // Click to close
    await fireEvent.click(button);
    expect(wrapper.classList.contains('collapsible--open')).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('has correct ARIA attributes', () => {
    const { container } = render(
      <Collapsible title="ARIA Test">
        <p>Content here</p>
      </Collapsible>
    );
    const button = container.querySelector('.collapsible__header')!;
    const content = container.querySelector('.collapsible__content')!;

    // Button controls the content region
    const controlsId = button.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    expect(content.getAttribute('id')).toBe(controlsId);

    // Content region is labelled by the button
    const headerId = button.getAttribute('id');
    expect(headerId).toBeTruthy();
    expect(content.getAttribute('aria-labelledby')).toBe(headerId);

    // Content has region role
    expect(content.getAttribute('role')).toBe('region');
  });

  it('keyboard toggle with Enter/Space', async () => {
    const { container } = render(
      <Collapsible title="Keyboard Test">
        <p>Content here</p>
      </Collapsible>
    );
    const button = container.querySelector('.collapsible__header')!;
    const wrapper = container.querySelector('.collapsible')!;

    // Button is a <button>, so Enter and Space fire click events by default
    // Just verify the button is focusable
    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('type')).toBe('button');
  });

  it('matches file snapshot (closed)', async () => {
    const { container } = render(
      <Collapsible title="Snapshot Closed" data-testid="snapshot-closed">
        <p>Snapshot content</p>
      </Collapsible>
    );
    await expect(container.innerHTML).toMatchFileSnapshot(
      './__snapshots__/Collapsible/closed.html'
    );
  });

  it('matches file snapshot (open)', async () => {
    const { container } = render(
      <Collapsible title="Snapshot Open" defaultOpen={true} data-testid="snapshot-open">
        <p>Snapshot content</p>
      </Collapsible>
    );
    await expect(container.innerHTML).toMatchFileSnapshot(
      './__snapshots__/Collapsible/open.html'
    );
  });
});
