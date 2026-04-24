from typing import List, Set

class SuggestionGenerator:
    @staticmethod
    def generate_suggestions(resume_keywords: List[str], jd_keywords: List[str]) -> List[str]:
        resume_set = set(resume_keywords)
        jd_set = set(jd_keywords)
        
        missing = jd_set - resume_set
        
        suggestions = []
        if missing:
            suggestions.append(f"Incorporate missing core competencies: {', '.join(list(missing)[:5])}.")
        
        if len(resume_keywords) < 50:
            suggestions.append("Expand your technical profile with more quantified achievements.")
            
        if not any(k in resume_set for k in ['leadership', 'managed', 'led', 'strategic']):
            suggestions.append("Enhance leadership indicators to improve management matching.")
            
        return suggestions[:4]

    @staticmethod
    def get_missing_keywords(resume_keywords: List[str], jd_keywords: List[str]) -> List[str]:
        return list(set(jd_keywords) - set(resume_keywords))[:10]

    @staticmethod
    def get_matched_keywords(resume_keywords: List[str], jd_keywords: List[str]) -> List[str]:
        return list(set(jd_keywords) & set(resume_keywords))[:10]
