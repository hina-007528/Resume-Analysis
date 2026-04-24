import pytest
import sys
import os

# Add the app directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.core.nlp.preprocessor import preprocess_text
from app.core.nlp.extractor import extract_keywords

class TestPreprocessor:

    def test_lowercase_conversion(self):
        result = preprocess_text("Python Developer WITH Django")
        assert "python" in result
        assert "Python" not in result
        assert "WITH" not in result

    def test_punctuation_removal(self):
        result = preprocess_text("B.Sc. in Computer Science (2023)")
        # Punctuation stripped but words preserved
        assert "computer" in result
        assert "science" in result
        assert "2023" in result

    def test_stopword_removal(self):
        result = preprocess_text("I am a developer with experience in the team")
        stop_words = ["i", "am", "a", "with", "in", "the"]
        tokens = result.split()
        for sw in stop_words:
            assert sw not in tokens, f"Stopword '{sw}' not removed"

    def test_lemmatization_verbs(self):
        result = preprocess_text("developed developing develops")
        # All forms should reduce to 'develop'
        assert "develop" in result

    def test_lemmatization_nouns(self):
        result = preprocess_text("libraries algorithms frameworks")
        # Plural → singular
        assert "library" in result or "librari" in result
        assert "algorithm" in result

    def test_preserves_tech_terms(self):
        # Critical: tech terms must NOT be over-lemmatized
        result = preprocess_text("Python pandas TensorFlow scikit-learn SQL")
        assert "python" in result
        assert "pandas" in result  # must not become "panda"
        assert "sql" in result

    def test_handles_empty_string(self):
        result = preprocess_text("")
        assert result == ""

    def test_handles_only_stopwords(self):
        result = preprocess_text("the and is with a to of")
        assert len(result.strip()) == 0 or result.strip() == ""


class TestKeywordExtractor:

    def test_extracts_known_skills(self):
        text = "Experienced in Python, SQL, machine learning, and REST APIs"
        keywords = extract_keywords(text)
        assert "python" in keywords
        assert "sql" in keywords
        assert "machine learning" in keywords

    def test_extracts_education(self):
        text = "Bachelor of Science in Computer Science from FAST NUCES"
        keywords = extract_keywords(text)
        assert any(k in keywords for k in 
                  ["bachelor", "computer science", "fast nuces"])

    def test_extracts_experience_years(self):
        text = "5 years of experience in software development"
        keywords = extract_keywords(text)
        assert any("experience" in k or "software" in k 
                  for k in keywords)

    def test_no_duplicates_in_keywords(self):
        text = "Python python PYTHON developer"
        keywords = extract_keywords(text)
        # Should deduplicate
        assert keywords.count("python") == 1

    def test_multiword_skills_extracted(self):
        text = "expertise in machine learning and data visualization"
        keywords = extract_keywords(text)
        assert "machine learning" in keywords
        assert "data visualization" in keywords

    def test_empty_text_returns_empty_list(self):
        keywords = extract_keywords("")
        assert keywords == [] or keywords == set()
