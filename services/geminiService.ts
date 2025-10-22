
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getMedicationInfo = async (medicationName: string): Promise<string> => {
  if (!API_KEY) {
    return "O recurso de informações sobre medicamentos está desativado. A chave da API não foi configurada.";
  }
  
  try {
    const prompt = `Forneça um resumo simples e de fácil compreensão para uma pessoa idosa sobre o medicamento "${medicationName}". Explique em português claro e com parágrafos curtos:
1.  **Para que serve:** Qual a principal finalidade deste medicamento?
2.  **Como tomar:** Dicas gerais de como deve ser tomado (ex: com água, após refeições), sem prescrever uma dose.
3.  **Possíveis efeitos colaterais comuns:** Liste 2 ou 3 efeitos colaterais comuns de forma simples.

Termine com a seguinte frase obrigatória: "Importante: Esta é apenas uma informação geral. Sempre siga as orientações do seu médico e leia a bula."

Não forneça aconselhamento médico. O tom deve ser informativo, calmo e muito fácil de ler. Use negrito para destacar os títulos.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching medication info from Gemini:", error);
    return "Desculpe, não foi possível buscar as informações sobre este medicamento no momento. Por favor, tente novamente mais tarde.";
  }
};
