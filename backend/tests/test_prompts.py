import unittest
from prompts import describe_data, get_available_sources, build_planning_prompt


class TestDescribeData(unittest.TestCase):
    def test_simple_primitive(self):
        """Single primitive value shows type and value"""
        data = {"music": {"total_minutes": 87234}}
        result = describe_data(data)

        self.assertIn("music:", result)
        self.assertIn("music::total_minutes (int) = 87234", result)

    def test_array_of_objects(self):
        """Array of objects shows fields with types and example"""
        data = {
            "music": {
                "top_songs": [
                    {"title": "Blinding Lights", "artist": "The Weeknd", "plays": 342},
                    {"title": "Levitating", "artist": "Dua Lipa", "plays": 289},
                ]
            }
        }
        result = describe_data(data)

        self.assertIn("music::top_songs (array of 2)", result)
        self.assertIn("title: str", result)
        self.assertIn("plays: int", result)
        self.assertIn("Blinding Lights", result)

    def test_array_of_primitives(self):
        """Array of strings shows type and example"""
        data = {"music": {"top_genres": ["Pop", "Electronic", "Hip-Hop"]}}
        result = describe_data(data)

        self.assertIn("music::top_genres (array of 3 strs)", result)
        self.assertIn("'Pop'", result)

    def test_nested_object(self):
        """Object shows fields with types and example values"""
        data = {
            "user": {
                "profile": {
                    "name": "John Doe",
                    "email": "john@example.com",
                    "age": 30,
                }
            }
        }
        result = describe_data(data)

        self.assertIn("user::profile (object)", result)
        self.assertIn("name: str", result)
        self.assertIn("age: int", result)
        self.assertIn("John Doe", result)

    def test_empty_array(self):
        """Empty array is labeled as such"""
        data = {"music": {"top_songs": []}}
        result = describe_data(data)

        self.assertIn("music::top_songs (empty array)", result)

    def test_multiple_namespaces(self):
        """Multiple namespaces are all included"""
        data = {
            "music": {"total_minutes": 87234},
            "fitness": {"workouts": 127},
        }
        result = describe_data(data)

        self.assertIn("music:", result)
        self.assertIn("fitness:", result)
        self.assertIn("music::total_minutes", result)
        self.assertIn("fitness::workouts", result)

    def test_long_string_truncation(self):
        """Long strings are truncated in examples"""
        data = {
            "content": {
                "description": "A" * 100  # Very long string
            }
        }
        result = describe_data(data)

        # Should be truncated (repr adds quotes, so check it's not full length)
        self.assertIn("content::description (str)", result)
        # The truncation happens at 25 chars in repr
        self.assertTrue(len(result) < 200)

    def test_data_source_format(self):
        """Output uses namespace::key format consistently"""
        data = {
            "music": {
                "top_songs": [{"title": "Test"}],
                "total": 100,
            },
            "user": {
                "name": "John",
            },
        }
        result = describe_data(data)

        # All data sources should be in namespace::key format
        self.assertIn("music::top_songs", result)
        self.assertIn("music::total", result)
        self.assertIn("user::name", result)


class TestGetAvailableSources(unittest.TestCase):
    def test_returns_all_sources(self):
        """Returns all namespace::key combinations from MOCK_DATA"""
        sources = get_available_sources()

        # Should return a list
        self.assertIsInstance(sources, list)

        # All items should be in namespace::key format
        for source in sources:
            self.assertIn("::", source)
            parts = source.split("::")
            self.assertEqual(len(parts), 2)

    def test_source_format(self):
        """Each source follows namespace::key format"""
        sources = get_available_sources()

        for source in sources:
            namespace, key = source.split("::")
            self.assertTrue(len(namespace) > 0)
            self.assertTrue(len(key) > 0)


class TestBuildPlanningPrompt(unittest.TestCase):
    def test_includes_query(self):
        """Planning prompt includes the user query"""
        query = "Show me my music stats"
        result = build_planning_prompt(query)

        self.assertIn(query, result)

    def test_includes_available_sources(self):
        """Planning prompt includes available data sources"""
        query = "Test query"
        result = build_planning_prompt(query)

        # Should contain some sources
        self.assertIn("::", result)

    def test_includes_json_format(self):
        """Planning prompt specifies JSON output format"""
        query = "Test query"
        result = build_planning_prompt(query)

        self.assertIn("sources", result)
        self.assertIn("intent", result)
        self.assertIn("approach", result)


class TestDescribeDataExamples(unittest.TestCase):
    """
    Example mappings showing input → output for describe_data()
    These serve as documentation and regression tests.
    """

    def test_example_music_data(self):
        """
        Example: Music listening data

        Input:
        {
            "music": {
                "top_songs": [
                    {"title": "Blinding Lights", "artist": "The Weeknd", "plays": 342}
                ],
                "total_minutes": 87234,
                "top_genres": ["Pop", "Electronic"]
            }
        }

        Output:
        music:
          music::top_songs (array of 1) - {title: str, artist: str, plays: int}
            [0]: {title='Blinding Lights', artist='The Weeknd', plays=342}
          music::total_minutes (int) = 87234
          music::top_genres (array of 2 strs)
            [0]: 'Pop'
        """
        data = {
            "music": {
                "top_songs": [
                    {"title": "Blinding Lights", "artist": "The Weeknd", "plays": 342}
                ],
                "total_minutes": 87234,
                "top_genres": ["Pop", "Electronic"],
            }
        }
        result = describe_data(data)

        # Verify key parts of output
        self.assertIn("music::top_songs (array of 1)", result)
        self.assertIn("title: str", result)
        self.assertIn("music::total_minutes (int) = 87234", result)
        self.assertIn("music::top_genres (array of 2 strs)", result)

    def test_example_fitness_data(self):
        """
        Example: Fitness tracking data

        Input:
        {
            "fitness": {
                "workouts": 127,
                "by_type": [
                    {"type": "Running", "count": 45, "calories": 12300}
                ]
            }
        }

        Output:
        fitness:
          fitness::workouts (int) = 127
          fitness::by_type (array of 1) - {type: str, count: int, calories: int}
            [0]: {type='Running', count=45, calories=12300}
        """
        data = {
            "fitness": {
                "workouts": 127,
                "by_type": [
                    {"type": "Running", "count": 45, "calories": 12300}
                ],
            }
        }
        result = describe_data(data)

        self.assertIn("fitness::workouts (int) = 127", result)
        self.assertIn("fitness::by_type (array of 1)", result)
        self.assertIn("type: str", result)
        self.assertIn("calories: int", result)

    def test_example_user_profile(self):
        """
        Example: User profile object

        Input:
        {
            "user": {
                "profile": {
                    "name": "John Doe",
                    "bio": "Music lover"
                }
            }
        }

        Output:
        user:
          user::profile (object) - {name: str, bio: str}
            example: {name='John Doe', bio='Music lover'}
        """
        data = {
            "user": {
                "profile": {
                    "name": "John Doe",
                    "bio": "Music lover",
                }
            }
        }
        result = describe_data(data)

        self.assertIn("user::profile (object)", result)
        self.assertIn("name: str", result)
        self.assertIn("John Doe", result)


if __name__ == "__main__":
    unittest.main()
