import pytest
import sys
import os

# Add the app directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.core.nlp.scorer import calculate_match_score, get_score_label

class TestScorer:

    def test_identical_texts_score_100(self):
        text = "python developer machine learning pandas sql"
        score = calculate_match_score(text, text)
        assert score == pytest.approx(100.0, abs=0.5)

    def test_completely_different_texts_score_near_0(self):
        resume = "python django rest api web development html css"
        jd = "mechanical engineering autocad solidworks manufacturing"
        score = calculate_match_score(resume, jd)
        assert score < 15.0, f"Expected near 0, got {score}"

    def test_partial_match_in_range(self):
        # Using more distinct terms to ensure we stay in range
        resume = "python pandas machine learning communication teamwork"
        jd = "python sql pandas data visualization machine learning power bi"
        score = calculate_match_score(resume, jd)
        # Should be good match (significant overlap in keywords)
        assert 40.0 <= score <= 90.0, f"Score {score} out of expected range"

    def test_score_is_percentage(self):
        score = calculate_match_score("python developer", "python engineer")
        assert 0.0 <= score <= 100.0

    def test_score_symmetry(self):
        # A vs B should equal B vs A if they have same number of skills
        a = "python machine learning data science"
        b = "python sql pandas"
        score_ab = calculate_match_score(a, b)
        score_ba = calculate_match_score(b, a)
        assert score_ab == pytest.approx(score_ba, abs=0.01)

    def test_empty_resume_returns_zero(self):
        score = calculate_match_score("", "python developer sql pandas")
        assert score == 0.0

    def test_empty_jd_returns_zero(self):
        score = calculate_match_score("python developer", "")
        assert score == 0.0

    def test_adding_keywords_increases_score(self):
        jd = "python sql pandas data visualization machine learning"
        resume_weak = "python developer"
        resume_strong = "python sql pandas data visualization machine learning"
        score_weak = calculate_match_score(resume_weak, jd)
        score_strong = calculate_match_score(resume_strong, jd)
        assert score_strong > score_weak, \
            f"Strong resume ({score_strong}) should score higher than weak ({score_weak})"

    def test_score_label_mapping(self):
        assert get_score_label(85) == "Excellent Match"
        assert get_score_label(70) == "Good Match"
        assert get_score_label(50) == "Average Match"
        assert get_score_label(30) == "Weak Match"
        assert get_score_label(0)  == "Weak Match"
        assert get_score_label(100) == "Excellent Match"

    def test_acronym_expansion(self):
        # ML should be expanded to machine learning
        resume = "ml specialist"
        jd = "machine learning specialist"
        # Without expansion, they'd have lower similarity
        score = calculate_match_score(resume, jd)
        assert score > 80.0
