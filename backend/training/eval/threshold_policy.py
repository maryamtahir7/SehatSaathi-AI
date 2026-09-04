from dataclasses import dataclass
from typing import Dict


@dataclass
class ConfidencePolicy:
    high_threshold: float = 0.90
    moderate_threshold: float = 0.75

    def band(self, confidence: float) -> str:
        if confidence >= self.high_threshold:
            return "high"
        if confidence >= self.moderate_threshold:
            return "moderate"
        return "uncertain"

    def recommendation(self, confidence: float) -> str:
        confidence_band = self.band(confidence)
        if confidence_band == "high":
            return "AI confidence is high, but clinical confirmation is still required."
        if confidence_band == "moderate":
            return "AI confidence is moderate. Re-upload a higher quality scan and seek specialist review."
        return "AI confidence is uncertain. Do not rely on this prediction without immediate specialist review."

    def as_dict(self) -> Dict:
        return {
            "high_threshold": self.high_threshold,
            "moderate_threshold": self.moderate_threshold,
            "uncertain_threshold": self.moderate_threshold,
        }
