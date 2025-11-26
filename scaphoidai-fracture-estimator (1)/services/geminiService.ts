
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PatientData, PredictionResult, Gender, InjuryMechanism } from "../types";

const apiKey = process.env.API_KEY || '';

const getAI = () => new GoogleGenAI({ apiKey });

const predictionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    probability: {
      type: Type.NUMBER,
      description: "Estimated probability of a true scaphoid fracture (0-100).",
    },
    riskLevel: {
      type: Type.STRING,
      enum: ["Low", "Moderate", "High"],
      description: "Categorical risk level.",
    },
    reasoning: {
      type: Type.STRING,
      description: "Brief clinical reasoning explaining the score based on symptoms like ASBT, STT, and LCT.",
    },
    recommendation: {
      type: Type.STRING,
      description: "Clinical recommendation (e.g., 'Discharge with advice', 'Splint and refer to fracture clinic', 'Urgent MRI').",
    },
    clinicalRuleReference: {
      type: Type.STRING,
      description: "Reference to a clinical rule used if applicable (e.g., 'Amsterdam Scaphoid Rule').",
    }
  },
  required: ["probability", "riskLevel", "reasoning", "recommendation"],
};

export const analyzePatientRisk = async (data: PatientData): Promise<PredictionResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }

  const ai = getAI();
  const modelId = "gemini-2.5-flash"; 

  const prompt = `
    You are an expert orthopedic consultant and AI model specializing in wrist trauma.
    Analyze the following patient data to estimate the probability of a TRUE scaphoid fracture.
    
    Use established clinical decision rules (like the Amsterdam Scaphoid Fracture Rule or similar validated heuristics) to weight the symptoms.
    
    Patient Data:
    - Age: ${data.age}
    - Gender: ${data.gender}
    - Mechanism of Injury: ${data.injuryMechanism}
    - Time since injury: ${data.hoursSinceInjury} hours
    - Anatomical Snuffbox Tenderness (ASBT): ${data.snuffboxTenderness ? 'Positive' : 'Negative'}
    - Scaphoid Tubercle Tenderness (STT): ${data.tubercleTenderness ? 'Positive' : 'Negative'}
    - Longitudinal Compression of Thumb Pain (LCT): ${data.thumbCompressionPain ? 'Positive' : 'Negative'}
    - Pain on Ulnar Deviation: ${data.ulnarDeviationPain ? 'Positive' : 'Negative'}
    - Swelling visible: ${data.swelling ? 'Yes' : 'No'}
    - Reported Grip Strength Loss: ${data.gripStrengthLoss ? 'Yes' : 'No'}

    Provide a probability percentage (0-100), a risk classification, concise reasoning, and a next-step recommendation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: predictionSchema,
        temperature: 0.2, 
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text) as PredictionResult;
    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze patient data. Please try again.");
  }
};

export const analyzeBatch = async (count: number = 5): Promise<Array<PatientData & { result: PredictionResult }>> => {
    // Generate synthetic batch
    const results: Array<PatientData & { result: PredictionResult }> = [];
    
    for (let i = 0; i < count; i++) {
        const isFracture = Math.random() > 0.5;
        const baseProb = isFracture ? 0.7 : 0.2;
        
        const data: PatientData = {
            age: Math.floor(Math.random() * 50) + 15,
            gender: Math.random() > 0.5 ? Gender.Male : Gender.Female,
            injuryMechanism: Math.random() > 0.3 ? InjuryMechanism.FallOnOutstretchedHand : InjuryMechanism.SportsInjury,
            hoursSinceInjury: Math.floor(Math.random() * 24),
            snuffboxTenderness: Math.random() < baseProb,
            tubercleTenderness: Math.random() < (isFracture ? 0.6 : 0.3),
            thumbCompressionPain: Math.random() < (isFracture ? 0.5 : 0.2),
            ulnarDeviationPain: Math.random() < 0.4,
            swelling: Math.random() < (isFracture ? 0.5 : 0.2),
            gripStrengthLoss: Math.random() < (isFracture ? 0.7 : 0.3),
        };

        // We run these sequentially to avoid rate limits in this demo, though parallel is possible
        try {
            const result = await analyzePatientRisk(data);
            results.push({ ...data, result });
        } catch (e) {
            console.error("Batch error", e);
        }
    }
    return results;
}
