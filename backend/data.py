MOCK_DATA = {
    "music": {
        "top_songs": [
            {"title": "Blinding Lights", "artist": "The Weeknd", "plays": 342},
            {"title": "Levitating", "artist": "Dua Lipa", "plays": 289}
        ],
        "total_minutes": 87234,
        "top_genres": ["Pop", "Electronic", "Hip-Hop"]
    },
    "travel": {
        "cities": [
            {"name": "Tokyo", "country": "Japan", "days": 7, "photos": 156},
            {"name": "Paris", "country": "France", "days": 5, "photos": 89}
        ],
        "total_countries": 8
    },
    "fitness": {
        "workouts": 127,
        "total_minutes": 5430,
        "by_type": [
            {"type": "Running", "count": 45, "calories": 12300},
            {"type": "Strength", "count": 50, "calories": 6700}
        ]
    },
    "reading": {
        "books_read": 52,
        "total_pages": 18420,
        "top_books": [
            {"title": "Project Hail Mary", "author": "Andy Weir", "rating": 5},
            {"title": "The Midnight Library", "author": "Matt Haig", "rating": 4}
        ]
    }
}

COMPONENT_SCHEMAS = {
    "MetricCard": {
        "data": {"value": "number", "label": "string", "icon": "string"},
        "config": {"trend": "string", "color": "string"}
    },
    "BarChart": {
        "data": [{"label": "string", "value": "number"}],
        "config": {"orientation": "vertical|horizontal", "color": "string"}
    },
    "Timeline": {
        "data": [{"date": "string", "title": "string"}],
        "config": {"style": "minimal|detailed"}
    },
    "Map": {
        "data": [{"name": "string", "lat": "number", "lng": "number"}],
        "config": {"style": "dark|light"}
    }
}
