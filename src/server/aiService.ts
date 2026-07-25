/**
 * RecoverPath - Gemini AI Service (Server-side)
 * Handles zero-typing crisis intervention grounding, caregiver emergency script generation,
 * educational content reformulation, and safety plan co-creation.
 */
import { GoogleGenAI, Type } from '@google/genai';
import { 
  CrisisInterventionRequest, 
  CrisisInterventionResponse, 
  CaregiverScriptRequest, 
  CaregiverScriptResponse, 
  SafetyPlan,
  EducationArticle
} from '../types.js';

let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiInstance && process.env.GEMINI_API_KEY) {
    try {
      aiInstance = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.error('Failed to initialize GoogleGenAI client:', err);
    }
  }
  return aiInstance;
}

export class AIService {
  /**
   * Generates a zero-typing crisis intervention response tailored to the individual's current status and safety plan.
   */
  static async generateCrisisIntervention(
    req: CrisisInterventionRequest,
    safetyPlan?: SafetyPlan
  ): Promise<CrisisInterventionResponse> {
    const ai = getAiClient();
    const isHighRisk = req.safetyStatus === 'in_danger' || req.feeling === 'just_used';

    const systemInstruction = `You are a warm, trauma-informed, voice-optimized crisis response guide for someone experiencing a substance use disorder (SUD) craving or emergency.
Your output must be calm, direct, and zero-clutter. The user has extremely high cognitive load right now.

Instructions:
1. Speak directly to the user in second person ("You are safe right now", "Take a slow breath").
2. NEVER mention drug dosages or administration instructions.
3. Keep grounding text under 60 words so it can be spoken easily aloud via Text-to-Speech.
4. Return exact JSON format matching the schema.`;

    const userPrompt = `Generate crisis grounding instructions.
Context:
- Safety status: ${req.safetyStatus}
- Current feeling/trigger: ${req.feeling}
${req.voiceNote ? `- Voice note transcript: "${req.voiceNote}"` : ''}
${safetyPlan ? `- Stored Coping Strategies: ${safetyPlan.copingStrategies.join(', ')}` : ''}
${safetyPlan ? `- Stored Reasons To Stay Sober: ${safetyPlan.reasonsToStaySober.join(', ')}` : ''}
- Time of day: ${req.timeOfDay || new Date().toLocaleTimeString()}`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                groundingTitle: { type: Type.STRING },
                groundingText: { type: Type.STRING },
                actionSteps: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING } 
                },
                empathyNote: { type: Type.STRING },
                audioPromptText: { type: Type.STRING }
              },
              required: ['groundingTitle', 'groundingText', 'actionSteps', 'empathyNote', 'audioPromptText']
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return {
            id: `crisis_res_${Date.now()}`,
            timestamp: new Date().toISOString(),
            isHighRisk,
            groundingTitle: parsed.groundingTitle || 'Take a Calm Breath',
            groundingText: parsed.groundingText || 'You are in a safe space right now. Breathe in slowly through your nose for 4 seconds, hold for 4, and release.',
            actionSteps: parsed.actionSteps || [
              'Inhale deeply for 4 seconds, exhale for 6',
              'Hold an ice cube or splash cold water on your wrists',
              'Tap below to connect with your support contact'
            ],
            empathyNote: parsed.empathyNote || 'This wave feels heavy, but it will peak and pass in minutes. You are not alone.',
            audioPromptText: parsed.audioPromptText || parsed.groundingText,
            contactNotified: false
          };
        }
      } catch (err) {
        console.error('Error generating crisis intervention via Gemini API, using safety fallback:', err);
      }
    }

    // Safety Fallback Response (guarantees zero broken screens even without API key)
    return {
      id: `crisis_fallback_${Date.now()}`,
      timestamp: new Date().toISOString(),
      isHighRisk,
      groundingTitle: req.feeling === 'craving' ? 'Ride the Neurochemical Wave' : 'Focus on Your Immediate Breath',
      groundingText: 'Pause for 10 seconds. Drop your shoulders away from your ears. Feel your feet firmly planted on the floor. You are safe in this present moment.',
      actionSteps: [
        'Place one hand on your belly and breathe in for 4 seconds, out for 6',
        'Hold an ice cube or run cool water over your wrists to reset your nervous system',
        safetyPlan?.copingStrategies[0] || 'Tap below to alert your primary support contact'
      ],
      empathyNote: 'Cravings are temporary chemical signals that peak and fall. You do not have to act on this sensation.',
      audioPromptText: 'Pause for ten seconds. Drop your shoulders. Breathe in slowly. You are safe in this present moment.',
      contactNotified: false
    };
  }

  /**
   * Generates a personalized, de-escalating emergency script for caregivers to read aloud to a loved one.
   */
  static async generateCaregiverScript(
    req: CaregiverScriptRequest,
    userTriggers?: string[]
  ): Promise<CaregiverScriptResponse> {
    const ai = getAiClient();

    const systemInstruction = `You are a trauma-informed clinical specialist guiding a caregiver (e.g. parent, spouse, sibling) through a high-stress crisis moment with a loved one in recovery or active SUD.
The caregiver needs a practical, line-by-line script they can read out loud right now.

Instructions:
1. Tone: Calm, grounding, firm yet loving, non-confrontational.
2. Opening line must reduce immediate defensiveness.
3. "doSay" array must contain 3 exact, speakable statements.
4. "avoidSaying" array must contain 3 common triggering phrases that provoke anger or panic.
5. "escalationLine" must state clearly when to dial 988 or 911.
6. NO dosage, drug sourcing, or clinical diagnosis language.`;

    const prompt = `Generate an emergency de-escalation script for a caregiver.
Context:
- Caregiver Relationship: ${req.relationship}
- Situation: ${req.situation}
${userTriggers && userTriggers.length > 0 ? `- Known Individual Triggers: ${userTriggers.join(', ')}` : ''}`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                openingLine: { type: Type.STRING },
                doSay: { type: Type.ARRAY, items: { type: Type.STRING } },
                avoidSaying: { type: Type.ARRAY, items: { type: Type.STRING } },
                escalationLine: { type: Type.STRING },
                closingLine: { type: Type.STRING }
              },
              required: ['openingLine', 'doSay', 'avoidSaying', 'escalationLine', 'closingLine']
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return {
            id: `script_${Date.now()}`,
            situation: req.situation,
            openingLine: parsed.openingLine,
            doSay: parsed.doSay,
            avoidSaying: parsed.avoidSaying,
            escalationLine: parsed.escalationLine,
            closingLine: parsed.closingLine,
            timestamp: new Date().toISOString()
          };
        }
      } catch (err) {
        console.error('Error generating caregiver script via Gemini API:', err);
      }
    }

    // Fallback caregiver script
    return {
      id: `script_fallback_${Date.now()}`,
      situation: req.situation,
      openingLine: `"I love you, I see that you are going through a hard moment, and I am here with you right now with zero judgment."`,
      doSay: [
        `"You don't have to figure everything out right now. Let's just sit down together."`,
        `"I am not here to argue or lecture. I am here because your health and safety matter to me."`,
        `"We can take this one minute at a time."`
      ],
      avoidSaying: [
        `"How could you do this after everything we've done for you?" (Induces intense guilt and flight response)`,
        `"You promised you were done!" (Accusatory, shuts down honesty)`,
        `"You are ruining your life." (Increases panic and hopelessness)`
      ],
      escalationLine: `If they become uncommunicative, show signs of respiratory distress, or express suicidal intent, call 988 or 911 immediately.`,
      closingLine: `"I am standing right here with you. We will get through this hour together."`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Reformulates educational articles for high-cognitive-load states or specific formats.
   */
  static async reformulateArticle(
    article: EducationArticle,
    mode: 'one_sentence' | 'teenager' | 'crisis_50_words' | 'caregiver_summary'
  ): Promise<{ title: string; reformulatedText: string; mode: string }> {
    const ai = getAiClient();

    const modePrompts = {
      one_sentence: 'Summarize the core evidence-based insight of this article into exactly ONE clear, powerful sentence.',
      teenager: 'Explain the concepts in this article in an accessible, relatable, simple way suitable for a 16-year-old or young adult.',
      crisis_50_words: 'Condense this article into under 50 words for someone currently under severe stress or in a craving state.',
      caregiver_summary: 'Extract the top actionable takeaways specifically for a parent or caregiver supporting someone in recovery.'
    };

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: `Article Title: ${article.title}\nArticle Body:\n${article.fullText}\n\nTask: ${modePrompts[mode]}`,
          config: {
            systemInstruction: 'You are an expert addiction medicine educator reformulating medical and recovery content clearly and accurately.'
          }
        });

        if (response.text) {
          return {
            title: `${article.title} (${mode.replace('_', ' ').toUpperCase()})`,
            reformulatedText: response.text.trim(),
            mode
          };
        }
      } catch (err) {
        console.error('Error reformulating article via Gemini API:', err);
      }
    }

    // Fallback summary
    return {
      title: article.title,
      reformulatedText: article.summary,
      mode
    };
  }

  /**
   * AI-assisted co-creation for calm-state Safety Plans.
   */
  static async suggestSafetyPlanIdeas(
    userProfile: { primarySubstance?: string; triggers?: string }
  ): Promise<{ warningSigns: string[]; copingStrategies: string[]; reasonsToStaySober: string[] }> {
    const ai = getAiClient();

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: `Suggest personalized, practical safety plan entries for someone recovering from ${userProfile.primarySubstance || 'Substance Use Disorder'}.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                warningSigns: { type: Type.ARRAY, items: { type: Type.STRING } },
                copingStrategies: { type: Type.ARRAY, items: { type: Type.STRING } },
                reasonsToStaySober: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['warningSigns', 'copingStrategies', 'reasonsToStaySober']
            }
          }
        });

        if (response.text) {
          return JSON.parse(response.text.trim());
        }
      } catch (err) {
        console.error('Error suggesting safety plan ideas via Gemini API:', err);
      }
    }

    return {
      warningSigns: [
        'Feeling unexplained physical restlessness and pacing',
        'Isolating from daily check-ins or leaving messages unread',
        'Romanticizing past substance use memories'
      ],
      copingStrategies: [
        '3 cycles of 4-7-8 breathing',
        'Holding an ice cube in hand for 30 seconds (sensory reset)',
        'Calling primary support contact or sponsor'
      ],
      reasonsToStaySober: [
        'Mental clarity and waking up without fear or guilt',
        'Protecting relationships with loved ones',
        'Achieving long-term career and life goals'
      ]
    };
  }
}
