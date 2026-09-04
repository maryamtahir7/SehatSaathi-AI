/**
 * Central configuration for the Python backend API URL.
 * Defaults to the production Hugging Face Spaces URL if env var is missing.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://maryam3654-sehatsaathi-backend.hf.space';

export const apiEndpoints = {
  // Disease prediction
  symptoms: `${API_URL}/symptoms`,
  predictDisease: `${API_URL}/predict-disease`,
  recommendations: (disease: string) => `${API_URL}/recommendations/${encodeURIComponent(disease)}`,

  // Medical imaging
  analyzeMedicalImage: `${API_URL}/analyze-medical-image`,

  // Skin analysis
  analyzeSkin: `${API_URL}/api/medical/skin/analyze`,
  skinStatus: `${API_URL}/api/medical/skin/status`,

  // Prescription OCR
  scanPrescription: `${API_URL}/scan-prescription`,

  // AI Assistant (Groq)
  assistantChat: `${API_URL}/api/assistant/chat`,

  // Pharmacy
  medicineSearch: (q: string) => `${API_URL}/medicines/search?q=${encodeURIComponent(q)}`,
  checkout: `${API_URL}/checkout`,

  // Health check
  healthDeps: `${API_URL}/health/dependencies`,
};
