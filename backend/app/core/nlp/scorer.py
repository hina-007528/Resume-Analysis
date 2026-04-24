"""
Scorer — hybrid similarity scoring grounded in both text semantics and skills.

Score breakdown (when skills are present):
  - 60% TF-IDF cosine similarity of the full processed texts
  - 40% skill overlap ratio  (matched_skills / total_jd_skills)

When no skills are detected in the JD (free-text JD with no known keywords),
the score falls back to 100% TF-IDF.

This hybrid approach prevents the pathological case where TF-IDF gives a high
score because both texts share common English words, while the actual skills
don't match at all.
"""

from typing import Tuple, List, Set, Optional

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity as _cos_sim
    _SKLEARN = True
except ImportError:
    _SKLEARN = False


class Scorer:
    # Weight split: TF-IDF semantic vs skill-set overlap
    _TFIDF_WEIGHT = 0.60
    _SKILL_WEIGHT = 0.40

    # ---------------------------------------------------------------------------

    def calculate_match_score(
        self,
        resume_text: str,
        jd_text: str,
        resume_skills: Optional[Set[str]] = None,
        jd_skills: Optional[Set[str]] = None,
    ) -> float:
        """
        Return a blended match score [0.0 – 100.0].

        Parameters
        ----------
        resume_text : preprocessed resume string (lemmatised, stopwords removed)
        jd_text     : preprocessed JD string
        resume_skills : canonical skill set extracted from the raw resume
        jd_skills     : canonical skill set extracted from the raw JD
        """
        if not resume_text or not jd_text:
            return 0.0

        resume_text = self._expand_acronyms(resume_text.strip())
        jd_text     = self._expand_acronyms(jd_text.strip())

        # Guard against extremely short text
        if len(resume_text) < 20 or len(jd_text) < 20:
            return 0.0

        # ── TF-IDF component ──────────────────────────────────────────────
        tfidf_score = self._tfidf_score(resume_text, jd_text)

        # ── Skill-overlap component ────────────────────────────────────────
        if jd_skills:
            matched = resume_skills & jd_skills if resume_skills else set()
            skill_ratio = len(matched) / len(jd_skills)
            # Blend
            final = (
                self._TFIDF_WEIGHT * tfidf_score
                + self._SKILL_WEIGHT * skill_ratio * 100
            )
        else:
            # No skills detected in JD → pure TF-IDF
            final = tfidf_score

        return round(min(final, 100.0), 2)

    # ---------------------------------------------------------------------------

    def _tfidf_score(self, resume_text: str, jd_text: str) -> float:
        if _SKLEARN:
            try:
                vectorizer = TfidfVectorizer(
                    ngram_range=(1, 2),
                    min_df=1,
                    sublinear_tf=True,
                    analyzer="word",
                    token_pattern=r"(?u)\b\w+\b",
                )
                mat = vectorizer.fit_transform([resume_text, jd_text])
                return float(_cos_sim(mat[0:1], mat[1:2])[0][0]) * 100
            except Exception as exc:
                print(f"[Scorer] TF-IDF failed ({exc}); using Jaccard fallback.")

        # Jaccard fallback
        set1 = set(resume_text.lower().split())
        set2 = set(jd_text.lower().split())
        if not set1 or not set2:
            return 0.0
        return (len(set1 & set2) / len(set1 | set2)) * 100

    # ---------------------------------------------------------------------------

    def get_score_label(self, score: float) -> str:
        if score >= 80:
            return "Excellent Match"
        elif score >= 60:
            return "Good Match"
        elif score >= 40:
            return "Average Match"
        else:
            return "Weak Match"

    def _expand_acronyms(self, text: str) -> str:
        acronym_map = {
            "ml": "machine learning",
            "ai": "artificial intelligence",
            "nlp": "natural language processing",
            "api": "application programming interface"
        }
        words = text.split()
        expanded = [acronym_map.get(w, w) for w in words]
        return " ".join(expanded)

    def analyze_gaps(
        self,
        resume_skills: Set[str],
        jd_skills: Set[str],
    ) -> Tuple[List[str], List[str]]:
        """Return (matched_sorted, missing_sorted) canonical skill lists."""
        matched = sorted(resume_skills & jd_skills)
        missing = sorted(jd_skills - resume_skills)
        return matched, missing

def calculate_match_score(resume_text: str, jd_text: str) -> float:
    """Convenience top-level function for scoring. Includes skill extraction."""
    from app.core.nlp.extractor import EntityExtractor
    
    scorer = Scorer()
    extractor = EntityExtractor()
    
    # Extract skills for hybrid scoring
    resume_skills = extractor.extract_skills(resume_text)
    jd_skills = extractor.extract_skills(jd_text)
    
    # Apply acronym expansion before semantic scoring
    resume_text_expanded = scorer._expand_acronyms(resume_text)
    jd_text_expanded = scorer._expand_acronyms(jd_text)
    
    return scorer.calculate_match_score(
        resume_text_expanded, 
        jd_text_expanded,
        resume_skills=resume_skills,
        jd_skills=jd_skills
    )

def get_score_label(score: float) -> str:
    """Convenience top-level function for labels."""
    return Scorer().get_score_label(score)
