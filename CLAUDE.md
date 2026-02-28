# Hugo/Astro split site

These are operating instructions. More information about the site's design can be found in [design.md](./design.md).

## Package manager

Use yarn.

## CSS and theme

The theme should be fully tokenized, including whitespace, typography, primary color, secondary color, shades of gray, and so on. Support dark mode. I don't care how the theme folder is organized, do what makes sense for the build pipelines of both frameworks (Hugo and Astro). But the CSS and tokens should all be stored in a `theme` folder in some shared location.

In the future, we want to use CSS modules in Astro, but since we still need to support Hugo for now, use a BEM format and file organization approach that will easily convert to CSS modules later.

The visual style should be clean and minimalist, with an occasional pop of color on buttons, tab navigation, etc., using the primary color token (and secondary when two colors are needed). Use the minimum amount of CSS needed to make a good user experience, since I will not actually use this CSS in real life. The CSS is not the point of this study.

Use emoji anywhere you would typically use an icon.

## Component architecture and testing

Astro components with any interactivity should be written in Preact, with their behavior tested in isolation at the component level. Include a Vitest file snapshot of the initial render of key component variations in the tests folder, in a `__snapshots__/<COMPONENT_NAME>` folder. Static Astro components such as alerts can just be tested in the e2e section, if there is no way to render them for the kind of testing described above. (I'm not familiar with testing static Astro components, feel free to advise me.)

Our Hugo components are mock legacy components, so it matters less how they are implemented (vanilla JS is fine), but they should use the same styles and HTML structure as Astro components.

Anytime you make a new component, add two pages to the site and its nav:

- "Hugo <COMPONENT_NAME> demo" page
- "Astro <COMPONENT_NAME> demo" page

This component page should contain any possible permutations of the component. For example, if you build an alert component, include multiple alerts on the page showing info level, warning level, etc.

## e2e testing

Anytime you add a new feature or component to the site, add Playwright e2e tests for Chrome. Verify all functionality of the component or feature in both Hugo and Astro.

When covering functionality that could be conveyed as a user story, such as "The user can switch tabs with the tab nav", use Playwright screenshot testing to take a before and after screenshot.

# Documentation

Maintain a `./docs/user_stories.md` file that links to individual user story demo files, also in Markdown.

When you implement a new user story, such as "The user can switch tabs with the tab nav", or "The user can seamlessly switch between Hugo and Astro pages" create a user story file demoing that feature that uses the Playwright screenshots, so they are always up to date.

# Feedback

Feedback is welcome. If I've made an unusual or non-ideal architectural choice, flag that and offer alternatives, along with pros and cons. Never assume I know what I'm talking about. Make suggestions that can improve my design anytime.

# Learning

When you use an industry standard pattern that I might not know about, such as using `data-testid` in a component, list that decision for me after finishing the task, and explain why it's a good pattern. Make these explanations very brief (think a bulleted list of key patterns/decisions).
