import { GoogleGenAI, GenerateContentResponse, Type, ThinkingLevel } from "@google/genai";

export const MASTER_PROMPT = `You are BharatMind AI — an AI-native Business OS.
# 🌌 PHILOSOPHY: Minimal surface. Maximum intelligence.
# 🧠 ENGINE: Analyze Revenue, Expenses, Profit, Growth. Detect Trends & Threats.
# 📊 OUTPUT: Return structured JSON for metrics, charts, growth, and insights.
# ⚠️ RULES: No hallucinations. Data-backed only. Profit-focused. Concise.`;

export function improvePrompt(query: string) {
  if (!query || query.length < 5) {
    return "Provide a full business health summary with insights and forecast.";
  }
  return query;
}

function getApiKey() {
  const key = process.env.GEMINI_API_KEY || '';
  if (!key) {
    console.warn('GEMINI_API_KEY is missing from environment.');
  }
  return key;
}

export async function analyzeData(query: string, dataContext: any) {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const userQuery = `User Query: ${query}\n\nDATA:\n${JSON.stringify(dataContext)}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: userQuery,
    config: {
      systemInstruction: MASTER_PROMPT,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          metrics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                value: { type: Type.STRING },
                trend: { type: Type.STRING },
                isPositive: { type: Type.BOOLEAN }
              },
              required: ["name", "value", "trend", "isPositive"]
            }
          },
          revenue_radar: {
            type: Type.OBJECT,
            properties: {
              chart: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.ARRAY, items: { type: Type.STRING } },
                  y: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                  predicted: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                },
                required: ["x", "y", "predicted"]
              },
              alerts: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["chart", "alerts"]
          },
          growth_engine: {
            type: Type.OBJECT,
            properties: {
              marketing: {
                type: Type.OBJECT,
                properties: {
                  strategy: { type: Type.STRING },
                  action: { type: Type.STRING },
                  impact: { type: Type.STRING }
                },
                required: ["strategy", "action", "impact"]
              },
              pricing: {
                type: Type.OBJECT,
                properties: {
                  strategy: { type: Type.STRING },
                  action: { type: Type.STRING },
                  impact: { type: Type.STRING }
                },
                required: ["strategy", "action", "impact"]
              },
              product: {
                type: Type.OBJECT,
                properties: {
                  strategy: { type: Type.STRING },
                  action: { type: Type.STRING },
                  impact: { type: Type.STRING }
                },
                required: ["strategy", "action", "impact"]
              }
            },
            required: ["marketing", "pricing", "product"]
          },
          competitor_analysis: {
            type: Type.OBJECT,
            properties: {
              market_share: {
                type: Type.OBJECT,
                properties: {
                  us: { type: Type.NUMBER },
                  competitor_a: { type: Type.NUMBER },
                  others: { type: Type.NUMBER }
                },
                required: ["us", "competitor_a", "others"]
              },
              threats: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    level: { type: Type.STRING },
                    action: { type: Type.STRING }
                  },
                  required: ["name", "level", "action"]
                }
              }
            },
            required: ["market_share", "threats"]
          },
          insights: { type: Type.ARRAY, items: { type: Type.STRING } },
          actions: { type: Type.ARRAY, items: { type: Type.STRING } },
          whatsapp_campaign: { type: Type.STRING },
          error: { type: Type.STRING },
          missing_fields: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function fixSQL(sql: string, error: string, userIntent: string, schemaContext?: string) {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Fix the SQLite SQL query based on the error.
    
    Error: ${error}
    Original SQL: ${sql}
    User Intent: ${userIntent}
    ${schemaContext ? `\nAVAILABLE COLUMNS in uploaded_data: ${schemaContext}` : ''}
    
    Return ONLY the corrected SQL query string. No markdown, no explanation.`,
    config: {
      systemInstruction: "You are a SQL Debugging AI. Only return corrected SQL. Use SQLite syntax.",
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
    }
  });

  return response.text.trim().replace(/```sql|```/g, '');
}

export async function generateAIResponse(prompt: string) {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
    }
  });
  return response.text;
}

export async function generateBusinessInsightStream(prompt: string, context: string, tier: string, onChunk: (chunk: string) => void, dataContext?: any) {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const contents = `Context: ${context}, Tier: ${tier}\n\nPrompt: ${prompt}${dataContext ? `\n\nDATA CONTEXT: ${JSON.stringify(dataContext)}` : ''}`;
  
  const response = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents,
    config: {
      systemInstruction: MASTER_PROMPT,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
    }
  });

  for await (const chunk of response) {
    onChunk(chunk.text || '');
  }
}

export async function generateDecision(query: string, context: any) {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Query: ${query}\n\nContext: ${JSON.stringify(context)}`,
    config: {
      systemInstruction: MASTER_PROMPT,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          insight: { type: Type.STRING, description: "What is happening?" },
          reason: { type: Type.STRING, description: "Why is it happening?" },
          action: { type: Type.STRING, description: "What should the business do?" },
          impact: { type: Type.STRING, description: "Expected outcome (% or qualitative)" },
          summary: { type: Type.STRING },
          risks: { type: Type.ARRAY, items: { type: Type.STRING } },
          forecast: { type: Type.STRING }
        },
        required: ["insight", "reason", "action", "impact"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function runAgent(agent: any, input: string, context: any) {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const systemInstruction = `You are ${agent.name}, acting as ${agent.role}. 
  Your instructions: ${agent.instructions}
  
  You have access to: ${agent.dataAccess?.join(', ') || 'General Business Data'}.
  Current Business Context: ${JSON.stringify(context)}
  
  Respond as a proactive AI agent. Be concise and actionable.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: input,
    config: {
      systemInstruction,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
    }
  });

  return response.text;
}

export async function generateSQLAndInsight(query: string, schemaContext: string) {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `User Query: ${query}\n\nSchema Context:\n${schemaContext}`,
    config: {
      systemInstruction: `${MASTER_PROMPT}\n\nYour task is to generate a SQL query to answer the user query and provide a brief business insight based on the query intent.`,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sql: { type: Type.STRING, description: "The SQL query to execute." },
          insight: { type: Type.STRING, description: "A brief business insight related to the query." },
          explanation: { type: Type.STRING, description: "A short explanation of what the SQL query does." }
        },
        required: ["sql", "insight"]
      }
    }
  });

  return JSON.parse(response.text);
}
