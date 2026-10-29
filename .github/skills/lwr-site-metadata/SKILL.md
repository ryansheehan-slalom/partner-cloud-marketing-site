---
name: lwr-site-metadata
description: Create and edit Salesforce enhanced LWR (Experience Cloud) site metadata in source format — DigitalExperienceBundle routes, views, theme layouts, and LWC placement in content.json — and deploy, sync, and publish it safely. Use when placing or swapping LWCs on LWR pages, creating/renaming/deleting pages, finding/retrieving (or setting up) a project's LWR site, editing header/footer layouts, retiring components a site uses, or deploying site changes in any SFDX project. Not for general LWC authoring (see experience-cloud-development), Aura sites, or legacy ExperienceBundle sites.
---

# LWR Site Metadata Skill

How to read, generate, and deploy the files behind an **enhanced LWR** Experience Cloud site (`<packageDir>/**/digitalExperiences/site/<Bundle>/`) without Experience Builder, in any SFDX project.

**Bundled tool:** `scripts/lwr_site.py`, next to this file (Python 3.8+, standard library only). It discovers the project layout, scaffolds pages, places/swaps/removes components with deterministic IDs, and validates a bundle. Prefer it over hand-editing JSON. Reference: §11.

> **Provenance.** Rules marked _verified_ were confirmed against a live org (Build Your Own (LWR) template, API 66), including a full end-to-end run of this skill's workflows on a throwaway page: create → dry-run → deploy → retrieve (`contentKey`) → redeploy in place → add/replace/remove components → change URL → edit an existing page and theme layout (dry-run) → delete. Names like `Inner`, `scopedHeaderAndFooter`, `headerSection` are that template's. Other templates use other names, so always read the real values with `inspect` (§0).

---

## 0. Before you start (every new project)

**1. Confirm this skill applies.** It covers _enhanced_ LWR sites, stored as `DigitalExperienceBundle`.

| You see in the project                               | Site type                                   | This skill?                                     |
| ---------------------------------------------------- | ------------------------------------------- | ----------------------------------------------- |
| `digitalExperiences/site/<Bundle>/sfdc_cms__route/…` | Enhanced LWR (DigitalExperienceBundle)      | ✅ Yes                                          |
| `experiences/<Site>/routes/*.json`, `views/*.json`   | Aura or non-enhanced LWR (ExperienceBundle) | ❌ No. Similar concepts, different file layout. |
| Neither                                              | Site not in the project yet                 | Follow **"No site in the project"** below       |

### No site in the project: find it, retrieve it, or create it

Don't guess a site name, and don't create a site without asking. Work through these steps in order:

**a) Find the target org.** Use the alias the user named, else the project default (`sf config get target-org`). If neither is set, ask. `sf org list` shows connected orgs.

**b) List the enhanced LWR sites in that org** (read-only):

```bash
sf org list metadata --metadata-type DigitalExperienceBundle --target-org <alias>        # site/<Bundle> entries = enhanced LWR sites
sf data query -q "SELECT Name, UrlPathPrefix, Status FROM Network ORDER BY Name" --target-org <alias>   # display names, URL, status (includes Aura sites)
```

Bundle names derive from the site name: non-alphanumerics become `_` and `1` is appended (`"Karol's Playground"` → `Karol_s_Playground1`, `"Pap CMS 2.0"` → `Pap_CMS_2_01`). Use this to match a `Network.Name` to its `site/<Bundle>`. A Network with no matching bundle is an Aura or legacy site, which is out of scope.

**c) Site exists in the org → ask which one, then retrieve it.**

- If the user already named the site, confirm the matching bundle. Otherwise show them the list (name, URL prefix, status) and ask. Never pick one yourself when there are several.
- Retrieve into the project (read-only for the org):
  ```bash
  sf project retrieve start --metadata "DigitalExperienceBundle:site/<Bundle>" --target-org <alias>
  ```
  Optionally also retrieve `Network:<Name>`, `CustomSite:<Site_Name>`, and `DigitalExperienceConfig:<Bundle>` if the project will manage site settings. `inspect` uses the Network file to show the publish name and URL prefix.
- Run `inspect` and continue.

**d) No enhanced LWR site exists → explain how to create one, and ask before doing it.** Creating a site is a visible org-level change. It needs Digital Experiences enabled (Setup → Digital Experiences → Settings), and it's often an admin decision about URL, template, and guest access. Offer both routes and let the user choose:

- **Setup UI** (recommended for a first site): Setup → Digital Experiences → All Sites → **New** → choose an LWR template (e.g. _Build Your Own (LWR)_) → name and URL → Create.
- **CLI** (only with the user's explicit go-ahead):
  ```bash
  sf community list template --target-org <alias>     # LWR templates end in "(LWR)", e.g. "Build Your Own (LWR)", "Microsite (LWR)"
  sf community create --name "<Site Name>" --template-name "Build Your Own (LWR)" \
    --url-path-prefix <prefix> templateParams.AuthenticationType=<TYPE> --target-org <alias>
  ```
  `AuthenticationType` is case-sensitive and required for _Build Your Own (LWR)_. Ask which the user wants: login-only (`AUTHENTICATED`), or public pages for guests (`AUTHENTICATED_WITH_PUBLIC_ACCESS_ENABLED`; the CLI's own example also shows `UNAUTHENTICATED`, so check `sf community create --help` for your CLI version). Creation is asynchronous (`SELECT Status, Error FROM BackgroundOperation WHERE Id = '<jobId>'`, times out after 10 minutes). The new site starts unpublished/preview.
- Once it exists, continue with **c)** to retrieve it.

**2. Locate the script** (path depends on where the skill is installed):

```bash
LWR="$(find . ~/.copilot/skills ~/.claude/skills -path '*lwr-site-metadata/scripts/lwr_site.py' -not -path '*/node_modules/*' 2>/dev/null | head -1)"
python3 "$LWR" --help          # Windows: use `py -3` or `python` instead of python3
```

**3. Orient with `inspect`.** Run it from anywhere inside the SFDX project. It reads `sfdx-project.json` for package dirs and namespace and auto-detects the bundle (`--bundle NAME` if there are several):

```bash
python3 "$LWR" inspect
```

It prints the bundle, the **LWC prefix** (`c:` or your namespace), the **Network name** to publish with, the live **URL prefix**, each **theme layout type → layout → regions**, the default layout for new pages, and every **route → /url → view** with its components. Use these real values in everything below.

---

## Quick start

```bash
python3 "$LWR" inspect                                   # learn names, layouts, regions
python3 "$LWR" new-page --name "Case Studies" --slug case-studies --page-access Public --flush \
  --description "Client stories" \
  --component 'myPageHero={"title":"Case studies"}' --component myCtaBand
python3 "$LWR" replace-component --view <bundle>/sfdc_cms__view/home/content.json --old c:oldHero --new myHero
python3 "$LWR" validate                                  # lint before every deploy

sf project deploy start --target-org <alias> --dry-run \
  --metadata "LightningComponentBundle:myPageHero" --metadata "LightningComponentBundle:myCtaBand" \
  --metadata "DigitalExperience:site/<Bundle>.sfdc_cms__route/Case_Studies__c" \
  --metadata "DigitalExperience:site/<Bundle>.sfdc_cms__view/Case_Studies"
```

Then: real deploy → **retrieve the bundle back** (captures `contentKey`s) → publish (§7).

Bare component names (`myHero`) get the project prefix automatically (`c:myHero`, or `<namespace>:myHero` in namespaced projects).

---

## 1. Anatomy of a DigitalExperienceBundle

```
digitalExperiences/site/<Bundle>/                 # Bundle = DigitalExperienceBundle name (often "<Site_Name>1")
├── <Bundle>.digitalExperience-meta.xml
├── sfdc_cms__route/<Route>/{_meta.json,content.json}       # URL -> view mapping (one per page)
├── sfdc_cms__view/<View>/{_meta.json,content.json}         # page layout + components
│                         └── <lang>.json (optional)        # per-language overrides
├── sfdc_cms__themeLayout/<Layout>/content.json             # header/footer shell around views
├── sfdc_cms__theme/<Theme>/content.json                    # maps layout types -> theme layouts
├── sfdc_cms__brandingSet/…  sfdc_cms__styles/…             # tokens, global CSS
└── sfdc_cms__site/…  sfdc_cms__appPage/…  sfdc_cms__languageSettings/…
```

How the pieces link:

```
route content.json                       view content.json                   theme content.json
  urlPrefix: "case-studies"  ─activeViewId─▶ _meta apiName "Case_Studies"
  routeType: "custom-casestudies" ◀must equal▶ viewType "custom-casestudies"
                                             themeLayoutType: "<LayoutType>" ─▶ layouts[{layoutType, layoutId}]
                                                                                └▶ sfdc_cms__themeLayout/<layoutId>
```

| Item                            | Naming                                                                            | Notes                                                                     |
| ------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Custom route folder / `apiName` | `<Name>__c`                                                                       | `_meta.json` `apiName` **must equal the folder name**                     |
| Custom view folder / `apiName`  | `<Name>` (no `__c`)                                                               | Route `activeViewId` = this name                                          |
| Home                            | route `Home`, view `home`, `routeType` `home`, `urlPrefix` `""`                   | Exists in every site. Edit it, never create it.                           |
| Standard pages                  | `login-main`, `error`, `self-register`, `forgot-password`, `managed-content-*`, … | Reserved route types; leave alone unless asked                            |
| `routeType` / `viewType`        | `custom-<slug-without-dashes>`, ≤ 50 chars                                        | Unique per site; route and view values must match                         |
| `urlPrefix`                     | URL segment under the site prefix                                                 | Unique per site (`managed-content-*` routes excepted)                     |
| Nested URL                      | route `_meta.json` `"parentId": "sfdc_cms__route/<Parent>__c"`                    | Child URL becomes `/parent/child`                                         |
| `pageAccess`                    | `Public` \| `UseParent` \| `RequiresLogin`                                        | `UseParent` inherits the site's guest settings                            |
| `themeLayoutType`               | A `layoutType` from `sfdc_cms__theme/*/content.json`                              | Template-specific names. Use `inspect`; `validate` rejects unknown values |

**API-name sanitizing** (from page names): trim; prefix `X` if it starts with a digit; spaces/dashes → `_`; drop other special characters; collapse `__`; strip trailing `_`. `"5 Key Items - What to Look For"` → `X5_Key_Items_What_to_Look_For`.

---

## 2. The view component tree

> **Illustrative, not a template to paste.** The block below shows one _Build Your Own (LWR)_ page. Values in `<…>` are placeholders. `//` comments and the `"...": …` line aren't valid JSON. **Don't hand-build pages from it.** Use `new-page`, which copies the real structure of an existing page in the target site (§5.2), or copy an existing view in the same bundle.

What generalizes and what doesn't:

| Part                                                                                                                                                                                                                                                                  | Applies to                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Node shape: components `{definition, id, type:"component", attributes, children?}`, regions `{name, title, id, type:"region", children}`; `contentBody.{component, themeLayoutType, viewType, dataProviders}`; `community_builder:seoAssistant` in `sfdcHiddenRegion` | **All** enhanced LWR sites                                                                  |
| Root layout (`community_layout:sldsFlexibleLayout`), section component (`community_layout:section` + `sectionConfig`), region names (`content`, `col1`), section attributes                                                                                           | **This template** (BYO LWR). Other templates differ; read an existing view or run `inspect` |
| Titles, ids, `c:my*` components, `viewType`, `urlName`, attribute values                                                                                                                                                                                              | **This example page** only                                                                  |

```jsonc
{
  "type": "sfdc_cms__view",
  "title": "Case Studies", // Builder page name
  "contentBody": {
    "component": {
      "definition": "community_layout:sldsFlexibleLayout",
      "id": "<uuid A>",
      "type": "component",
      "children": [
        {
          "type": "region",
          "name": "content",
          "title": "Content",
          "id": "<uuid B>",
          "children": [
            {
              "definition": "community_layout:section",
              "id": "<uuid S>",
              "type": "component",
              "attributes": {
                "componentSpacerSize": "0rem", // gap between stacked components ("" = theme default)
                "sectionColumnGutterWidth": "0rem",
                "sectionConfig": "{\"UUID\":\"<uuid S>\",\"columns\":[{\"UUID\":\"<uuid C>\",\"columnName\":\"Column 1\",\"columnKey\":\"col1\",\"columnWidth\":\"12\",\"seedComponents\":[]}]}",
                "...": "layoutDirection*, maxContentWidth, sectionMinHeight, background*"
              },
              "children": [
                {
                  "type": "region",
                  "name": "col1",
                  "title": "Column 1",
                  "id": "<uuid C>",
                  "children": [
                    {
                      "definition": "c:myHero",
                      "id": "<uuid>",
                      "type": "component",
                      "attributes": {}
                    },
                    {
                      "definition": "c:myFaq",
                      "id": "<uuid>",
                      "type": "component",
                      "attributes": {}
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "region",
          "name": "sfdcHiddenRegion",
          "title": "sfdcHiddenRegion",
          "id": "<uuid D>",
          "children": [
            {
              "definition": "community_builder:seoAssistant",
              "id": "<uuid E>",
              "type": "component",
              "attributes": {
                "pageTitle": "Case Studies",
                "description": "…",
                "customHeadTags": "",
                "recordId": "{!recordId}"
              }
            }
          ]
        }
      ]
    },
    "dataProviders": [],
    "themeLayoutType": "<LayoutType>",
    "viewType": "custom-casestudies"
  },
  "urlName": "case-studies"
}
```

Rules:

- **`sectionConfig` is a JSON _string_ that mirrors the tree** (BYO template; other templates may embed ids in other attribute strings). Its `UUID` equals the section `id`; each `columns[].UUID` equals a child region `id`, and `columnKey` equals that region's `name`. Drift here breaks Builder. Multi-column sections add regions `col2`, … with `columnWidth`s summing to 12. When copying structure, remap ids inside attribute strings too (`new-page` does).
- Components render top-to-bottom in region `children` order.
- SEO lives in the hidden region's `seoAssistant`: `pageTitle`, `description`, `customHeadTags` (raw `<meta>`/`<link>` HTML; escape `"` in values as `&quot;`).
- Theme layouts use the same structure. Their header/footer region names come from the template (see `inspect`), and layout options such as `"stickyThemeHeader"` sit in the root component's `attributes`.
- Optional `sfdc_cms__view/<View>/<lang>.json` overrides `title` and SEO attributes, keyed by the **same component `id`** as in `content.json`.
- Definitions that aren't `c:`/your namespace (`community_layout:*`, `community_builder:*`, `forceCommunity:*`, `dxp_*`, other managed packages) are platform/package components. Keep them as they are.
- JSON key order and whitespace don't matter. The org re-serializes on retrieve (`"key" : value`, adds empty `"dxpStyle" : { }`), so expect formatting-only diffs after a sync.

---

## 3. Identifiers: what you generate vs. what you must never invent

| Identifier                          | Where                     | Owner       | Rule                                                                                                                                                                                                                                                                                         |
| ----------------------------------- | ------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component/region `id`               | `content.json` tree       | **You**     | **Required** (_verified_): a missing id fails with "is missing but it is required", `""` fails the schema regex (UUID, or a 28-char uppercase key), and duplicates fail with "Specify a unique ID for each component in this view." The org keeps your ids unchanged on deploy and retrieve. |
| `sectionConfig` UUIDs               | section `attributes`      | You         | Mirror section/region ids (§2).                                                                                                                                                                                                                                                              |
| `contentKey`                        | `_meta.json`              | **The org** | Never invent or edit. Omit for new items; retrieve after the first deploy to capture it.                                                                                                                                                                                                     |
| `apiName`                           | `_meta.json`              | You         | Equals folder name; never rename in place (§5.5).                                                                                                                                                                                                                                            |
| `routeType`/`viewType`, `urlPrefix` | route/view `content.json` | You         | Unique per site; route and view types match.                                                                                                                                                                                                                                                 |

So: **you can't deploy blank component ids and fetch them later.** Only `contentKey` is org-assigned.

### UUID strategy: deterministic v5 (recommended)

Generate ids as **UUID v5 = hash(namespace, human-readable seed)** rather than random v4 (pattern from a production CMS-driven LWR page generator):

- **Idempotent.** Regenerating a page yields identical ids, so diffs show only real changes and redeploys update in place.
- **Seeds encode meaning**: `<ViewApi>-layout`, `-body`, `-region`, `-seo`, `-hidden-region`, `-top-layout`, `-cmp-<index>-<definition>`. Always include the page API name so ids never collide across pages; add index/role for repeated components.
- **One namespace per site.** The script uses `uuid5(NAMESPACE_URL, "lwr-site:<Bundle>")` by default. Override with `--ns <uuid>` or env `LWR_SITE_UUID_NS` to match other tooling (e.g. a CI generator), and keep it stable.

Editing rules:

- **Keep** the ids of components you don't touch. Builder state is keyed by them.
- A component whose **definition changes** (A → B) gets a **new id**.
- Never copy a component (with its id) between pages; generate a new one.
- Random v4 UUIDs are fine for one-off hand edits; just keep them unique.

### `contentKey` lifecycle

1. New route/view → `_meta.json` **without** `contentKey`.
2. Deploy → org creates the item and assigns a key.
3. **Immediately retrieve the bundle into the project and commit.** Otherwise a later deploy from a stale checkout can try to create the item again or mismatch the org.
4. Metadata-format retrieves (`--target-metadata-dir`) omit `contentKey`. That's normal, not drift.

---

## 4. Making LWCs placeable on site pages

- Set `isExposed=true` with targets `lightningCommunity__Page` (placeable) and `lightningCommunity__Default` (enables Builder properties via `targetConfigs`).
- `attributes` keys in `content.json` are `@api` property names (camelCase). Use JSON types; omitted keys fall back to JS defaults, so `{}` is valid.
- Builder lists a property only if it's declared in `targetConfig targets="lightningCommunity__Default"`. Picklists use `datasource="a,b,c"`. Boolean `@api` defaults must be `false`.
- Builder saves `""` for cleared text fields, so write getters with fallbacks (`return this.imageUrl || DEFAULT_URL;`).
- Keep long or structured content (lists, FAQs, article bodies) in the LWC or a data module, not in dozens of flat attributes.

---

## 5. Workflows

### 5.1 Place, swap, or remove LWCs on an existing page

```bash
python3 "$LWR" add-component     --view <content.json> --definition myFaq --position 3
python3 "$LWR" add-component     --view <content.json> --definition myStats --attrs '{"stat1Value":"42%"}'
python3 "$LWR" replace-component --view <content.json> --old c:oldHero --new myHero [--keep-attrs]
python3 "$LWR" remove-component  --view <content.json> --definition myFaq [--all]
```

`--view` accepts any view **or theme layout** `content.json`. Default region is `col1`; pass `--region <name>` (names from `inspect`) or `--region-id` when ambiguous. For stacked full-width sections, set the section's `componentSpacerSize`/`sectionColumnGutterWidth` to `"0rem"`.

### 5.2 Create a new page

```bash
python3 "$LWR" new-page --name "Case Studies" --slug case-studies --page-access Public --flush \
  [--like <View>] [--theme-layout <LayoutType>] [--parent "Resources"] [--seo-title …] [--description …] \
  --component myPageHero --component myCtaBand
```

Creates `sfdc_cms__route/Case_Studies__c` + `sfdc_cms__view/Case_Studies` with deterministic ids and no `contentKey`.

**Page structure is copied from an existing view in the same site, so it matches any template.** The source is `home` by default, or `--like <View>`. The new page keeps the source's platform layout (root layout, sections/containers, regions, SEO component, layout attributes) and drops the project's own components and sibling sections. Your `--component`s go into the region where the source page keeps its components, every id is regenerated, and ids embedded in attribute strings (e.g. `sectionConfig`) are remapped. `--like builtin` forces the bundled BYO skeleton, which is also the fallback when no source view exists. Review the printed "structure copied from …" line, and choose `--like` with a page shaped like the one you want.

The theme layout defaults to the one used by existing custom pages, then the home page's; unknown layout types are rejected. Duplicate `urlPrefix`/`routeType` are refused, and `--force` regenerates while keeping `contentKey`s. Deploy both members together, then retrieve. Add the page to navigation (header LWC or NavigationMenu).

### 5.3 Header/footer (theme layout)

Edit `sfdc_cms__themeLayout/<layoutId>/content.json` like a view; `inspect` shows which layout each `themeLayoutType` maps to and its regions. Sticky headers are a layout attribute (`stickyThemeHeader` in the BYO template). A component's own `position: sticky` can't escape its layout region.

### 5.4 Delete a page (_verified_)

Deploy a `package.xml` containing only `<version>`, plus `destructiveChangesPre.xml`:

```xml
<!-- package.xml -->
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
  <version><your API version></version>
</Package>
```

```xml
<!-- destructiveChangesPre.xml -->
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
  <types>
    <members>site/<Bundle>.sfdc_cms__view/<View></members>
    <members>site/<Bundle>.sfdc_cms__route/<Route>__c</members>
    <name>DigitalExperience</name>
  </types>
</Package>
```

```bash
sf project deploy start --manifest <dir>/package.xml --pre-destructive-changes <dir>/destructiveChangesPre.xml --target-org <alias> --dry-run
# then the same command without --dry-run; both items report state "Deleted"
sf org list metadata --metadata-type DigitalExperience --target-org <alias>   # confirm they're gone
```

Then delete the local folders, fix links pointing at the page, and publish so the live site drops it.

### 5.5 Rename a page or change its URL

API names are immutable in place: in **one** deploy, delete the old route/view (pre-destructive) and create the new ones. Changing only `urlPrefix` (and `urlName`) on the route is a normal edit (_verified_). Either way, update hardcoded links and consider redirects.

### 5.6 Retire LWCs the site references (_verified_)

The platform blocks deleting an LWC a page still uses. In **one** deploy: repoint the site JSON, include the replacement LWCs, and list the old bundles in `destructiveChangesPost.xml`:

```bash
sf project deploy start --manifest <package.xml> --post-destructive-changes <destructiveChangesPost.xml> --target-org <alias>
sf org list metadata --metadata-type LightningComponentBundle --target-org <alias>   # verify removal
```

---

## 6. Manifests

```xml
<!-- site-package.xml: whole site (add Network/CustomSite/DigitalExperienceConfig if you manage them) -->
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
  <types><members>site/<Bundle></members><name>DigitalExperienceBundle</name></types>
  <version><your API version></version>
</Package>
```

Single pages use type `DigitalExperience` with members `site/<Bundle>.sfdc_cms__view/<View>` and `site/<Bundle>.sfdc_cms__route/<Route>`. Theme layouts use `site/<Bundle>.sfdc_cms__themeLayout/<Layout>`.

---

## 7. Deploy, sync, publish

### 7.1 Pre-flight drift check (don't overwrite Builder edits)

Before deploying site JSON beyond single pages, compare the org with your checkout:

```bash
sf project retrieve start --manifest <site-package.xml> --target-org <alias> --target-metadata-dir .retrieve-check --unzip
```

Compare each `content.json` structurally, ignoring empty `dxpStyle` objects and regenerated stylesheet media `ref` ids. Anything else means someone edited the site in Builder: retrieve into the project, re-apply your change, then deploy. Delete `.retrieve-check` afterwards (or gitignore it).

> _Verified:_ `--output-dir` with a bundle member returned "Nothing retrieved". Use `--target-metadata-dir … --unzip` for side-by-side copies, or `--metadata "DigitalExperienceBundle:site/<Bundle>"` to update the project in place.

### 7.2 Deploy scope

| Scope                                      | Member                                                                                 | When                                                          |
| ------------------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **Single page(s)** (preferred, _verified_) | `DigitalExperience:site/<Bundle>.sfdc_cms__view/<View>` (+ `…sfdc_cms__route/<Route>`) | Touches only those pages; won't overwrite other Builder edits |
| Theme layout                               | `DigitalExperience:site/<Bundle>.sfdc_cms__themeLayout/<Layout>`                       | Header/footer                                                 |
| Whole bundle                               | `DigitalExperienceBundle:site/<Bundle>`                                                | Initial setup, bulk changes, right after a fresh retrieve     |

### 7.3 Safety

- Deploy referenced **LWCs and static resources in the same deployment** as the site JSON that uses them.
- `--dry-run` first. It validates component references and route/view creation (_verified_).
- Destructive changes: **post** for LWCs (§5.6), **pre** for pages being replaced (§5.4–5.5).
- `validate` and LWC Jest tests before deploying.

### 7.4 Sync after deploy

```bash
sf project retrieve start --metadata "DigitalExperienceBundle:site/<Bundle>" --target-org <alias>
```

Commit the result: new `contentKey`s plus the org's normalized JSON. To check just what you deployed without touching the project, retrieve the single item side-by-side: `--metadata "DigitalExperience:site/<Bundle>.sfdc_cms__view/<View>" --target-metadata-dir .check --unzip`.

> **Formatter churn (_verified_).** Salesforce writes `"key" : value`, `[ ]`, and no trailing newline. If the project runs Prettier on JSON (e.g. a lint-staged pre-commit hook), committed site files get reformatted, and **every whole-bundle retrieve then rewrites every site file** (~70 files in testing, with zero semantic changes). Add `**/digitalExperiences/**` to `.prettierignore` so committed files match the org's serialization. Ask before changing project tooling; until then, judge diffs semantically (compare parsed JSON, ignoring empty `dxpStyle`).

### 7.5 Publish

```bash
sf community publish --name "<Network name>" --target-org <alias>
```

- `--name` is the **Network name** (shown by `inspect`, or `sf org list metadata --metadata-type Network`), not the bundle name.
- Asynchronous: returns a job id (`SELECT Status, Error FROM BackgroundOperation WHERE Id = '<jobId>'`).
- `UnderConstruction` sites aren't public even when published. Activation is an admin decision; ask first.
- LWC/CSS-only deploys also need a publish (then a hard refresh) to show on the live site.

---

## 8. LWC gotchas on the LWR site runtime (_verified_)

All of these passed local Jest tests and only failed on the live site.

1. **Template whitespace is trimmed differently on the platform.** Text and an inline element separated by a line break (as Prettier formats them) render with no space: `with a <span>compelling</span>` showed as "acompelling". Fix by rendering mixed text from JS segments that carry their own spaces, keeping it on one line, or spacing with CSS. Assert exact `textContent` in tests (don't normalize whitespace).
2. **Site-wide link styles leak into components.** The DXP base styles color links by state and underline on hover, which caused wrong button text color and double underlines. Neutralize in a shared stylesheet and opt back in per class:
   ```css
   :host {
     --link-color: currentColor;
   }
   a,
   a:link,
   a:visited,
   a:hover,
   a:focus,
   a:active {
     color: var(--link-color) !important;
     text-decoration: none !important;
   }
   .btn-primary {
     color: #fff;
     --link-color: #fff;
   } /* each link class sets the hook */
   .breadcrumb a:hover {
     text-decoration: underline !important;
   } /* deliberate underline */
   ```
3. **Bare `href="#id"` gets rewritten** (`#process` → `#process-3`), and native fragment navigation can't reach sections inside other components' shadow roots. Use `pathname + "#id"` hrefs plus a small module-level registry: sections register their `<section>` in `renderedCallback`, links `scrollIntoView()` and move focus (targets get `tabindex="-1"`), and a hash on page load is honored once per URL.
4. **Sites live under a path prefix** (`/<site>/…`, see `inspect`). Build internal links from `@salesforce/community/basePath`. Jest has no default mock, so map it in `jest.config.js` `moduleNameMapper`.
5. **CSS-only shared modules** (`@import "c/sharedStyles";`) compile on the platform but not in Jest. Map `'^c/sharedStyles$'` to the `.css` file in `moduleNameMapper`.
6. **Full-bleed sections** inside the content column need `width: 100vw; margin-left: calc(50% - 50vw)` plus `0rem` section spacing. Watch for horizontal scrollbars on Windows.
7. **Web fonts** injected by components need CSP Trusted Sites, or load them in the theme head markup instead.
8. **Static resources:** a folder `staticresources/<Name>/` with `<Name>.resource-meta.xml` (`application/zip`) is zipped by the CLI on deploy. Reference files as `${RESOURCE}/file.svg`.

---

## 9. Validation checklist

- [ ] `python3 "$LWR" validate` reports 0 errors. It checks ids are UUIDs and unique per file, `sectionConfig` mirrors regions, routes ↔ views and types match, `urlPrefix` is unique, `themeLayoutType` exists in the theme, and every project LWC referenced exists, is exposed, and has `lightningCommunity__Default`.
- [ ] New items have no `contentKey`; existing ones are unchanged
- [ ] Referenced LWCs/static resources are in the same deployment (or already in the org)
- [ ] LWC Jest tests and ESLint pass
- [ ] Drift check (§7.1) if deploying more than single pages
- [ ] `--dry-run` succeeded
- [ ] After deploy: retrieve and commit, publish, verify in the browser (hard refresh)

---

## 10. Troubleshooting

| Symptom                                                            | Cause                                                                                              | Fix                                                                           |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Can't delete LWC / component in use                                | Site JSON still references it                                                                      | Repoint pages, then delete via **post**-destructive in the same deploy (§5.6) |
| "id … is missing but it is required" / regex error                 | Blank or non-UUID component id                                                                     | Generate a UUID (v5 via the script)                                           |
| "Specify a unique ID for each component in this view"              | Duplicate id in a view                                                                             | `validate`; regenerate the duplicate                                          |
| Duplicate route on redeploy                                        | Local `_meta.json` lacks the org `contentKey`                                                      | Retrieve after the first deploy and commit (§3)                               |
| Broken/empty section in Builder                                    | `sectionConfig` doesn't mirror ids                                                                 | `validate`; fix ids                                                           |
| Page 404s                                                          | `activeViewId` ≠ view `apiName`, unpublished, or wrong URL prefix                                  | `validate`; publish; check the `inspect` URL prefix                           |
| "Nothing retrieved"                                                | `--output-dir` with a bundle member                                                                | `--target-metadata-dir … --unzip`, or retrieve into the project               |
| Big diff after retrieve, no real change                            | Org adds `dxpStyle: {}`, rewrites media refs, reformats; or Prettier formatted the committed files | Expected. Compare semantically; consider `.prettierignore` (§7.4)             |
| Words merged, recolored buttons, double underlines, dead `#` links | Live-runtime differences                                                                           | §8                                                                            |
| Changes not visible                                                | Not published, or browser cache                                                                    | Publish; hard refresh                                                         |
| Script: "No DigitalExperienceBundle site found"                    | Site not retrieved, doesn't exist yet, or is a legacy ExperienceBundle site                        | §0 "No site in the project": list, ask, retrieve, or offer to create          |

---

## 11. Script reference: `scripts/lwr_site.py`

Run from inside the SFDX project. `--bundle-dir`/`--bundle` are optional when the project has one site.

| Command                                | Purpose                                                              | Key options                                                                                                                                                                   |
| -------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inspect`                              | Bundle, LWC prefix, Network name, URL prefix, layouts/regions, pages | `--bundle --bundle-dir`                                                                                                                                                       |
| `new-page --name --slug`               | Scaffold route + view (structure copied from an existing view)       | `--like <View>\|builtin --title --seo-title --description --parent --page-access --theme-layout --component (repeatable; name, ns:name, or name={json}) --flush --force --ns` |
| `add-component --view --definition`    | Insert into a region                                                 | `--attrs --region --region-id --position --seed --random --ns`                                                                                                                |
| `replace-component --view --old --new` | Swap definition (new id)                                             | `--attrs --keep-attrs --ns`                                                                                                                                                   |
| `remove-component --view --definition` | Remove first match                                                   | `--all`                                                                                                                                                                       |
| `validate`                             | Lint; exit 1 on errors                                               | `--lwc-dir --skip-lwc-check --verbose` (lists items lacking `contentKey`)                                                                                                     |
| `uuid --seed`                          | Print a deterministic id                                             | `--bundle --ns`                                                                                                                                                               |

Project discovery: finds `sfdx-project.json` upward, scans **all** `packageDirectories` for bundles and LWCs, and uses the project `namespace` (else `c`) as the component prefix. Only the project's own components are validated; platform and managed-package components are ignored. The env var `LWR_SITE_UUID_NS` sets the id namespace for CI/team consistency. Files are written UTF-8 in Salesforce's `"key" : value` style, and `contentKey`s are never altered.

---

## Related skills (if available in your setup)

- **experience-cloud-development**: LWC patterns for sites (navigation, data, accessibility, guest security).
- **salesforce-deployment**: package.xml construction and general deploy mechanics.
- **jest**: LWC unit tests (add the `moduleNameMapper` entries from §8).
