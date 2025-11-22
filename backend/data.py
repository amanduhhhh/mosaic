from typing import Optional, Dict, Any, List

def get_spotify_data() -> Optional[Dict[str, Any]]:
    """Get Spotify data from the fetcher"""
    try:
        from integrations.spotify import SpotifyDataFetcher
        from config import get_settings
        
        settings = get_settings()
        if not settings.spotify_client_id or not settings.spotify_client_secret:
            return None
        
        fetcher = SpotifyDataFetcher(
            client_id=settings.spotify_client_id,
            client_secret=settings.spotify_client_secret,
            redirect_uri=settings.spotify_redirect_uri
        )
        
        if not fetcher.is_authenticated():
            return None
        
        return fetcher.fetch_user_data()
    except Exception as e:
        print(f"Error getting Spotify data: {e}")
        return None


def get_stocks_data(symbols: List[str] = None) -> Optional[Dict[str, Any]]:
    """Get stocks data from the fetcher"""
    try:
        from integrations.stocks import StocksDataFetcher
        from config import get_settings
        
        settings = get_settings()
        fetcher = StocksDataFetcher(alpha_vantage_key=settings.alpha_vantage_api_key)
        
        if symbols:
            return fetcher.fetch_portfolio_data(symbols)
        else:
            # Return market trends if no specific symbols
            return fetcher.fetch_market_trends()
    except Exception as e:
        print(f"Error getting stocks data: {e}")
        return None


def get_sports_data(team_names: List[str] = None) -> Optional[Dict[str, Any]]:
    """Get sports data from the fetcher"""
    try:
        from integrations.sports import SportsDataFetcher
        from config import get_settings
        
        settings = get_settings()
        fetcher = SportsDataFetcher(api_key=settings.sports_api_key)
        
        if team_names:
            return fetcher.fetch_user_sports_summary(team_names)
        else:
            return None
    except Exception as e:
        print(f"Error getting sports data: {e}")
        return None


# Fallback mock data
MOCK_MUSIC_DATA = {
    "top_songs": [
        {"title": "Blinding Lights", "artist": "The Weeknd", "plays": 342},
        {"title": "Levitating", "artist": "Dua Lipa", "plays": 289}
    ],
    "total_minutes": 87234,
    "top_genres": ["Pop", "Electronic", "Hip-Hop"]
}

MOCK_DATA = {
    "music": MOCK_MUSIC_DATA,
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

# Try to get real data from integrations
spotify_data = get_spotify_data()
if spotify_data:
    MOCK_DATA["music"] = spotify_data

# Stocks data can be fetched on-demand via API endpoints
# Sports data can be fetched on-demand via API endpoints

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
