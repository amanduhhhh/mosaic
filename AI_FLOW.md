# AI Generation Flow

## Pipeline Stages

```
User Query → Planning → Data Fetch → Description → UI Generation → Streaming → Hydration
```

---

### Stage 1: Planning

**Input**: User query string
```
"Show me my music listening stats"
```

**Output**: JSON with sources, intent, approach
```json
{
  "sources": ["music::top_songs", "music::total_minutes", "music::top_genres"],
  "intent": "User wants to see their music listening patterns and favorites",
  "approach": "Hero stat for total time, list of top songs, genre breakdown"
}
```

**What happens**: Small LLM call (~300 tokens) that classifies what data is needed and how to present it.

---

### Stage 2: Data Fetch

**Input**: List of sources from planning
```python
["music::top_songs", "music::total_minutes", "music::top_genres"]
```

**Output**: Data context object (sent to frontend + used for description)
```python
{
  "music": {
    "top_songs": [
      {"title": "Blinding Lights", "artist": "The Weeknd", "plays": 342},
      {"title": "Levitating", "artist": "Dua Lipa", "plays": 289}
    ],
    "total_minutes": 87234,
    "top_genres": ["Pop", "Electronic", "Hip-Hop"]
  }
}
```

**What happens**: Currently pulls from `MOCK_DATA`. Future: agentic tool calls to Spotify, Strava, etc.

---

### Stage 3: Data Description

**Input**: Data context object

**Output**: Natural language schema for LLM
```
music:
  music::top_songs (array of 2) - {title: str, artist: str, plays: int}
    [0]: {title='Blinding Lights', artist='The Weeknd', plays=342}
  music::total_minutes (int) = 87234
  music::top_genres (array of 3 strs)
    [0]: 'Pop'
```

**What happens**: `describe_data()` converts JSON to readable format showing exact data-source strings, field types, and examples.

#### Example Mappings for `describe_data()`

**Example 1: Music data**
```python
# Input
{
    "music": {
        "top_songs": [
            {"title": "Blinding Lights", "artist": "The Weeknd", "plays": 342}
        ],
        "total_minutes": 87234,
        "top_genres": ["Pop", "Electronic"]
    }
}

# Output
music:
  music::top_songs (array of 1) - {title: str, artist: str, plays: int}
    [0]: {title='Blinding Lights', artist='The Weeknd', plays=342}
  music::total_minutes (int) = 87234
  music::top_genres (array of 2 strs)
    [0]: 'Pop'
```

**Example 2: Fitness data**
```python
# Input
{
    "fitness": {
        "workouts": 127,
        "by_type": [
            {"type": "Running", "count": 45, "calories": 12300}
        ]
    }
}

# Output
fitness:
  fitness::workouts (int) = 127
  fitness::by_type (array of 1) - {type: str, count: int, calories: int}
    [0]: {type='Running', count=45, calories=12300}
```

**Example 3: User profile object**
```python
# Input
{
    "user": {
        "profile": {"name": "John Doe", "bio": "Music lover"}
    }
}

# Output
user:
  user::profile (object) - {name: str, bio: str}
    example: {name='John Doe', bio='Music lover'}
```

---

### Stage 4: UI Generation

**Input**: System prompt + user prompt with data description

System prompt contains:
- How data binding works (data-value, component-slot syntax)
- Component registry (List, Chart, Grid, Timeline, Card)
- Template mapping examples
- Visual language rules
- Golden rule: no synthetic data

User prompt contains:
- Original query
- Data description from Stage 3

**Output**: Raw HTML with data bindings
```html
<div class="min-h-screen bg-zinc-950 p-6">
  <div class="mb-10">
    <p class="text-xs text-zinc-600">This Year</p>
    <p class="text-8xl font-black text-white">
      <data-value data-source="music::total_minutes"></data-value>
    </p>
    <p class="text-zinc-500">minutes listening</p>
  </div>

  <div class="bg-zinc-900 border border-zinc-800 p-4">
    <component-slot
      type="List"
      data-source="music::top_songs"
      config='{"template":{"primary":"title","secondary":"artist"}}'
      interaction="smart"
    ></component-slot>
  </div>
</div>
```

**What happens**: LLM generates ~2000 tokens of HTML, streaming. It places containers (data-value, component-slot) but never writes actual data values.

---

### Stage 5: SSE Streaming

**Events sent to frontend**:

1. `data` event (once, first):
```
event: data
data: {"music": {"top_songs": [...], "total_minutes": 87234}}
```

2. `ui` events (many, streaming):
```
event: ui
data: {"content": "<div class=\"min-h-screen"}

event: ui
data: {"content": " bg-zinc-950 p-6\">"}

event: ui
data: {"content": "\n  <div class=\"mb-10\">"}
```

3. `done` event (once, last):
```
event: done
data: {}
```

**What happens**: Backend streams as LLM generates. Frontend accumulates HTML chunks.

---

### Stage 6: Frontend Hydration

**Input**:
- Data context (from `data` event)
- Accumulated HTML (from `ui` events)

**What happens**:

1. **Sanitize**: DOMPurify allows `<component-slot>` and `<data-value>` tags
2. **Diff**: morphdom patches DOM, preserving existing React roots
3. **Resolve data-values**:
   ```javascript
   // Find: <data-value data-source="music::total_minutes"></data-value>
   // Look up: dataContext["music"]["total_minutes"] = 87234
   // Set: element.textContent = "87234"
   ```
4. **Mount components**:
   ```javascript
   // Find: <component-slot type="List" data-source="music::top_songs" ...>
   // Look up: COMPONENT_REGISTRY["List"] → ListComponent
   // Resolve: dataContext["music"]["top_songs"] → array
   // Mount: createRoot(wrapper).render(<ListComponent data={array} config={...} />)
   ```

**Component Registry** (`frontend/components/registry.ts`):
```typescript
export const COMPONENT_REGISTRY = {
  List: ListComponent,
  Card: CardComponent,
  Chart: ChartComponent,
  Grid: GridComponent,
  Timeline: TimelineComponent,
};
```

Each component receives:
- `data`: Resolved from dataContext via namespace::key
- `config`: Parsed from config attribute (includes template mapping)
- `onInteraction`: Callback for user interactions

---

## Optimizations

### Current
- **Streaming**: User sees content as it generates
- **morphdom**: Only updates changed DOM, preserves React roots
- **Slot tracking**: Prevents remounting existing components

### Potential
1. **Parallel planning + prefetch**: Start fetching common data while planning
2. **Speculative generation**: Begin HTML generation with partial data, patch later
3. **Cached schemas**: Pre-compute describe_data for common sources
4. **Component preloading**: Lazy-load component code while streaming
5. **Incremental hydration**: Mount components as their slots appear, not at end

## Token Budget

| Stage | Model | Tokens | Latency |
|-------|-------|--------|---------|
| Planning | Claude Sonnet | ~300 | ~500ms |
| Generation | Claude Sonnet | ~2000 | ~3-5s streaming |

Total first-token: ~800ms
Total complete: ~4-6s

## Future: Agentic Data Fetching

Replace static `get_data()` with tool-calling agent:

```python
# Agent has access to:
tools = [
    fetch_spotify_data,
    fetch_strava_activities,
    fetch_stock_portfolio,
    search_sports_team,
]

# Planning stage returns tool calls instead of static sources
# Agent executes tools in parallel where possible
# Results become data context
```

Benefits:
- Dynamic data based on user query
- Cross-source correlations ("compare my running to my music tempo")
- Graceful fallbacks when APIs fail

## Error Handling

| Error | Handling |
|-------|----------|
| Planning fails | Return error event, show fallback UI |
| Data fetch fails | Partial data context, LLM adapts |
| Generation fails | Stream error event |
| Hydration fails | Per-component error boundaries |

## Edit Flow

Same pipeline but Stage 4 receives:
- Current HTML (to modify)
- Edit instruction (what to change)
- Same data context (bindings preserved)

morphdom then diffs old → new, preserving mounted components where slot IDs match.
