# Interaction System Design

## Core Concept

Replace the `interaction` prop with a `click-prompt` that describes what should happen. On click, regenerate the full page with expanded data context.

```html
<!-- OLD -->
<component-slot type="List" interaction="smart"></component-slot>

<!-- NEW -->
<component-slot
  type="List"
  click-prompt="Show detailed stats for this song including play history and similar tracks"
></component-slot>
```

---

## Flow

```
User clicks item
    ↓
Frontend captures: { slotId, clickPrompt, clickedData }
    ↓
POST /interact
    ↓
Backend: planning → fetch NEW data → regenerate full UI
    ↓
Stream new HTML (same SSE as /generate)
    ↓
Frontend: push current state to history stack, render new UI
```

---

## API

### POST /interact

**Request:**
```json
{
  "slot_id": "abc123",
  "click_prompt": "Show detailed stats for this song...",
  "clicked_data": { "title": "Blinding Lights", "artist": "The Weeknd" },
  "current_data_context": { ... },
  "history_depth": 2
}
```

**Response:** SSE stream (same format as /generate)
- `data` event: expanded data context
- `ui` events: new HTML chunks
- `done` event

---

## Data Context Expansion

Each interaction adds to (not replaces) the data context:

```python
# Initial
{ "music": { "top_songs": [...] } }

# After clicking a song
{
  "music": { "top_songs": [...] },
  "song_detail": {
    "play_history": [...],
    "similar_tracks": [...],
    "audio_features": { ... }
  }
}
```

The LLM sees all available data and decides what to display.

---

## Frontend State

```typescript
interface InteractionState {
  history: Array<{
    html: string;
    dataContext: object;
  }>;
  currentIndex: number;
}

// On interact: push to history, increment index
// On back: decrement index, render history[currentIndex]
```

---

## Prompt Engineering

### System prompt addition:

```
## Interactions

For clickable elements, add click-prompt describing what happens:

<component-slot
  type="List"
  data-source="music::top_songs"
  config='{"template":{"primary":"title"}}'
  click-prompt="Dive into this song - show play count over time, audio features, and recommendations"
></component-slot>

The click-prompt should:
- Describe the user intent (what they want to see)
- Mention what new data might be needed
- Be written from user perspective ("Show me...", "Dive into...", "Break down...")

For non-interactive elements, omit click-prompt.
```

---

## Future: new_window Mode

For modal/overlay interactions (not in v1):

```html
<component-slot
  click-prompt="..."
  click-mode="new_window"  <!-- opens as overlay instead of replacing -->
></component-slot>
```

- Opens a modal/sheet over current content
- Has its own close button
- Doesn't affect history stack
- Useful for quick previews without losing context

---

## Component Changes

### ListPlaceholder / ChartPlaceholder / etc.

```typescript
interface ComponentProps {
  data: unknown;
  config: { template?: Record<string, string> };
  clickPrompt?: string;  // NEW: replaces onInteraction
  slotId: string;        // NEW: for tracking
  onInteract: (payload: InteractPayload) => void;  // NEW: global handler
}

// In component:
onClick={() => {
  if (clickPrompt) {
    onInteract({
      slotId,
      clickPrompt,
      clickedData: item,
    });
  }
}}
```

---

## Questions to Resolve

1. **Slot-level vs item-level clicks**: If a List has click-prompt, does clicking any item use the same prompt? Or should items have individual prompts?
   - Proposal: Slot-level prompt, but clicked item data is passed to give context

2. **Loading state**: What to show during regeneration?
   - Proposal: Skeleton/shimmer over current content, then morph to new

3. **Error handling**: What if interaction fails?
   - Proposal: Toast error, stay on current state

4. **Prompt interpolation**: Should click-prompt support variables like `"Show details for {title}"`?
   - Proposal: No, keep it simple. LLM gets clicked_data separately.

---

## Implementation Order

1. Update prompt to use `click-prompt` instead of `interaction`
2. Add `slotId` generation in HybridRenderer
3. Update component props interface
4. Implement history stack in frontend
5. Create `/interact` endpoint
6. Add loading states
7. Test full flow
