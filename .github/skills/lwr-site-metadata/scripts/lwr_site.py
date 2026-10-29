#!/usr/bin/env python3
"""
LWR site (DigitalExperienceBundle) helper for source-format Salesforce projects.

Subcommands
  uuid               Print a deterministic UUID v5 for a seed.
  new-page           Scaffold a custom page (route + view), copying structure from an existing view.
  add-component      Insert an LWC into a region of a view or theme layout.
  replace-component  Swap one component definition for another (new id).
  remove-component   Remove component(s) by definition.
  validate           Lint a bundle: ids, sectionConfig, routes<->views, LWC references.
  inspect            Summarize a site: network, URL prefix, theme layouts, regions, pages.

Works in any SFDX project: the project root, package directories, namespace,
bundle(s), and LWCs are discovered from sfdx-project.json. --bundle-dir can be
omitted when the project contains exactly one site bundle (or pass --bundle NAME).

IDs are generated with UUID v5 (namespace + human-readable seed) so re-running a
command produces the same ids. The namespace defaults to one derived from the
bundle name; override with --ns or the LWR_SITE_UUID_NS environment variable to
share a namespace with other tooling (e.g. a CI page generator).

Standard library only. Python 3.8+.
"""
import argparse
import copy
import json
import os
import re
import sys
import uuid
import xml.etree.ElementTree as ET
from pathlib import Path

UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.I
)
MAX_ROUTE_TYPE = 50
RESERVED_PAGE_NAMES = {"home"}


# -- naming / ids -------------------------------------------------------------
def api_name(page_name: str) -> str:
    """Sanitize a page name into an API name (port of the middleware's fixApiName)."""
    s = page_name.strip()
    s = re.sub(r"^([0-9])", r"X\1", s)
    s = re.sub(r"(?:-|\s+)", "_", s)
    s = re.sub(r"[^A-Za-z0-9_]", "", s)
    s = re.sub(r"__+", "_", s)
    s = re.sub(r"([A-Za-z0-9])_+$", r"\1", s)
    return s


def route_type_for(slug: str) -> str:
    return f"custom-{slug.replace('-', '')}"[:MAX_ROUTE_TYPE]


def namespace_for(bundle_name: str, override: str = None) -> uuid.UUID:
    override = override or os.environ.get("LWR_SITE_UUID_NS")
    if override:
        return uuid.UUID(override)
    return uuid.uuid5(uuid.NAMESPACE_URL, f"lwr-site:{bundle_name}")


def det_id(ns: uuid.UUID, seed: str) -> str:
    return str(uuid.uuid5(ns, seed))


# -- json io ------------------------------------------------------------------
def load(path: Path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def save(path: Path, obj) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        # Salesforce writes `"key" : value`; matching it keeps diffs smaller.
        fh.write(json.dumps(obj, indent=2, separators=(",", " : "), ensure_ascii=False))
        fh.write("\n")


def walk(node, parent=None):
    """Yield (node, parent) for every dict in the component tree."""
    if isinstance(node, dict):
        yield node, parent
        for child in node.get("children", []) or []:
            yield from walk(child, node)
    elif isinstance(node, list):
        for item in node:
            yield from walk(item, parent)


def tree_root(doc):
    return doc.get("contentBody", {}).get("component")


def all_ids(doc):
    return [n["id"] for n, _ in walk(tree_root(doc)) if "id" in n]


def bundle_dir_of(path: Path) -> Path:
    for parent in [path] + list(path.parents):
        if parent.parent.name == "site" and parent.parent.parent.name == "digitalExperiences":
            return parent
    raise SystemExit(f"Could not find the bundle folder above {path}")


def item_api_name(content_path: Path) -> str:
    meta = content_path.parent / "_meta.json"
    if meta.exists():
        return load(meta).get("apiName", content_path.parent.name)
    return content_path.parent.name


# -- project discovery --------------------------------------------------------
class Project:
    """sfdx-project.json context: root, package dirs, namespace prefix, LWCs, bundles."""

    def __init__(self, start: Path):
        start = start.resolve()
        self.root = next(
            (d for d in [start] + list(start.parents) if (d / "sfdx-project.json").exists()),
            None,
        )
        config = load(self.root / "sfdx-project.json") if self.root else {}
        self.namespace = (config.get("namespace") or "").strip()
        dirs = [pkg.get("path") for pkg in config.get("packageDirectories", []) if pkg.get("path")]
        base = self.root or start
        self.package_dirs = [base / d for d in dirs] or [base]
        self._lwcs = None

    @property
    def prefix(self) -> str:
        """Definition prefix for this project's own LWCs in site JSON."""
        return self.namespace or "c"

    def lwcs(self) -> dict:
        if self._lwcs is None:
            self._lwcs = {}
            for pkg in self.package_dirs:
                for meta in pkg.glob("**/lwc/*/*.js-meta.xml"):
                    if meta.parent.name == meta.name[: -len(".js-meta.xml")]:
                        self._lwcs.setdefault(meta.parent.name, meta)
        return self._lwcs

    def bundles(self) -> list:
        found = []
        for pkg in self.package_dirs:
            found += [d for d in pkg.glob("**/digitalExperiences/site/*") if d.is_dir()]
        return sorted(set(found))


def resolve_bundle(args) -> Path:
    if getattr(args, "bundle_dir", None):
        bundle = Path(args.bundle_dir)
        if not (bundle / "sfdc_cms__route").is_dir() and not (bundle / "sfdc_cms__view").is_dir():
            raise SystemExit(f"{bundle} is not a DigitalExperienceBundle site folder")
        return bundle
    project = Project(Path.cwd())
    bundles = project.bundles()
    wanted = getattr(args, "bundle", None)
    if wanted:
        bundles = [b for b in bundles if b.name == wanted]
    if len(bundles) == 1:
        return bundles[0]
    if not bundles:
        legacy = []
        for pkg in project.package_dirs:
            legacy += [d.name for d in pkg.glob("**/experiences/*") if d.is_dir()]
        hint = (
            f" Found ExperienceBundle folders {legacy}: those sites are NOT enhanced LWR "
            "(DigitalExperienceBundle) sites and are out of scope for this tool."
            if legacy
            else (
                "\nNext steps (SKILL.md section 0, 'No site in the project'):"
                "\n  1. List enhanced LWR sites in the org:"
                "\n       sf org list metadata --metadata-type DigitalExperienceBundle --target-org <alias>"
                "\n  2. Site exists: ask the user which one, then retrieve it:"
                '\n       sf project retrieve start --metadata "DigitalExperienceBundle:site/<Bundle>" --target-org <alias>'
                "\n  3. No site: explain how to create one (Setup > Digital Experiences > New, or"
                "\n     `sf community create`) and ask before creating anything in the org."
            )
        )
        raise SystemExit("No DigitalExperienceBundle site found in this project." + hint)
    names = ", ".join(b.name for b in bundles)
    raise SystemExit(f"Several site bundles found ({names}); pass --bundle NAME or --bundle-dir PATH")


def theme_layouts(bundle: Path) -> dict:
    """layoutType -> layoutId, from sfdc_cms__theme/*/content.json."""
    mapping = {}
    for theme in (bundle / "sfdc_cms__theme").glob("*/content.json"):
        for layout in load(theme).get("contentBody", {}).get("layouts", []) or []:
            if layout.get("layoutType"):
                mapping.setdefault(layout["layoutType"], layout.get("layoutId"))
    return mapping


def default_theme_layout(bundle: Path) -> str:
    """Layout used by existing custom pages, else the home page's, else 'Inner', else first defined."""
    counts, home_layout = {}, None
    for view in (bundle / "sfdc_cms__view").glob("*/content.json"):
        body = load(view).get("contentBody", {})
        layout = body.get("themeLayoutType")
        if not layout:
            continue
        if str(body.get("viewType", "")).startswith("custom-"):
            counts[layout] = counts.get(layout, 0) + 1
        elif body.get("viewType") == "home":
            home_layout = layout
    if counts:
        return max(counts, key=counts.get)
    if home_layout:
        return home_layout
    layouts = theme_layouts(bundle)
    if "Inner" in layouts or not layouts:
        return "Inner"
    return next(iter(layouts))


# -- component helpers --------------------------------------------------------
def parse_component_spec(spec: str, prefix: str = "c"):
    """'c:myHero' or 'myCard={"title":"Hi"}' -> (definition, attrs). Bare names get the project prefix."""
    definition, _, attrs = spec.partition("=")
    definition = definition.strip()
    if ":" not in definition:
        definition = f"{prefix}:{definition}"
    return definition, (json.loads(attrs) if attrs else {})


def unique_component_id(ns, doc, seed_base: str) -> str:
    taken = set(all_ids(doc))
    n = 0
    while True:
        candidate = det_id(ns, f"{seed_base}-{n}")
        if candidate not in taken:
            return candidate
        n += 1


def make_component(cid: str, definition: str, attrs: dict) -> dict:
    return {"attributes": attrs, "definition": definition, "id": cid, "type": "component"}


def find_region(doc, region_name: str, region_id: str = None):
    matches = [
        n
        for n, _ in walk(tree_root(doc))
        if n.get("type") == "region"
        and (n.get("id") == region_id if region_id else n.get("name") == region_name)
    ]
    if not matches:
        names = sorted({n.get("name") for n, _ in walk(tree_root(doc)) if n.get("type") == "region"})
        raise SystemExit(f"Region '{region_id or region_name}' not found. Regions: {', '.join(names)}")
    if len(matches) > 1:
        ids = ", ".join(m["id"] for m in matches)
        raise SystemExit(f"Region name '{region_name}' is ambiguous; pass --region-id ({ids})")
    return matches[0]


# -- commands -----------------------------------------------------------------
def cmd_uuid(args):
    print(det_id(namespace_for(args.bundle or "", args.ns), args.seed))


def builtin_view(ns, view_api, title, components, seo_title, description, flush, theme_layout, route_type, slug):
    """Build-Your-Own (LWR) skeleton; used only when the site has no page to copy structure from."""
    section_id = det_id(ns, f"{view_api}-layout")
    column_id = det_id(ns, f"{view_api}-body")

    section_config = {
        "UUID": section_id,
        "columns": [
            {
                "UUID": column_id,
                "columnName": "Column 1",
                "columnKey": "col1",
                "columnWidth": "12",
                "seedComponents": [],
            }
        ],
    }
    spacing = "0rem" if flush else ""
    view = {
        "type": "sfdc_cms__view",
        "title": title,
        "contentBody": {
            "component": {
                "children": [
                    {
                        "children": [
                            {
                                "attributes": {
                                    "backgroundImageConfig": "",
                                    "backgroundImageOverlay": "rgba(0,0,0,0)",
                                    "componentSpacerSize": spacing,
                                    "layoutDirectionDesktop": "row",
                                    "layoutDirectionMobile": "column",
                                    "layoutDirectionTablet": "column",
                                    "maxContentWidth": "",
                                    "sectionColumnGutterWidth": spacing,
                                    "sectionConfig": json.dumps(section_config, separators=(",", ":")),
                                    "sectionMinHeight": "",
                                    "sectionVerticalAlign": "flex-start",
                                },
                                "children": [
                                    {
                                        "children": components,
                                        "id": column_id,
                                        "name": "col1",
                                        "title": "Column 1",
                                        "type": "region",
                                    }
                                ],
                                "definition": "community_layout:section",
                                "id": section_id,
                                "type": "component",
                            }
                        ],
                        "id": det_id(ns, f"{view_api}-region"),
                        "name": "content",
                        "title": "Content",
                        "type": "region",
                    },
                    {
                        "children": [
                            {
                                "attributes": {
                                    "customHeadTags": "",
                                    "description": description or "",
                                    "pageTitle": seo_title or title,
                                    "recordId": "{!recordId}",
                                },
                                "definition": "community_builder:seoAssistant",
                                "id": det_id(ns, f"{view_api}-seo"),
                                "type": "component",
                            }
                        ],
                        "id": det_id(ns, f"{view_api}-hidden-region"),
                        "name": "sfdcHiddenRegion",
                        "title": "sfdcHiddenRegion",
                        "type": "region",
                    },
                ],
                "definition": "community_layout:sldsFlexibleLayout",
                "id": det_id(ns, f"{view_api}-top-layout"),
                "type": "component",
            },
            "dataProviders": [],
            "themeLayoutType": theme_layout,
            "viewType": route_type,
        },
        "urlName": slug,
    }
    return view


def own_component(node, project) -> bool:
    return node.get("type") == "component" and bool(own_lwc_name(node.get("definition", ""), project))


def cloned_view(source, project, ns, view_api, title, components, seo_title, description, flush, theme_layout, route_type, slug):
    """Copy the platform structure of an existing view (any template), dropping the project's own components."""
    tree = copy.deepcopy(tree_root(source))

    # Target region: where the source page keeps its own components; else the first column-like region.
    target = None
    for node, parent in walk(tree):
        if own_component(node, project) and parent is not None and parent.get("type") == "region":
            target = parent
            break
    if target is None:
        regions = [n for n, _ in walk(tree) if n.get("type") == "region" and n.get("name") != "sfdcHiddenRegion"]
        leaves = [r for r in regions if not any(c.get("type") == "component" and c.get("children") for c in r.get("children", []))]
        target = leaves[0] if leaves else None
    if target is None:
        return None

    # Keep only the chain of containers leading to the target region; empty sibling columns; drop own components.
    path = []

    def find_path(node, trail):
        if node is target:
            path.extend(trail + [node])
            return True
        return any(find_path(child, trail + [node]) for child in node.get("children", []) or [] if isinstance(child, dict))

    find_path(tree, [])
    on_path = {id(n) for n in path}

    def prune(node):
        kids = node.get("children")
        if not isinstance(kids, list):
            return
        if node is target:
            node["children"] = []
            return
        kept = []
        for child in kids:
            if not isinstance(child, dict) or own_component(child, project):
                continue
            if node.get("type") == "region" and id(node) in on_path and child.get("type") == "component" and id(child) not in on_path:
                continue  # sibling components alongside the path (other sections/widgets)
            if (
                node is not tree  # root regions (e.g. the hidden SEO region) keep their platform components
                and node.get("type") == "component"
                and id(node) in on_path
                and child.get("type") == "region"
                and id(child) not in on_path
            ):
                child["children"] = []  # sibling columns of the target stay but are emptied
            kept.append(child)
            prune(child)
        node["children"] = kept

    prune(tree)
    target["children"] = components

    # Fresh deterministic ids; remap references embedded in attribute strings (e.g. sectionConfig).
    id_map, counter = {}, {}
    for node, _ in walk(tree):
        old = node.get("id")
        if old and node not in components:
            role = node.get("definition") or node.get("name") or node.get("type")
            counter[role] = counter.get(role, -1) + 1
            id_map[old] = det_id(ns, f"{view_api}-{role}-{counter[role]}")
            node["id"] = id_map[old]
    for node, _ in walk(tree):
        attrs = node.get("attributes")
        if isinstance(attrs, dict):
            for key, value in attrs.items():
                if isinstance(value, str):
                    for old, new in id_map.items():
                        value = value.replace(old, new)
                    attrs[key] = value
            if str(node.get("definition", "")).endswith(":seoAssistant"):
                attrs.update({"pageTitle": seo_title or title, "description": description or "", "customHeadTags": ""})
            if flush:
                for key in ("componentSpacerSize", "sectionColumnGutterWidth"):
                    if key in attrs:
                        attrs[key] = "0rem"

    body = {k: v for k, v in source.get("contentBody", {}).items() if k not in ("component",)}
    body.update({"component": tree, "dataProviders": [], "themeLayoutType": theme_layout, "viewType": route_type})
    return {"type": "sfdc_cms__view", "title": title, "contentBody": body, "urlName": slug}


def skeleton_source(bundle: Path, like: str):
    """(name, view json) to copy structure from: --like VIEW, else home; None -> built-in skeleton."""
    if like == "builtin":
        return None
    name = like or "home"
    path = bundle / "sfdc_cms__view" / name / "content.json"
    if path.exists():
        return name, load(path)
    if like:
        raise SystemExit(f"--like: no view '{like}' in {bundle / 'sfdc_cms__view'}")
    return None


def cmd_new_page(args):
    bundle = resolve_bundle(args)
    project = Project(bundle)
    layouts = theme_layouts(bundle)
    theme_layout = args.theme_layout or default_theme_layout(bundle)
    if layouts and theme_layout not in layouts:
        raise SystemExit(
            f"themeLayoutType '{theme_layout}' is not defined by the site theme. Available: {', '.join(layouts)}"
        )
    view_api = api_name(args.name)
    if view_api.lower() in RESERVED_PAGE_NAMES:
        raise SystemExit("The Home page already exists in every site; edit sfdc_cms__view/home instead.")
    route_api = f"{view_api}__c"
    slug = args.slug.strip("/")
    title = args.title or args.name
    route_type = route_type_for(slug)
    route_dir = bundle / "sfdc_cms__route" / route_api
    view_dir = bundle / "sfdc_cms__view" / view_api

    for existing in (bundle / "sfdc_cms__route").glob("*/content.json"):
        body = load(existing).get("contentBody", {})
        if body.get("urlPrefix") == slug and existing.parent != route_dir:
            raise SystemExit(f"urlPrefix '{slug}' is already used by {existing.parent.name}")
        if body.get("routeType") == route_type and existing.parent != route_dir:
            raise SystemExit(f"routeType '{route_type}' is already used by {existing.parent.name}")
    if (route_dir.exists() or view_dir.exists()) and not args.force:
        raise SystemExit(f"{route_api} / {view_api} already exist (use --force to regenerate)")

    ns = namespace_for(bundle.name, args.ns)
    components = []
    for index, spec in enumerate(args.component or []):
        definition, attrs = parse_component_spec(spec, project.prefix)
        components.append(
            make_component(det_id(ns, f"{view_api}-cmp-{index}-{definition}"), definition, attrs)
        )
    common = dict(
        ns=ns, view_api=view_api, title=title, components=components, seo_title=args.seo_title,
        description=args.description, flush=args.flush, theme_layout=theme_layout,
        route_type=route_type, slug=slug,
    )
    source = skeleton_source(bundle, args.like)
    view = cloned_view(source[1], project, **common) if source else None
    skeleton = f"structure copied from view '{source[0]}'" if view else "built-in Build Your Own (LWR) skeleton"
    if view is None:
        view = builtin_view(**common)
    route = {
        "type": "sfdc_cms__route",
        "title": title,
        "contentBody": {
            "activeViewId": view_api,
            "configurationTags": [],
            "pageAccess": args.page_access,
            "routeType": route_type,
            "urlPrefix": slug,
        },
        "urlName": slug,
    }
    route_meta = {"apiName": route_api, "type": "sfdc_cms__route", "path": "routes"}
    if args.parent:
        route_meta["parentId"] = f"sfdc_cms__route/{api_name(args.parent)}__c"
    view_meta = {"apiName": view_api, "type": "sfdc_cms__view", "path": "views"}

    # Preserve org-assigned contentKeys when regenerating an existing page.
    for meta_obj, meta_path in ((route_meta, route_dir / "_meta.json"), (view_meta, view_dir / "_meta.json")):
        if meta_path.exists() and "contentKey" in load(meta_path):
            meta_obj["contentKey"] = load(meta_path)["contentKey"]

    save(route_dir / "content.json", route)
    save(route_dir / "_meta.json", route_meta)
    save(view_dir / "content.json", view)
    save(view_dir / "_meta.json", view_meta)
    print(f"Created route {route_api} and view {view_api} (/{slug}, {route_type}, layout {theme_layout}; {skeleton})")
    print("Deploy members:")
    print(f"  DigitalExperience:site/{bundle.name}.sfdc_cms__route/{route_api}")
    print(f"  DigitalExperience:site/{bundle.name}.sfdc_cms__view/{view_api}")


def cmd_add_component(args):
    path = Path(args.view)
    doc = load(path)
    ns = namespace_for(bundle_dir_of(path).name, args.ns)
    definition, attrs = parse_component_spec(args.definition, Project(path).prefix)
    if args.attrs:
        attrs.update(json.loads(args.attrs))
    region = find_region(doc, args.region, args.region_id)
    seed = args.seed or f"{item_api_name(path)}-{definition}"
    cid = str(uuid.uuid4()) if args.random else unique_component_id(ns, doc, seed)
    children = region.setdefault("children", [])
    position = len(children) if args.position is None else max(0, min(args.position, len(children)))
    children.insert(position, make_component(cid, definition, attrs))
    save(path, doc)
    print(f"Added {definition} ({cid}) to region '{region.get('name')}' at position {position}")


def cmd_replace_component(args):
    path = Path(args.view)
    doc = load(path)
    ns = namespace_for(bundle_dir_of(path).name, args.ns)
    prefix = Project(path).prefix
    old_def, _ = parse_component_spec(args.old, prefix)
    new_def, new_attrs = parse_component_spec(args.new, prefix)
    if args.attrs:
        new_attrs.update(json.loads(args.attrs))
    replaced = 0
    for node, _ in walk(tree_root(doc)):
        if node.get("type") == "component" and node.get("definition") == old_def:
            node["definition"] = new_def
            node["attributes"] = node.get("attributes", {}) if args.keep_attrs else dict(new_attrs)
            # A different component definition is a new placement: give it a new id.
            node["id"] = unique_component_id(ns, doc, f"{item_api_name(path)}-{new_def}")
            replaced += 1
    if not replaced:
        raise SystemExit(f"No component with definition {old_def} in {path}")
    save(path, doc)
    print(f"Replaced {replaced} x {old_def} -> {new_def}")


def cmd_remove_component(args):
    path = Path(args.view)
    doc = load(path)
    target, _ = parse_component_spec(args.definition, Project(path).prefix)
    removed = 0
    for node, _ in list(walk(tree_root(doc))):
        kids = node.get("children")
        if not isinstance(kids, list):
            continue
        keep = []
        for kid in kids:
            is_match = isinstance(kid, dict) and kid.get("definition") == target
            if is_match and (args.all or removed == 0):
                removed += 1
                continue
            keep.append(kid)
        node["children"] = keep
    if not removed:
        raise SystemExit(f"No component with definition {target} in {path}")
    save(path, doc)
    print(f"Removed {removed} x {target}")


def lwc_info(meta: Path):
    ns = {"m": "http://soap.sforce.com/2006/04/metadata"}
    root = ET.parse(meta).getroot()
    exposed = (root.findtext("m:isExposed", default="false", namespaces=ns) or "").strip() == "true"
    targets = {t.text.strip() for t in root.findall("m:targets/m:target", ns) if t.text}
    return {"exposed": exposed, "targets": targets}


def own_lwc_name(definition: str, project: "Project"):
    """Return the LWC name if `definition` refers to one of this project's components."""
    prefix, _, name = definition.partition(":")
    return name if name and prefix in {"c", project.prefix} else None


def cmd_validate(args):
    bundle = resolve_bundle(args)
    project = Project(bundle)
    if args.lwc_dir:
        lwcs = {d.name: d / f"{d.name}.js-meta.xml" for d in Path(args.lwc_dir).iterdir() if d.is_dir()}
    else:
        lwcs = project.lwcs()
    check_lwcs = bool(lwcs) and not args.skip_lwc_check
    layouts = theme_layouts(bundle)
    errors, warnings = [], []
    seen_ids = {}

    views = {p.parent.name: p for p in (bundle / "sfdc_cms__view").glob("*/content.json")}
    layout_files = list((bundle / "sfdc_cms__themeLayout").glob("*/content.json"))

    for folder in sorted(d for d in bundle.glob("sfdc_cms__*/*") if d.is_dir()):
        meta = folder / "_meta.json"
        if meta.exists():
            m = load(meta)
            if m.get("apiName") != folder.name:
                errors.append(f"{folder.relative_to(bundle)}: _meta.json apiName '{m.get('apiName')}' != folder name")
            if "contentKey" not in m and args.verbose:
                warnings.append(f"{folder.relative_to(bundle)}: no contentKey (new item; retrieve after first deploy)")

    url_prefixes = {}
    for route_path in sorted((bundle / "sfdc_cms__route").glob("*/content.json")):
        name = route_path.parent.name
        body = load(route_path).get("contentBody", {})
        view_name = body.get("activeViewId")
        if view_name not in views:
            errors.append(f"route {name}: activeViewId '{view_name}' has no sfdc_cms__view/{view_name}")
        else:
            view_type = load(views[view_name]).get("contentBody", {}).get("viewType")
            if view_type != body.get("routeType"):
                warnings.append(f"route {name}: routeType '{body.get('routeType')}' != view viewType '{view_type}'")
        prefix = body.get("urlPrefix")
        if prefix in url_prefixes and not body.get("routeType", "").startswith("managed-content"):
            errors.append(f"route {name}: urlPrefix '{prefix}' duplicates route {url_prefixes[prefix]}")
        url_prefixes.setdefault(prefix, name)
        if len(body.get("routeType", "")) > MAX_ROUTE_TYPE:
            errors.append(f"route {name}: routeType longer than {MAX_ROUTE_TYPE} characters")

    for content_path in list(views.values()) + layout_files:
        rel = content_path.parent.relative_to(bundle)
        doc = load(content_path)
        layout_type = doc.get("contentBody", {}).get("themeLayoutType")
        if layouts and layout_type and layout_type not in layouts:
            errors.append(f"{rel}: themeLayoutType '{layout_type}' is not defined by the site theme ({', '.join(layouts)})")
        local_ids = {}
        for node, _ in walk(tree_root(doc)):
            nid = node.get("id")
            if nid is not None:
                if not UUID_RE.match(nid):
                    errors.append(f"{rel}: id '{nid}' is not a UUID")
                if nid in local_ids:
                    errors.append(f"{rel}: duplicate id {nid}")
                local_ids[nid] = node
                seen_ids.setdefault(nid, set()).add(str(rel))
            definition = node.get("definition", "")
            if definition == "community_layout:section":
                try:
                    cfg = json.loads(node.get("attributes", {}).get("sectionConfig", "{}"))
                except json.JSONDecodeError:
                    errors.append(f"{rel}: section {nid} has invalid sectionConfig JSON")
                    continue
                if cfg.get("UUID") != nid:
                    errors.append(f"{rel}: sectionConfig.UUID {cfg.get('UUID')} != section id {nid}")
                regions = {r.get("id"): r.get("name") for r in node.get("children", [])}
                columns = {c.get("UUID"): c.get("columnKey") for c in cfg.get("columns", [])}
                if set(regions) != set(columns):
                    errors.append(f"{rel}: section {nid} column UUIDs {sorted(columns)} != region ids {sorted(regions)}")
                for col_id, key in columns.items():
                    if col_id in regions and regions[col_id] != key:
                        errors.append(f"{rel}: column {col_id} columnKey '{key}' != region name '{regions[col_id]}'")
            elif check_lwcs and own_lwc_name(definition, project):
                lwc_name = own_lwc_name(definition, project)
                meta = lwcs.get(lwc_name) if lwc_name in lwcs else None
                info = lwc_info(meta) if meta and meta.exists() else None
                if info is None:
                    errors.append(f"{rel}: {definition} not found in the project's lwc folders")
                elif not info["exposed"]:
                    errors.append(f"{rel}: {definition} is not exposed (isExposed=false)")
                elif "lightningCommunity__Default" not in info["targets"]:
                    warnings.append(f"{rel}: {definition} lacks the lightningCommunity__Default target")

    for nid, where in seen_ids.items():
        if len(where) > 1:
            warnings.append(f"id {nid} is reused in {', '.join(sorted(where))}")

    for w in warnings:
        print(f"WARN  {w}")
    for e in errors:
        print(f"ERROR {e}")
    lwc_note = f"{len(lwcs)} project LWCs" if check_lwcs else "LWC references not checked"
    print(
        f"{bundle.name}: {len(views)} views, {len(layout_files)} theme layouts, {lwc_note}: "
        f"{len(errors)} error(s), {len(warnings)} warning(s)"
    )
    sys.exit(1 if errors else 0)


def find_network(project: Project, bundle_name: str):
    """Network (site) metadata whose <picassoSite> is this bundle -> (name, urlPathPrefix, status)."""
    ns = {"m": "http://soap.sforce.com/2006/04/metadata"}
    for pkg in project.package_dirs:
        for meta in pkg.glob("**/networks/*.network-meta.xml"):
            root = ET.parse(meta).getroot()
            if (root.findtext("m:picassoSite", default="", namespaces=ns) or "").strip() == bundle_name:
                name = meta.name[: -len(".network-meta.xml")]
                prefix = (root.findtext("m:urlPathPrefix", default="", namespaces=ns) or "").strip()
                status = (root.findtext("m:status", default="", namespaces=ns) or "").strip()
                return name, prefix, status
    return None


def regions_of(doc):
    return [
        n.get("name")
        for n, _ in walk(tree_root(doc))
        if n.get("type") == "region" and n.get("name") not in (None, "sfdcHiddenRegion")
    ]


def cmd_inspect(args):
    bundle = resolve_bundle(args)
    project = Project(bundle)
    print(f"Bundle:         {bundle.name}  ({bundle})")
    print(f"Project:        {project.root or '(no sfdx-project.json found)'}")
    print(f"LWC prefix:     {project.prefix}:  ({len(project.lwcs())} LWCs in package dirs)")
    network = find_network(project, bundle.name)
    if network:
        name, prefix, status = network
        live = prefix[: -len("vforcesite")] if prefix.endswith("vforcesite") else prefix
        print(f"Network name:   {name}   (use with: sf community publish --name \"{name}\")")
        print(f"URL prefix:     /{live}   (network urlPathPrefix '{prefix}'; status {status})")
    else:
        print("Network name:   (networks/*.network-meta.xml not in project; sf org list metadata --metadata-type Network)")

    print("\nTheme layouts (themeLayoutType -> layout: regions):")
    for layout_type, layout_id in theme_layouts(bundle).items():
        path = bundle / "sfdc_cms__themeLayout" / str(layout_id) / "content.json"
        regions = regions_of(load(path)) if path.exists() else ["(layout file not in project)"]
        print(f"  {layout_type:<20} -> {layout_id}: {', '.join(regions)}")
    print(f"  default for new pages: {default_theme_layout(bundle)}")

    views = {p.parent.name: load(p) for p in (bundle / "sfdc_cms__view").glob("*/content.json")}
    print("\nPages (route -> /urlPrefix -> view [layout, access]  components):")
    for route_path in sorted((bundle / "sfdc_cms__route").glob("*/content.json")):
        body = load(route_path).get("contentBody", {})
        view_name = body.get("activeViewId")
        view = views.get(view_name, {})
        defs = [
            n.get("definition")
            for n, _ in walk(tree_root(view))
            if n.get("type") == "component" and own_lwc_name(n.get("definition", ""), project)
        ]
        has_key = "contentKey" in load(route_path.parent / "_meta.json") if (route_path.parent / "_meta.json").exists() else False
        layout = view.get("contentBody", {}).get("themeLayoutType", "?")
        print(
            f"  {route_path.parent.name:<26} /{body.get('urlPrefix', ''):<22} {view_name} "
            f"[{layout}, {body.get('pageAccess')}{'' if has_key else ', no contentKey'}]  {', '.join(defs) or '-'}"
        )


# -- cli ----------------------------------------------------------------------
def add_bundle_args(parser):
    parser.add_argument("--bundle-dir", help="path to .../digitalExperiences/site/<Bundle> (auto-detected if omitted)")
    parser.add_argument("--bundle", help="bundle name when the project has several sites")


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("uuid", help="deterministic UUID v5 for a seed")
    s.add_argument("--seed", required=True)
    s.add_argument("--bundle", help="bundle name used to derive the default namespace")
    s.add_argument("--ns", help="explicit namespace UUID")
    s.set_defaults(func=cmd_uuid)

    s = sub.add_parser("new-page", help="scaffold a custom page (route + view)")
    add_bundle_args(s)
    s.add_argument("--name", required=True, help="page name, e.g. 'Our Approach'")
    s.add_argument("--slug", required=True, help="urlPrefix, e.g. approach")
    s.add_argument("--title", help="page title in Builder (defaults to --name)")
    s.add_argument("--seo-title", help="SEO <title> (defaults to title)")
    s.add_argument("--description", help="SEO meta description")
    s.add_argument("--parent", help="parent page name for nested URLs")
    s.add_argument("--page-access", default="UseParent", choices=["UseParent", "Public", "RequiresLogin"])
    s.add_argument("--theme-layout", help="themeLayoutType (default: what existing custom pages use; see `inspect`)")
    s.add_argument("--component", action="append", help='repeatable: myHero, c:myHero or c:myCard={"prop":"v"}')
    s.add_argument("--flush", action="store_true", help="0rem spacer/gutter for edge-to-edge sections")
    s.add_argument("--like", help="view to copy page structure from (default: home; 'builtin' = BYO skeleton)")
    s.add_argument("--ns", help="namespace UUID override")
    s.add_argument("--force", action="store_true", help="regenerate existing page (keeps contentKeys)")
    s.set_defaults(func=cmd_new_page)

    s = sub.add_parser("add-component", help="insert a component into a region")
    s.add_argument("--view", required=True, help="path to a view or themeLayout content.json")
    s.add_argument("--definition", required=True, help='myFaq, c:myFaq or c:myCard={"prop":"v"}')
    s.add_argument("--attrs", help="JSON object of @api property values")
    s.add_argument("--region", default="col1", help="region name (default col1)")
    s.add_argument("--region-id", help="region id when names are ambiguous")
    s.add_argument("--position", type=int, help="0-based insert index (default: append)")
    s.add_argument("--seed", help="seed for the deterministic id")
    s.add_argument("--random", action="store_true", help="use a random UUID v4 instead")
    s.add_argument("--ns", help="namespace UUID override")
    s.set_defaults(func=cmd_add_component)

    s = sub.add_parser("replace-component", help="swap a component definition (new id)")
    s.add_argument("--view", required=True)
    s.add_argument("--old", required=True)
    s.add_argument("--new", required=True)
    s.add_argument("--attrs", help="JSON object of @api property values for the new component")
    s.add_argument("--keep-attrs", action="store_true", help="carry over existing attributes")
    s.add_argument("--ns", help="namespace UUID override")
    s.set_defaults(func=cmd_replace_component)

    s = sub.add_parser("remove-component", help="remove a component by definition")
    s.add_argument("--view", required=True)
    s.add_argument("--definition", required=True)
    s.add_argument("--all", action="store_true", help="remove every match (default: first)")
    s.set_defaults(func=cmd_remove_component)

    s = sub.add_parser("validate", help="lint a site bundle")
    add_bundle_args(s)
    s.add_argument("--lwc-dir", help="restrict LWC lookup to one folder (default: all package dirs)")
    s.add_argument("--skip-lwc-check", action="store_true", help="don't verify c: component references")
    s.add_argument("--verbose", action="store_true", help="also report items without contentKey")
    s.set_defaults(func=cmd_validate)

    s = sub.add_parser("inspect", help="summarize a site bundle (start here in a new project)")
    add_bundle_args(s)
    s.set_defaults(func=cmd_inspect)

    args = p.parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
