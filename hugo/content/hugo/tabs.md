---
title: "Tabs Demo"
---

Tab components rendered with Hugo shortcodes and vanilla JS.

## Two tabs

{{< tabs id="two" >}}
  {{< tab label="First" >}}
Content of the first tab.
  {{< /tab >}}
  {{< tab label="Second" >}}
Content of the second tab.
  {{< /tab >}}
{{< /tabs >}}

## Three tabs

{{< tabs id="three" >}}
  {{< tab label="Overview" >}}
This is an overview of the feature.
  {{< /tab >}}
  {{< tab label="Details" >}}
Here are the detailed specifications.
  {{< /tab >}}
  {{< tab label="Examples" >}}
Some practical examples to get you started.
  {{< /tab >}}
{{< /tabs >}}

## Tabs with rich content

{{< tabs id="rich" >}}
  {{< tab label="Code" >}}
```
const x = 42;
console.log(x);
```
  {{< /tab >}}
  {{< tab label="Output" >}}
The output would be: `42`
  {{< /tab >}}
{{< /tabs >}}
