import json
from typing import Any
from data import COMPONENT_SCHEMAS, MOCK_DATA


def describe_data(data_context: dict) -> str:
    """
    Generate a natural language description of the data schema for the LLM.
    Shows the exact data-source strings to use and the structure of each.
    """
    lines = []

    def describe_type(v: Any) -> str:
        """Get a descriptive type string, including nested array contents."""
        if isinstance(v, list):
            if len(v) > 0 and isinstance(v[0], dict):
                nested_fields = list(v[0].keys())[:6]
                return f"array[{{{', '.join(nested_fields)}}}]"
            elif len(v) > 0:
                return f"array[{type(v[0]).__name__}]"
            return "array"
        return type(v).__name__

    for namespace, data in data_context.items():
        lines.append(f"{namespace}:")

        for key, value in data.items():
            source = f"{namespace}::{key}"

            if isinstance(value, list):
                if len(value) > 0:
                    sample = value[0]
                    if isinstance(sample, dict):
                        field_types = [f"{k}: {describe_type(v)}" for k, v in sample.items()]
                        lines.append(f"  {source} (array of {len(value)}) - {{{', '.join(field_types)}}}")
                        items = [f"{k}={repr(v)[:30]}" for k, v in list(sample.items())[:8]]
                        lines.append(f"    [0]: {{{', '.join(items)}}}")

                        for field_name, field_value in sample.items():
                            if isinstance(field_value, list) and len(field_value) > 0 and isinstance(field_value[0], dict):
                                nested_example = [f"{k}={repr(v)[:25]}" for k, v in list(field_value[0].items())[:6]]
                                lines.append(f"      {field_name}[0]: {{{', '.join(nested_example)}}}")
                    else:
                        lines.append(f"  {source} (array of {len(value)} {type(sample).__name__}s)")
                        lines.append(f"    [0]: {repr(value[0])[:50]}")
                else:
                    lines.append(f"  {source} (empty array)")

            elif isinstance(value, dict):
                field_types = [f"{k}: {describe_type(v)}" for k, v in value.items()]
                lines.append(f"  {source} (object) - {{{', '.join(field_types)}}}")
                items = [f"{k}={repr(v)[:30]}" for k, v in list(value.items())[:6]]
                lines.append(f"    example: {{{', '.join(items)}}}")

            else:
                lines.append(f"  {source} ({type(value).__name__}) = {repr(value)}")

        lines.append("")

    return "\n".join(lines)


def get_available_sources() -> list[str]:
    sources = []
    for namespace, data in MOCK_DATA.items():
        for key in data.keys():
            sources.append(f"{namespace}::{key}")
    return sources


def get_component_rules() -> str:
    """Shared component rules for all UI generation endpoints"""
    return f"""## Color & Theming Philosophy

**The app has a theme system, but you can break rules for visual impact.**

**Base colors (use for structure):**
- Background: `bg-background`, Cards: `bg-card`, Text: `text-foreground`/`text-muted-foreground`
- CRITICAL: ALWAYS use `text-foreground` for main text to ensure visibility across all themes (tokyo-night, impact, elegant, neobrutalism)

**Accent colors (use for drama):**
- Add explicit colors ON TOP for visual hierarchy: `bg-violet-500/10`, `border-emerald-500/30`, `shadow-rose-500/20`
- Gradients for emphasis: `bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20`

**80/20 Rule:** 80% semantic (themeable) + 20% explicit accents (visual drama).
Don't be boring - use accents liberally for hero sections, featured components, and emphasis.

## How Data Binding Works

The frontend has a component registry that renders data. You place containers; the system fills them.

### Data Source Format
Data sources use the format `namespace::path` where path can include array indices and property access.

**VALID examples:**
- `namespace::items` - references the items array
- `namespace::items[0].details` - first item's details array
- `namespace::items[0].count` - first item's count value
- `namespace::total` - references a single value

Use array indexing `[0]` and dot notation `.field` to access nested data.

### Single Values: data-value
For **ONLY** primitive values (numbers, strings, booleans). The element's textContent gets replaced with the actual value.

**CRITICAL RULES:**
- data-value is ONLY for single primitive values (numbers, strings, booleans)
- NEVER use non-existent attributes like data-transform, data-format, etc.
- **Fallback behavior**: If you accidentally use data-value with an array, it will display the array length (not ideal, but won't break)
- **Prefer explicit counts**: If the backend provides a count field (like `total_songs: 10`), use that instead

```html
<p class="text-8xl font-black text-white">
  <data-value data-source="namespace::total_value"></data-value>
</p>
<p class="text-muted-foreground">
  <data-value data-source="namespace::count"></data-value> items completed
</p>
```

Fallback example (if namespace::items is an array, this shows its length):
```html
<p><data-value data-source="namespace::items"></data-value> items</p>
```

### Arrays/Objects: component-slot
For lists, charts, grids, tables. The registry looks up the component type and renders with the data.

List example (map array fields to display template):
```html
<component-slot
  type="List"
  data-source="namespace::items"
  config='{{"template":{{"primary":"name","secondary":"description"}}}}'
  click-prompt="Show detailed breakdown and related items"
></component-slot>
```

Chart example (ONLY for arrays of objects with numeric fields):
```html
<component-slot
  type="Chart"
  data-source="fitness::by_type"
  config='{{"template":{{"x":"type","y":"calories","primary":"Calories by Workout"}},"layout":"bar"}}'
  click-prompt="Break down this workout type - show trends over time and personal records"
></component-slot>
```

Grid example (side-by-side items):
```html
<component-slot
  type="Grid"
  data-source="namespace::items"
  config='{{"template":{{"title":"item_name","subtitle":"category"}},"columns":3}}'
  click-prompt="Show detailed item information"
></component-slot>
```
The template maps YOUR data fields to Grid's display. Check the data context for actual field names.

Timeline example (ONLY for chronological/dated events):
```html
<component-slot
  type="Timeline"
  data-source="namespace::events"
  config='{{"template":{{"title":"event_name","description":"location","timestamp":"date"}},"orientation":"vertical"}}'
  click-prompt="Show event details"
></component-slot>
```
The template maps YOUR data fields to Timeline's display. Always check the data context for actual field names.

Table example (tabular data with multiple columns):
```html
<component-slot
  type="Table"
  data-source="namespace::items"
  config='{{"columns":[{{"key":"field_a","label":"Column A"}},{{"key":"field_b","label":"Column B","sortable":true}}]}}'
  click-prompt="Show detailed information"
></component-slot>
```
Columns define which fields to display. Check the data context for actual field names.

Vinyl example (music-only - visually striking, use for featured song/album):
```html
<component-slot
  type="Vinyl"
  data-source="namespace::items[0]"
  config='{{"template":{{"primary":"name","secondary":"category"}},"label":"Featured"}}'
  click-prompt="Show detailed analysis and related content"
></component-slot>
```

Calendar example (for events/activities with dates):
```html
<component-slot
  type="Calendar"
  data-source="namespace::dated_events"
  config='{{"template":{{"date":"event_date","description":"event_name"}}}}'
  click-prompt="Show event details for this date"
></component-slot>
```
Calendar needs dates in YYYY-MM-DD format. The template maps YOUR data fields to the calendar's display.

Clickable example (interactive buttons - ALWAYS use this, never raw button tags):
```html
<component-slot
  type="Clickable"
  config='{{"label":"View Details","class":"px-4 py-2 bg-primary text-primary-foreground rounded transition-colors"}}'
  click-prompt="Show detailed breakdown of this metric"
></component-slot>
```

The `config.template` maps the component's display fields to your data's field names. Check the data fields in the context to know what to map.

For interactive elements, add `click-prompt` describing what happens when clicked. Write from user perspective ("Show me...", "Dive into...", "Break down..."). Omit for non-interactive elements.

**CRITICAL RULES:**
- **For buttons/CTAs**: ALWAYS use the Clickable component. NEVER use raw `<button>` tags.
- **For music**: USE Vinyl component - it's visually prominent (limit 1 per view, takes significant space)
- **For dated events**: USE Calendar component when you have date fields - creates beautiful date-based layout
- **For ranked/ordered data**: USE List with `"layout":"ranked"` - numbered lists look great
- **For stats/metrics**: USE Card component with proper variant (metric/stat)

These components are BEAUTIFUL. Use them liberally - they make the UI feel premium and polished.

## Component Registry

{json.dumps(COMPONENT_SCHEMAS, indent=2)}

## Golden Rule: NO SYNTHETIC DATA

Never write literal values. If you write hardcoded numbers or names, you've broken the binding.

Wrong: `<p>87,234 items</p>`
Right: `<p><data-value data-source="namespace::total"></data-value> items</p>`

Wrong: `<span>Hardcoded Item Name</span>`
Right: Use a List component-slot with the array data-source

Wrong: `<data-value data-source="namespace::items" data-transform="length"></data-value>`
Right: `<data-value data-source="namespace::items"></data-value>` (will fallback to showing length)
Better: Backend provides explicit count like `namespace::item_count`

## Chart Component: Critical Rules

**Chart ONLY works with arrays of objects that have NUMERIC fields.**

✅ CORRECT Chart usage (data is array of objects with numeric fields):
```html
<component-slot type="Chart" data-source="fitness::by_type" 
  config='{{"template":{{"x":"type","y":"calories"}},"layout":"bar"}}'></component-slot>
```
Example data: `[{{"type": "Running", "calories": 12300}}, {{"type": "Cycling", "calories": 8400}}]`
The adapter maps `type` → label and `calories` → value for the chart.

❌ WRONG Chart usage (data is simple string array):
```html
<component-slot type="Chart" data-source="namespace::categories" 
  config='{{"template":{{"x":"category","y":"percentage"}}}}'></component-slot>
```
Example data: `["Category A", "Category B", "Category C"]` - No "category" or "percentage" fields!
This will FAIL because the data doesn't have the fields you're trying to map.

**If you have a simple array (strings, numbers, or simple objects), use List or Table instead.**

## Style Rules

- NEVER use fixed positioning (fixed) - layouts must be in flow
- NEVER use HTML comments in your output (no `<!-- comment -->`)
- AVOID borders on cards (no `border border-border`) - use subtle backgrounds and shadows instead
- Use Tailwind CSS classes available in the CDN (no custom CSS, no arbitrary values beyond standard Tailwind)
- Use semantic theme classes: bg-background, text-foreground, bg-card
- Sharp edges: rounded or rounded-sm only (never rounded-xl/2xl/3xl)"""


def build_planning_prompt(query: str) -> str:
    sources = get_available_sources()
    return f"""Analyze this query and plan the UI experience.

Query: "{query}"

Available data sources: {json.dumps(sources)}

Return JSON:
{{"sources": ["namespace::key", ...], "intent": "what the user wants to see/feel (1-2 sentences)", "approach": "how to present it memorably (1-2 sentences)"}}"""


def build_ui_system_prompt(intent: str, approach: str) -> str:
    return f"""You generate HTML for a mobile-first app screen that feels alive and engaging.

VERY IMPORTANT: Output ONLY raw HTML. No markdown. No code fences. No ```html.

## Vision
Intent: {intent}
Approach: {approach}

## Design Philosophy

Design like you're building a REAL product. Not a demo. Not a prototype. A shipped app that millions use.

Match the design to the data domain - let the content guide the aesthetics.

GO ABSOLUTELY WILD. Be creative. Be degen. Make it memorable.

This is NOT a boring dashboard. This is an experience. Think:
- Dramatic visual hierarchy that slaps
- Unexpected layouts that surprise
- Bold accent overlays that pop (violet, emerald, rose glows)
- Typography that makes a statement
- Animations and hover states everywhere
- The kind of UI that makes people screenshot and share

**Use the beautiful components:** Vinyl cards, ranked Lists, Charts, Calendar - they're designed to impress.

The ONLY rule: Don't make up data. Everything else is fair game.

## CRITICAL: Thematic Design

Make the UI feel like it LIVES in its domain. Don't just display data - create a vibe:

- **Sports**: Scoreboard energy, locker room aesthetics, stadium lights, crowd roar vibes. Make it feel like courtside seats.
- **Music**: Album art grids, vinyl spinning vibes, concert poster energy, equalizer aesthetics, late night listening mood
- **Stocks/Finance**: Bloomberg terminal energy, ticker tape chaos, green candles to the moon, trading floor vibes
- **Fitness**: Race bib aesthetics, finish line energy, sweat and glory vibes, personal records that hit different
- **Gaming**: Legendary reveals, arena battle energy, trophy case flex, competitive leaderboard vibes

A music screen should make you want to put on headphones. A sports screen should make you want to yell at the TV. A stocks screen should make you feel like a degen trader.

{get_component_rules()}

## Visual Language: Make It Alive

### Icons & Graphics
- NO emojis (they look unprofessional)
- YES to inline SVG icons (if you're confident in the syntax)
- Simple geometric shapes can add visual interest
- Use SVGs for arrows, check marks, stars, etc.

### Typography & Hierarchy
- Hero numbers: text-7xl to text-9xl font-black (make them impossible to ignore)
- Supporting text: text-xs uppercase tracking-widest text-muted-foreground
- Scale contrast is everything - tiny labels next to massive numbers
- Use text-foreground for main text, text-muted-foreground for secondary

### Animation & Motion (Tailwind)
Add life with subtle animations:
- hover:scale-[1.02] transition-transform duration-200 (cards that breathe)
- hover:bg-card/80 transition-colors (responsive feedback)
- hover:translate-x-1 (list items that nudge)
- animate-pulse on accent elements (subtle attention)
- group-hover:opacity-100 for reveal effects


### Containers & Layout  
- Cards: bg-card rounded p-6 (AVOID BORDERS - use subtle backgrounds instead)
- CRITICAL: Always add padding INSIDE cards (p-4 to p-6) - content should never touch edges
- Hover states: hover:bg-card/80 transition-colors
- Sections: Use grid/flex with gap-4 to gap-8
- Padding: p-4 to p-8 for sections, p-3 to p-6 for cards

### Spacing & Rhythm
- add generous vertical spacing between sections (e.g. mb-8)
- Between major sections use space-y-8 or individual mb-10 to mb-16
- Between related items: space-y-4 or mb-4 to mb-6
- Grid gaps: gap-6 for cards, gap-4 for smaller items
- Top-level wrapper: px-6 py-8 (generous padding around entire UI)
- Use margin-bottom liberally - cramped UI looks cheap and unprofessional
- Give content room to breathe - white space is good design

### Layout: Mobile-App Feel
- Full-bleed hero sections (no padding on top element)
- Generous vertical rhythm (space-y-6, mb-10)
- Asymmetric grids: col-span-2 next to col-span-1
- Bottom-anchored CTAs (fixed bottom-0 or mt-auto)
- Pull-to-refresh style top spacing

### Micro-interactions
Every interactive element should respond:
```html
<div class="group cursor-pointer bg-card p-4 rounded transition-all duration-200 hover:bg-card/80 hover:scale-[1.01] active:scale-[0.99]">
  <p class="text-foreground group-hover:text-primary transition-colors">...</p>
</div>
```

## What to Avoid

- Dashboard/SaaS aesthetic (boring grids, "Overview" headers)
- Static, lifeless cards with no hover states
- Equal spacing everywhere
- Centered everything
- Small, timid typography
- "Statistics", "Metrics", "Data" labels
- Filling every pixel - let it breathe

## Requirements

Must:
1. Start with `<div class="...">` - no html/head/body
2. Tailwind CSS CDN is loaded - use standard Tailwind classes (no custom CSS, no arbitrary values beyond what's in Tailwind CDN). Prefer semantic classes (bg-background, text-foreground, bg-card)
3. Use ALL data sources from context
4. Multiple component-slots (3-4+)
5. Animation/transition classes on interactive elements
6. Use Vinyl component for featured music items (limit 1 per view)
7. Use Calendar component for dated events/activities when appropriate

Must NOT:
- Write literal data values
- Use placeholder text
- Use image URLs
- Use emojis (but inline SVG icons are encouraged if you're confident!)
- Invent data sources
- Create static, hover-less layouts
- Use HTML comments (no `<!-- -->` in output)
- Use fixed or absolute positioning
- Replace semantic base colors (always use bg-background, bg-card as foundation)

## Full Example

```html
<div class="min-h-screen bg-background p-6">
  <div class="mb-12">
    <p class="text-xs uppercase tracking-widest text-muted-foreground mb-2">Overview</p>
    <p class="text-8xl font-black text-foreground leading-none">
      <data-value data-source="namespace::total_value"></data-value>
    </p>
    <p class="text-lg text-muted-foreground mt-1">items tracked</p>
  </div>

  <div class="grid grid-cols-3 gap-6 mb-8">
    <div class="col-span-2 bg-card p-5 rounded transition-all hover:bg-card/80">
      <p class="text-xs uppercase tracking-widest text-muted-foreground mb-4">Top Items</p>
      <component-slot
        type="List"
        data-source="namespace::items"
        config='{{"template":{{"primary":"name","secondary":"category","meta":"count"}},"layout":"ranked"}}'
        click-prompt="Show detailed breakdown and analysis"
      ></component-slot>
    </div>

    <div class="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 p-5 rounded shadow-lg">
      <component-slot
        type="Vinyl"
        data-source="namespace::items[0]"
        config='{{"template":{{"primary":"name","secondary":"category"}},"label":"Featured"}}'
        click-prompt="Show detailed analysis"
      ></component-slot>
    </div>
  </div>

  <component-slot
    type="Timeline"
    data-source="namespace::events"
    config='{{"template":{{"title":"name","description":"date"}}}}'
    click-prompt="Show event details"
  ></component-slot>
</div>
```

Note: Featured item uses gradient background for visual emphasis while maintaining semantic bg-card base.

Output raw HTML now."""


def build_ui_user_prompt(query: str, data_context: dict) -> str:
    data_description = describe_data(data_context)

    return f"""Query: {query}

Data Available:
{data_description}

Use data-source="namespace::key" to reference this data. The components will render the actual values - you never write them yourself.

Generate the HTML now."""


def build_refine_system_prompt(current_html: str) -> str:
    """System prompt for refining existing UI"""
    return f"""You're editing a live app screen. Make the requested changes while preserving data bindings.

VERY IMPORTANT: Output ONLY raw HTML. No markdown. No code fences. No ```html.

## Current Screen
{current_html}

{get_component_rules()}

## Visual Language: Make It Alive

### Icons & Graphics
- NO emojis (they look unprofessional)
- YES to inline SVG icons (if you're confident in the syntax)
- Simple geometric shapes can add visual interest
- Use SVGs for arrows, check marks, stars, etc.

### Typography & Hierarchy
- Hero numbers: text-7xl to text-9xl font-black (make them impossible to ignore)
- Supporting text: text-xs uppercase tracking-widest text-muted-foreground
- Scale contrast is everything - tiny labels next to massive numbers
- Use text-foreground for main text, text-muted-foreground for secondary

### Animation & Motion (Tailwind)
Add life with subtle animations:
- hover:scale-[1.02] transition-transform duration-200 (cards that breathe)
- hover:bg-card/80 transition-colors (responsive feedback)
- hover:translate-x-1 (list items that nudge)
- animate-pulse on accent elements (subtle attention)
- group-hover:opacity-100 for reveal effects


### Containers & Layout  
- Cards: bg-card rounded p-6 (AVOID BORDERS - use subtle backgrounds instead)
- CRITICAL: Always add padding INSIDE cards (p-4 to p-6) - content should never touch edges
- Hover states: hover:bg-card/80 transition-colors
- Sections: Use grid/flex with gap-4 to gap-8
- Padding: p-4 to p-8 for sections, p-3 to p-6 for cards

## Edit Rules
- Output raw HTML only (no markdown, code fences)
- Preserve all data-source bindings - move them, don't delete them
- Same data sources - never invent new ones
- Sharp edges only (rounded-sm or rounded, never rounded-xl/2xl/3xl)
- Use theme classes: bg-background, bg-card, text-foreground, text-muted-foreground

## What to Change
Respond to the user's edit request:
- Layout: rearrange, resize, change grid structure
- Style: colors, spacing, typography, accents
- Emphasis: scale up/down, reposition
- Flow: reorder the narrative, change the "hook"

## What to Keep
- All data-value and component-slot elements
- Data bindings intact (namespace::key references)
- The emotional intent unless explicitly changing it

Think: tweaking a shipped app, not rebuilding."""


def build_interact_system_prompt(clicked_item_desc: str, click_prompt: str, component_type: str) -> str:
    """System prompt for drill-down interaction views"""
    return f"""You're generating a drill-down detail view based on user interaction.

VERY IMPORTANT: Output ONLY raw HTML. No markdown. No code fences. No ```html.

## Interaction Context
The user clicked on a {component_type} component.
Instruction: {click_prompt}

## Clicked Item
{clicked_item_desc}

## Design Philosophy
Design like you're building a REAL product that millions use.

Create a focused detail view that expands on the clicked item with relevant context and related data.

GO WILD with this detail view. Make it the hyperfocus moment. The user clicked because they want MORE - give them an experience that makes them glad they clicked.

The ONLY rule: Don't make up data. Everything else is fair game.

## CRITICAL: Thematic Design
Make this detail view absolutely slap:
- Sports: Player card energy, stats that hit different, team pride vibes
- Music: Album deep dive, artist spotlight, listening session mood
- Stocks: Full degen trading view, candlestick chaos, position analysis energy
- Fitness: Race recap vibes, PR celebration, segment analysis heat
- Gaming: Legendary card showcase, battle replay energy, trophy flex

{get_component_rules()}

## Visual Language: Make It Alive

### Icons & Graphics
- NO emojis (they look unprofessional)
- YES to inline SVG icons (if you're confident in the syntax)
- Simple geometric shapes can add visual interest
- Use SVGs for arrows, check marks, stars, etc.

### Typography & Hierarchy
- Hero numbers: text-7xl to text-9xl font-black (make them impossible to ignore)
- Supporting text: text-xs uppercase tracking-widest text-muted-foreground
- Scale contrast is everything - tiny labels next to massive numbers
- Use text-foreground for main text, text-muted-foreground for secondary

### Animation & Motion (Tailwind)
Add life with subtle animations:
- hover:scale-[1.02] transition-transform duration-200 (cards that breathe)
- hover:bg-card/80 transition-colors (responsive feedback)
- hover:translate-x-1 (list items that nudge)
- animate-pulse on accent elements (subtle attention)
- group-hover:opacity-100 for reveal effects


### Containers & Layout  
- Cards: bg-card rounded p-6 (AVOID BORDERS - use subtle backgrounds instead)
- CRITICAL: Always add padding INSIDE cards (p-4 to p-6) - content should never touch edges
- Hover states: hover:bg-card/80 transition-colors
- Sections: Use grid/flex with gap-4 to gap-8
- Padding: p-4 to p-8 for sections, p-3 to p-6 for cards

### Spacing & Rhythm
- add generous vertical spacing between sections (e.g. mb-8)
- Between major sections use space-y-8 or individual mb-10 to mb-16
- Between related items: space-y-4 or mb-4 to mb-6
- Grid gaps: gap-6 for cards, gap-4 for smaller items
- Top-level wrapper: px-6 py-8 (generous padding around entire UI)
- Use margin-bottom liberally - cramped UI looks cheap and unprofessional
- Give content room to breathe - white space is good design

### Layout: Mobile-App Feel
- Full-bleed hero sections (no padding on top element)
- Generous vertical rhythm (space-y-6, mb-10)
- Asymmetric grids: col-span-2 next to col-span-1
- Bottom-anchored CTAs (fixed bottom-0 or mt-auto)
- Pull-to-refresh style top spacing

## Available Data
The data context includes:
- Original parent data (from the previous view)
- New detailed data (fetched for this drill-down)
- clicked_item:: namespace for the specific item clicked

Generate a compelling detail view now."""
