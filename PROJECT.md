# Who's Who - Org Chart Project

## What This Project Is

An interactive **organizational chart** for SharePoint/Teams that shows who works where, who reports to whom, and lets you search for people. Built as a SharePoint Framework (SPFx) web part using React + TypeScript + d3-org-chart.

**Tenant:** Mintelgroup
**Repo:** tonyyox/Whoswho
**Branch:** `claude/learn-coding-together-AlqxP`

---

## What's Been Built So Far

### Phase 1: Project Scaffolding (complete)
- SPFx project created with standard folder structure
- TypeScript + React configured
- Gulp build system set up
- Node 18 pinned via `.nvmrc`

### Phase 2: Core Components (complete)
- **WhosWhoWebPart.ts** - Entry point that loads the React app
- **WhosWho.tsx** - Main component (manages loading/error states, fetches data)
- **OrgChart.tsx** - Renders the org chart tree using d3-org-chart
  - Shows photo, name, job title, department, office location per node
  - Highlights searched users with blue border
  - Centers view on selected person
- **SearchBox.tsx** - Type-ahead search (min 2 chars, filters by name/title/dept/email, max 10 results)
- **GraphService.ts** - Data layer using SharePoint REST APIs (not Graph API - no admin needed)
  - Fetches users via SharePoint Search API
  - Fetches manager relationships via PeopleManager API
  - Builds parent-child hierarchy for the chart

### Phase 3: Environment & Deployment Setup (complete)
- Codespaces support added (manifest URL rewriting, port forwarding)
- Dev server configured for Mintelgroup SharePoint
- `.sppkg` package built and saved to `sharepoint/solution/`
- CLAUDE.md created for AI-assisted development context

### Experiment: People Directory
- Simple standalone HTML page (`people-directory/index.html`)
- Uses randomuser.me API for demo data
- Card-based UI - was a quick test/proof of concept

---

## Key Constraint

**No admin access.** Everything must work with user-level SharePoint permissions only. That's why the data layer uses SharePoint REST APIs instead of Microsoft Graph (which would need tenant admin to grant API permissions).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | SharePoint Framework (SPFx) 1.22.2 |
| UI | React 17, Fluent UI 8 |
| Language | TypeScript 4.7 |
| Visualization | d3-org-chart 3.1.1, d3 7.9.0 |
| Build | Gulp 4, @microsoft/sp-build-web |
| Runtime | Node.js 18 |

---

## File Map (key files only)

```
src/webparts/whosWho/
  WhosWhoWebPart.ts              # Web part entry point
  WhosWhoWebPart.manifest.json   # SPFx manifest
  components/
    WhosWho.tsx                   # Main React component
    OrgChart.tsx                  # D3 org chart rendering
    SearchBox.tsx                 # Search/filter UI
    IWhosWhoProps.ts              # TypeScript interfaces
    services/
      GraphService.ts            # SharePoint REST API data service
config/
  package-solution.json          # Solution packaging config
  serve.json                     # Dev server config
  config.json                    # Bundle/externals config
sharepoint/solution/
  whos-who-org-chart.sppkg       # Pre-built deployment package
people-directory/
  index.html                     # Standalone experiment (demo data)
```

---

## What's NOT Done Yet

### Known Issues
- `lib/` directory missing - project needs a fresh `gulp build` to compile
- Azure CDN not configured (deploy-azure-storage.json has placeholders)
- CDN path in write-manifests.json not set

### Untested
- Never confirmed working end-to-end on Mintelgroup SharePoint
- Search performance with large user directory unknown
- Manager hierarchy accuracy depends on SharePoint profile data quality

---

## Possible Next Directions

Pick whichever interests you most - these are independent options, not a fixed sequence:

### Option A: Get It Running
1. Run `gulp build` and fix any errors
2. Test in SharePoint Workbench (https://mintelgroup.sharepoint.com/_layouts/15/workbench.aspx)
3. Deploy the .sppkg to a site collection app catalog (no tenant admin needed)
4. Verify real data loads correctly

### Option B: Improve the People Directory Experiment
- Turn the standalone HTML experiment into something more useful
- Connect it to real SharePoint data instead of randomuser.me
- Add search, filters, department grouping
- Could be simpler to iterate on than the full SPFx web part

### Option C: Enhance the Org Chart
- Add click-to-expand/collapse branches
- Show more user details on click (phone, email, etc.)
- Add department color coding
- Improve mobile/responsive layout
- Add breadcrumb trail showing reporting chain

### Option D: Build Something Different
- The SPFx scaffolding and SharePoint REST API knowledge transfers to other web parts
- Could pivot to a different tool (team directory, project dashboard, etc.)

---

## Lessons Learned

1. **SPFx needs Node 18** - Use `nvm use 18` in Codespaces
2. **No admin = no Graph API** - SharePoint REST APIs are the workaround. The Search API and PeopleManager API give you most of what Graph would.
3. **Codespaces needs special config** - Manifest URLs must be rewritten for port forwarding to work; dev server must bind to 0.0.0.0.
4. **SPFx has a steep learning curve** - Lots of config files, specific build tooling, Microsoft-specific patterns. Take it one piece at a time.
5. **Site collection app catalog** - You can deploy without tenant admin by using a site-level app catalog (needs a site collection admin to enable once, then you can upload .sppkg files).
6. **CLAUDE.md is useful** - Keeping project context in a markdown file helps when starting new AI-assisted sessions.

---

## How to Start a New Session

1. Open Codespaces or your dev environment
2. `nvm use 18` (if needed)
3. `npm install` (if node_modules is missing)
4. `gulp serve` to start the dev server
5. Open the workbench URL to test

Share this PROJECT.md at the start of a new chat so the AI has full context.
