#!/bin/bash
# Builds a single self-contained dist/index.html by inlining all CSS and JS.
# Usage: ./build.sh

set -e
cd "$(dirname "$0")"
mkdir -p dist

# Concatenate CSS
CSS=""
for f in css/base.css css/orgchart.css css/directory.css; do
  CSS="$CSS$(cat "$f")
"
done

# Concatenate JS
JS=""
for f in js/config.js js/mock-data.js js/data-utils.js js/sharepoint.js js/chart-renderer.js js/search.js js/directory.js js/app.js; do
  JS="$JS$(cat "$f")
"
done

# Extract the HTML body content (between <body> and </body>), stripping <link> and <script src> tags
BODY=$(sed -n '/<body>/,/<\/body>/p' index.html \
  | grep -v '<link rel="stylesheet"' \
  | grep -v '<script src=' \
  | grep -v '</\?body>')

cat > dist/index.html << HTMLEOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Who's Who - Org Chart</title>
  <style>
$CSS  </style>
</head>
<body>
$BODY
  <script>
$JS  </script>
</body>
</html>
HTMLEOF

echo "Built dist/index.html ($(wc -c < dist/index.html) bytes)"
