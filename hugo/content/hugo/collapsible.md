---
title: "Collapsible Demo"
---

# Collapsible Sections — Hugo

Collapsible content sections rendered with Hugo shortcodes and vanilla JS.

## Default (closed)

{{< collapsible title="Click to expand" id="closed-demo" >}}
This section starts closed. Click the header to reveal this content. The section smoothly animates open and closed.
{{< /collapsible >}}

## Default open

{{< collapsible title="This section starts open" id="open-demo" defaultOpen="true" >}}
This section is open by default because `defaultOpen` is set to `true`. Click the header to collapse it.
{{< /collapsible >}}

## Multiple sections

{{< collapsible title="Section one" id="multi-1" >}}
Content for the first collapsible section.
{{< /collapsible >}}

{{< collapsible title="Section two" id="multi-2" >}}
Content for the second collapsible section.
{{< /collapsible >}}

{{< collapsible title="Section three" id="multi-3" >}}
Content for the third collapsible section.
{{< /collapsible >}}

## Rich content

{{< collapsible title="Section with rich content" id="rich-demo" >}}

This section contains **bold text**, *italic text*, and a [link](#).

- List item one
- List item two
- List item three

> A blockquote inside a collapsible section.

{{< /collapsible >}}
