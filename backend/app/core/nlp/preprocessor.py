"""
TextPreprocessor — cleans text for TF-IDF similarity scoring.

IMPORTANT: We do NOT strip tech punctuation (dots, dashes, slashes) because
skill names like 'node.js', 'scikit-learn', 'ci/cd', '.net' depend on them.
We only normalise whitespace, remove control characters, and optionally
remove stopwords / lemmatise when spaCy is available.
"""

import re
from typing import List

try:
    import spacy
except ImportError:
    spacy = None

try:
    import nltk
    from nltk.corpus import stopwords as _nltk_stopwords
except ImportError:
    nltk = None
    _nltk_stopwords = None


class TextPreprocessor:
    def __init__(self, model: str = "en_core_web_sm"):
        self.nlp = None
        if spacy:
            try:
                self.nlp = spacy.load(model)
            except Exception:
                print("[Preprocessor] spaCy model not found. Using regex fallback.")

        # Build stopword set (used in fallback path only)
        self.stop_words: set = set()
        if _nltk_stopwords:
            try:
                self.stop_words = set(_nltk_stopwords.words("english"))
            except Exception:
                pass

        # Minimal stop-word set when NLTK is unavailable
        if not self.stop_words:
            self.stop_words = {
                "i", "me", "my", "we", "our", "you", "your", "he", "she",
                "they", "it", "is", "are", "was", "were", "be", "been",
                "have", "has", "had", "do", "does", "did", "will", "would",
                "can", "could", "may", "might", "shall", "should",
                "a", "an", "the", "and", "or", "but", "in", "on", "at",
                "to", "for", "of", "with", "by", "from", "as", "this",
                "that", "these", "those", "not", "no",
            }

    # ── Public API ──────────────────────────────────────────────────────────

    def clean_text(self, text: str) -> str:
        """
        Light cleaning that PRESERVES tech punctuation.
        """
        if not text:
            return ""

        text = text.lower()
        
        # FIX: replace hyphens with space to avoid 'scikit-learn' -> 'scikitlearn'
        # when punctuation is stripped later.
        text = text.replace("-", " ")

        # Replace non-printable / control chars
        text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", " ", text)
        text = re.sub(r"[\t\n\r]+", " ", text)
        text = re.sub(r" {2,}", " ", text).strip()
        return text

    def tokenize_and_lemmatize(self, text: str) -> List[str]:
        """
        Tokenize, remove stopwords, optionally lemmatise.
        Includes protection for tech terms like 'pandas'.
        """
        cleaned = self.clean_text(text)
        
        # Tech terms that should not be lemmatized
        NO_LEMMA = {"pandas", "keras", "redis", "postgres", "aws", "gcp", "serverless"}

        if self.nlp:
            try:
                doc = self.nlp(cleaned)
                tokens = []
                for token in doc:
                    if token.is_stop or token.is_punct or token.is_space:
                        continue
                    
                    text_lower = token.text.lower().strip()
                    if text_lower in NO_LEMMA:
                        lemma = text_lower
                    else:
                        lemma = token.lemma_.lower().strip()
                    
                    if len(lemma) > 1:
                        tokens.append(lemma)
                return tokens
            except Exception:
                pass

        # Fallback
        tokens = cleaned.split()
        result = []
        for t in tokens:
            t_stripped = t.strip("(),;:!?\"'")
            if t_stripped and t_stripped not in self.stop_words and len(t_stripped) > 1:
                result.append(t_stripped)
        return result

    def get_clean_string(self, text: str) -> str:
        """Return a single whitespace-joined string of processed tokens."""
        return " ".join(self.tokenize_and_lemmatize(text))

def preprocess_text(text: str) -> str:
    """Convenience function for text preprocessing."""
    return TextPreprocessor().get_clean_string(text)
