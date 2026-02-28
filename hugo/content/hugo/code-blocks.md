---
title: "Code Blocks Demo"
---

# Code Blocks — Hugo

Syntax-highlighted code blocks rendered with Hugo's built-in Chroma highlighter.

## JavaScript

```javascript
// Fibonacci sequence generator
function* fibonacci(limit) {
  let a = 0, b = 1;
  while (a <= limit) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const sequence = [...fibonacci(100)];
console.log("Fibonacci:", sequence);
```

## Python

```python
# Simple web scraper with error handling
import requests
from dataclasses import dataclass

@dataclass
class Page:
    url: str
    title: str
    status: int

def fetch_page(url: str) -> Page:
    """Fetch a page and return its metadata."""
    response = requests.get(url, timeout=10)
    title = response.text.split("<title>")[1].split("</title>")[0]
    return Page(url=url, title=title, status=response.status_code)

if __name__ == "__main__":
    page = fetch_page("https://example.com")
    print(f"Title: {page.title} (HTTP {page.status})")
```

## HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hello World</title>
  <style>
    .container { max-width: 800px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello, World!</h1>
    <p>This is a <a href="#">sample page</a>.</p>
  </div>
</body>
</html>
```

## Go

```go
package main

import (
	"fmt"
	"net/http"
	"log"
)

// handler responds with a greeting
func handler(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Query().Get("name")
	if name == "" {
		name = "World"
	}
	fmt.Fprintf(w, "Hello, %s!", name)
}

func main() {
	http.HandleFunc("/", handler)
	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
```

## Bash

```bash
#!/bin/bash
# Deploy script with environment checks

set -euo pipefail

ENV="${1:-staging}"
BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "Deploying branch '$BRANCH' to $ENV..."

if [[ "$ENV" == "production" && "$BRANCH" != "main" ]]; then
  echo "Error: Only 'main' branch can deploy to production"
  exit 1
fi

yarn build && yarn test
echo "Deploy to $ENV complete."
```
