import { openai } from "./openAi";

export const getSpecialtiesFromSymptoms = async (symptoms: string): Promise<string[]> => {
    console.log("Asking AI for relevant specialties...");
    const prompt = `
    Based on the following symptoms: "${symptoms}".
    List the top 3 most relevant medical specialties.
    Return ONLY a JSON array of strings.
    Example: ["Cardiology", "General Medicine", "Pulmonology"]
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: 'z-ai/glm-4.5-air:free',
            messages: [
                {
                    role: "system",
                    content: "You are a medical expert. You extract relevant medical specialties from patient symptoms. You only return JSON arrays.",
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.2, 
        });

        const resultText = completion.choices[0].message.content;
        
        if (resultText) {
            const parsedResult = JSON.parse(resultText);
            if (Array.isArray(parsedResult) && parsedResult.every(item => typeof item === 'string')) {
                return parsedResult as string[];
            }
        }
        return []; 

    } catch (error) {
        console.error("Error getting specialties from AI:", error);
        return []; 
    }
}