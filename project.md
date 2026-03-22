# Who's Who — Org Chart Viewer

A self-contained web application for browsing an organisation's people directory and reporting structure. Runs standalone with mock data or connects to SharePoint for live data.

## Features

- **New Joiners** — cards for people who started in the past 30 days, sorted newest first
- **Org Chart** — interactive tree with expand/collapse, click-to-highlight, and visual connectors
- **Directory** — searchable, filterable grid of all employees with multi-select department and office filters
- **Global Search** — quick-jump search bar in the header; matches on name, title, department, and email

## Tech Stack

Vanilla JavaScript and CSS. No frameworks, no build tools beyond a shell script. The app is a single HTML page with inlined assets.

## Project Structure

```
index.html              Main HTML shell (three view sections + header)
build.sh                Concatenates CSS/JS into a single dist/index.html
css/
  base.css              Layout, header, tabs, search, loading/error states
  orgchart.css          Tree connectors, org cards, toggle buttons
  directory.css         Toolbar, multi-select filters, directory grid/cards
  new-joiners.css       New joiners grid and card styles
js/
  config.js             Toggle mock/SharePoint, API settings
  mock-data.js          Deterministic test data generator (~400 people)
  data-utils.js         Hierarchy depth computation, unique-value extraction
  sharepoint.js         SharePoint REST API integration (search + profiles)
  chart-renderer.js     Org chart tree rendering with expand/collapse
  search.js             Header search autocomplete controller
  directory.js          Directory grid view controller
  new-joiners.js        New joiners view controller
  app.js                App entry point — loads data, wires up all views
dist/
  index.html            Built artifact (self-contained, no external deps)
```

## Data Model

Each person record has the following fields:

| Field            | Type     | Description                              |
|------------------|----------|------------------------------------------|
| `id`             | string   | Unique identifier                        |
| `parentId`       | string   | Manager's id (null for CEO)              |
| `displayName`    | string   | Full name                                |
| `jobTitle`       | string   | Role / title                             |
| `department`     | string   | Department name                          |
| `mail`           | string   | Email address                            |
| `officeLocation` | string   | Office / country                         |
| `startDate`      | string   | ISO date (YYYY-MM-DD)                    |
| `photo`          | string   | Profile photo URL (null if unavailable)  |

## Mock Data

When `useMockData` is `true` (the default), the app generates deterministic test data:

- 1 CEO
- 12 VPs (one per department)
- 4–6 managers per VP
- 4–6 individual contributors per manager
- ~8% of people have a start date within the past 30 days

The random generator is seeded so the data is identical on every load.

## Configuration

Edit `js/config.js`:

```js
useMockData: true       // true = generated data, false = SharePoint
siteUrl: ''             // SharePoint site URL (auto-detected if blank)
pageSize: 500           // Users per API page
managerBatchSize: 8     // Parallel manager-fetch requests
```

## Build

```bash
./build.sh
```

Produces `dist/index.html` — a single file with all CSS and JS inlined. Drop it on any web server or open it directly in a browser.

## SharePoint Integration

When `useMockData` is `false`, the app:

1. Fetches all users via the SharePoint People search API (`/_api/search/query`)
2. Resolves manager relationships in parallel batches using `PeopleManager/GetPropertiesFor()`
3. Builds the same data model used by mock data, then renders all views
