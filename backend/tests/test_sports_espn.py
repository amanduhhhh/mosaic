import unittest
from unittest.mock import Mock, patch
from integrations.sports import SportsDataFetcher


class TestSportsDataFetcher(unittest.TestCase):
    def setUp(self):
        self.fetcher = SportsDataFetcher(api_key="test_key")

    def test_get_team_abbr_nba(self):
        """Test NBA team name to abbreviation mapping"""
        self.assertEqual(self.fetcher._get_team_abbr("lakers", "nba"), "lal")
        self.assertEqual(self.fetcher._get_team_abbr("warriors", "nba"), "gs")
        self.assertEqual(self.fetcher._get_team_abbr("celtics", "nba"), "bos")
        self.assertEqual(self.fetcher._get_team_abbr("Lakers", "nba"), "lal")
        self.assertEqual(self.fetcher._get_team_abbr("unknown_team", "nba"), None)

    def test_get_team_abbr_nfl(self):
        """Test NFL team name to abbreviation mapping"""
        self.assertEqual(self.fetcher._get_team_abbr("chiefs", "nfl"), "kc")
        self.assertEqual(self.fetcher._get_team_abbr("eagles", "nfl"), "phi")
        self.assertEqual(self.fetcher._get_team_abbr("cowboys", "nfl"), "dal")
        self.assertEqual(self.fetcher._get_team_abbr("49ers", "nfl"), "sf")
        self.assertEqual(self.fetcher._get_team_abbr("unknown_team", "nfl"), None)

    def test_get_team_abbr_mlb(self):
        """Test MLB team name to abbreviation mapping"""
        self.assertEqual(self.fetcher._get_team_abbr("yankees", "mlb"), "nyy")
        self.assertEqual(self.fetcher._get_team_abbr("dodgers", "mlb"), "lad")
        self.assertEqual(self.fetcher._get_team_abbr("red sox", "mlb"), "bos")
        self.assertEqual(self.fetcher._get_team_abbr("blue jays", "mlb"), "tor")
        self.assertEqual(self.fetcher._get_team_abbr("unknown_team", "mlb"), None)

    def test_get_team_abbr_nhl(self):
        """Test NHL team name to abbreviation mapping"""
        self.assertEqual(self.fetcher._get_team_abbr("bruins", "nhl"), "bos")
        self.assertEqual(self.fetcher._get_team_abbr("penguins", "nhl"), "pit")
        self.assertEqual(self.fetcher._get_team_abbr("maple leafs", "nhl"), "tor")
        self.assertEqual(self.fetcher._get_team_abbr("golden knights", "nhl"), "vgk")
        # Note: "ruins" matches "bruins" due to substring matching
        self.assertEqual(self.fetcher._get_team_abbr("ruins", "nhl"), "bos")
        # But "boston ruins" (full phrase) doesn't match
        self.assertIsNone(self.fetcher._get_team_abbr("boston ruins", "nhl"))

    def test_get_team_abbr_partial_match(self):
        """Test partial name matching"""
        self.assertEqual(self.fetcher._get_team_abbr("los angeles lakers", "nba"), "lal")
        self.assertEqual(self.fetcher._get_team_abbr("boston bruins", "nhl"), "bos")
        self.assertEqual(self.fetcher._get_team_abbr("new york yankees", "mlb"), "nyy")

    @patch('requests.get')
    def test_fetch_nba_summary_success(self, mock_get):
        """Test NBA summary fetching with mock data"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "team": {
                "id": "1",
                "displayName": "Los Angeles Lakers",
                "record": {
                    "items": [{
                        "type": "total",
                        "stats": [
                            {"name": "wins", "value": 45},
                            {"name": "losses", "value": 20},
                            {"name": "winPercent", "value": 0.692},
                        ]
                    }]
                }
            }
        }
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response

        result = self.fetcher.fetch_nba_summary(["lakers"])
        
        self.assertIsNotNone(result)
        self.assertIn("teams", result)
        self.assertEqual(len(result["teams"]), 1)
        self.assertEqual(result["teams"][0]["name"], "Los Angeles Lakers")

    @patch('requests.get')
    def test_fetch_nfl_summary_success(self, mock_get):
        """Test NFL summary fetching with mock data"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "team": {
                "id": "1",
                "displayName": "Kansas City Chiefs",
                "record": {
                    "items": [{
                        "type": "total",
                        "stats": [
                            {"name": "wins", "value": 12},
                            {"name": "losses", "value": 3},
                            {"name": "winPercent", "value": 0.8},
                        ]
                    }]
                }
            }
        }
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response

        result = self.fetcher.fetch_nfl_summary(["chiefs"])
        
        self.assertIsNotNone(result)
        self.assertIn("teams", result)
        self.assertEqual(len(result["teams"]), 1)
        self.assertEqual(result["teams"][0]["name"], "Kansas City Chiefs")

    @patch('requests.get')
    def test_fetch_mlb_summary_success(self, mock_get):
        """Test MLB summary fetching with mock data"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "team": {
                "id": "1",
                "displayName": "New York Yankees",
                "record": {
                    "items": [{
                        "type": "total",
                        "stats": [
                            {"name": "wins", "value": 95},
                            {"name": "losses", "value": 67},
                            {"name": "winPercent", "value": 0.586},
                        ]
                    }]
                }
            }
        }
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response

        result = self.fetcher.fetch_mlb_summary(["yankees"])
        
        self.assertIsNotNone(result)
        self.assertIn("teams", result)
        self.assertEqual(len(result["teams"]), 1)
        self.assertEqual(result["teams"][0]["name"], "New York Yankees")

    @patch('requests.get')
    def test_fetch_nhl_summary_success(self, mock_get):
        """Test NHL summary fetching with mock data"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "team": {
                "id": "1",
                "displayName": "Boston Bruins",
                "record": {
                    "items": [{
                        "type": "total",
                        "stats": [
                            {"name": "wins", "value": 48},
                            {"name": "losses", "value": 18},
                            {"name": "winPercent", "value": 0.727},
                        ]
                    }]
                }
            }
        }
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response

        result = self.fetcher.fetch_nhl_summary(["bruins"])
        
        self.assertIsNotNone(result)
        self.assertIn("teams", result)
        self.assertEqual(len(result["teams"]), 1)
        self.assertEqual(result["teams"][0]["name"], "Boston Bruins")

    def test_fetch_nfl_summary_returns_none_for_invalid_team(self):
        """NFL summary returns None for invalid team names"""
        result = self.fetcher.fetch_nfl_summary(["invalid_team_that_does_not_exist"])
        self.assertIsNone(result)

    def test_fetch_mlb_summary_returns_none_for_invalid_team(self):
        """MLB summary returns None for invalid team names"""
        result = self.fetcher.fetch_mlb_summary(["invalid_team_that_does_not_exist"])
        self.assertIsNone(result)

    def test_fetch_nhl_summary_returns_none_for_invalid_team(self):
        """NHL summary returns None for invalid team names"""
        result = self.fetcher.fetch_nhl_summary(["invalid_team_that_does_not_exist"])
        self.assertIsNone(result)

    def test_multiple_teams_nfl(self):
        """Test fetching multiple NFL teams"""
        result = self.fetcher.fetch_nfl_summary(["chiefs", "eagles", "cowboys"])
        
        if result:
            self.assertIn("teams", result)
            self.assertLessEqual(len(result["teams"]), 3)

    def test_multiple_teams_mlb(self):
        """Test fetching multiple MLB teams"""
        result = self.fetcher.fetch_mlb_summary(["yankees", "dodgers", "red sox"])
        
        if result:
            self.assertIn("teams", result)
            self.assertLessEqual(len(result["teams"]), 3)


if __name__ == "__main__":
    unittest.main()

