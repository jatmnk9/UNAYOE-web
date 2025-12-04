"""
Alert service for detecting severe keywords and sending alerts
"""
import unicodedata
from typing import Dict, Optional

# Severe keywords and phrases that trigger alerts
SEVERE_KEYWORDS = {
    "morir", "muerte", "muerto", "suicidio", "suicidarme", "suicidar",
    "lastimarme", "lastimar", "herirme", "herir", "quitarme la vida",
    "autolesion", "auto lesion", "autolesionarme", "cortarme", "matar"
}

SEVERE_PHRASES = {
    "no tengo ganas de vivir",
    "no quiero vivir",
    "me quiero morir",
}


class AlertService:
    """Service for alert detection and risk assessment"""
    
    @staticmethod
    def normalize_text(text: str) -> str:
        """Normalize text by removing accents and converting to lowercase"""
        if not text:
            return ""
        text = text.strip().lower()
        text = unicodedata.normalize('NFD', text)
        text = ''.join(ch for ch in text if unicodedata.category(ch) != 'Mn')
        return text
    
    @staticmethod
    def contains_severe_keywords(text: str) -> bool:
        """
        Check if text contains severe keywords or phrases
        
        Args:
            text: Text to check
            
        Returns:
            True if severe keywords/phrases are found
        """
        normalized_text = AlertService.normalize_text(text)
        
        # Check phrases first (longer patterns)
        for phrase in SEVERE_PHRASES:
            if AlertService.normalize_text(phrase) in normalized_text:
                return True
        
        # Check individual keywords
        normalized_keywords = {AlertService.normalize_text(kw) for kw in SEVERE_KEYWORDS}
        words = normalized_text.split()
        for word in words:
            if AlertService.normalize_text(word) in normalized_keywords:
                return True
        
        return False
    
    @staticmethod
    def is_sad_label(label: str) -> bool:
        """Check if emotion label indicates sadness"""
        if not label:
            return False
        label_norm = str(label).strip().lower()
        sadness_labels = {"tristeza", "sadness", "depresion", "depressed", "depressive"}
        return label_norm in sadness_labels
    
    @staticmethod
    def compute_sadness_risk(notes: list[Dict]) -> Dict:
        """
        Calculate sadness risk metrics from recent notes
        
        Args:
            notes: List of note dictionaries with 'emocion' and 'emocion_score'
            
        Returns:
            Dictionary with risk assessment metrics
        """
        if not notes:
            return {
                "count": 0,
                "sad_count": 0,
                "ratio": 0.0,
                "max_sad_score": 0.0,
                "latest_sad_score": 0.0,
                "risk_level": "none",
                "alert": False,
            }
        
        count = len(notes)
        sad_scores = []
        latest = notes[0]  # Assuming ordered by created_at desc
        latest_sad_score = (
            latest.get("emocion_score", 0.0) 
            if AlertService.is_sad_label(latest.get("emocion")) 
            else 0.0
        )
        
        for note in notes:
            if AlertService.is_sad_label(note.get("emocion")):
                sad_scores.append(float(note.get("emocion_score", 0.0)))
        
        sad_count = len(sad_scores)
        ratio = sad_count / count if count else 0.0
        max_sad_score = max(sad_scores) if sad_scores else 0.0
        
        # Risk heuristics:
        # - HIGH: latest note with sadness >= 0.9 OR (ratio >= 0.6 and >= 2 sad notes)
        # - MEDIUM: ratio >= 0.4 or max_sad_score >= 0.75
        # - LOW/NONE: otherwise
        if latest_sad_score >= 0.9 or (ratio >= 0.6 and sad_count >= 2):
            risk_level = "high"
        elif ratio >= 0.4 or max_sad_score >= 0.75:
            risk_level = "medium"
        elif ratio > 0:
            risk_level = "low"
        else:
            risk_level = "none"
        
        return {
            "count": count,
            "sad_count": sad_count,
            "ratio": round(ratio, 3),
            "max_sad_score": round(max_sad_score, 3),
            "latest_sad_score": round(latest_sad_score, 3),
            "risk_level": risk_level,
            "alert": risk_level == "high",
        }
    
    @staticmethod
    def get_alert_message(risk: Dict) -> str:
        """Get alert message based on risk level"""
        if risk["alert"]:
            return "ALERTA: alumno con posibles tendencias depresivas"
        elif risk["risk_level"] == "medium":
            return "Atención: señales moderadas de tristeza"
        elif risk["risk_level"] == "low":
            return "Leves señales de tristeza"
        else:
            return "Sin señales de tristeza"

