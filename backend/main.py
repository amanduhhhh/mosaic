from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from litellm import acompletion
import json
from typing import AsyncGenerator

from config import get_settings
from data import MOCK_DATA, COMPONENT_SCHEMAS
from utils import extract_complete_element, get_data

app = FastAPI()
settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UI_SYSTEM_PROMPT = f"""Generate beautiful UIs using HTML/CSS and custom components.

Components: {json.dumps(COMPONENT_SCHEMAS)}

Rules:
- Use HTML/CSS for layouts (divs, grids, gradients)
- Use <component-slot type="..." data-source="..." config='{{...}}' interaction="smart" /> for data viz
- Dark gradients, generous spacing, bold typography

Example:
<div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 40px; border-radius: 16px;">
  <h1 style="color: white; font-size: 48px;">Your 2024</h1>
  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
    <component-slot type="MetricCard" data-source="reading::books_read"
                    config='{{"label": "Books", "icon": "📚", "trend": "+12"}}'
                    interaction="smart" />
  </div>
</div>"""


class GenerateRequest(BaseModel):
    query: str


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/generate")
async def generate_ui(request: GenerateRequest):
    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            data_sources = await plan_data(request.query)
            yield f"event: data-plan\ndata: {json.dumps(data_sources)}\n\n"

            data_context = get_data(data_sources["sources"], MOCK_DATA)
            yield f"event: data-ready\ndata: {json.dumps(list(data_context.keys()))}\n\n"

            response = await acompletion(
                model="anthropic/claude-sonnet-4-20250514",
                messages=[{
                    "role": "user",
                    "content": f"{request.query}\n\nData: {json.dumps(data_context)}"
                }],
                system=UI_SYSTEM_PROMPT,
                stream=True,
                max_tokens=4000,
                api_key=settings.anthropic_api_key
            )

            buffer = ""
            async for chunk in response:
                if hasattr(chunk.choices[0].delta, 'content') and chunk.choices[0].delta.content:
                    buffer += chunk.choices[0].delta.content

                    while True:
                        complete = extract_complete_element(buffer)
                        if not complete:
                            break
                        yield f"event: ui-chunk\ndata: {json.dumps({'content': complete})}\n\n"
                        buffer = buffer[len(complete):]

            if buffer.strip():
                yield f"event: ui-chunk\ndata: {json.dumps({'content': buffer})}\n\n"

            yield f"event: complete\ndata: {{}}\n\n"

        except Exception as e:
            yield f"event: error\ndata: {json.dumps({'message': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


async def plan_data(query: str) -> dict:
    response = await acompletion(
        model="anthropic/claude-sonnet-4-20250514",
        messages=[{
            "role": "user",
            "content": f"""Query: "{query}"

Available: music::top_songs, travel::cities, fitness::workouts, reading::books_read

Return JSON only: {{"sources": ["source1", "source2"]}}"""
        }],
        max_tokens=300,
        api_key=settings.anthropic_api_key
    )

    text = response.choices[0].message.content
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
