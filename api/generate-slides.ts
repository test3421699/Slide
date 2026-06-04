import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
    return;
  }

  try {
    const { topic, slideCount, vibe } = req.body;

    if (!topic || !topic.trim()) {
      res.status(400).json({ error: "Topic, outline, or text content is required" });
      return;
    }

    const count = parseInt(slideCount) || 5;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error: "GEMINI_API_KEY is not configured. Please set the GEMINI_API_KEY in your Vercel Project Environment Variables."
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-vercel',
        }
      }
    });

    const prompt = `Create a professional presentation slide deck of exactly ${count} slides on the following topic or source material:
"${topic}"

The theme/vibe of the slides is: "${vibe || 'modern'}".

For each slide, provide:
1. A slide title (short, punchy).
2. Bullet points (exactly 3 to 5 high-impact bullet items).
3. A beautiful theme-matching background hex code.
4. A boolean field indicating whether the background is dark (isDark: true) or light (isDark: false) so we can adjust the text color to maintain perfect accessibility contrast.
5. In presenterNotes, write 1-2 paragraphs of speaker notes for this slide, detailing what the presenter should say, how to explain the bullet points naturally, guidelines for transitions, or context. (Keep details engaging and helpful).

Ensure that the slides have a logical storytelling arc:
- Slide 1: Introduction, title, and initial hook
- Middle slides: Cohesive subtopics, insights, analysis, details, or sequential steps to cover the main prompt comprehensively. Since count is ${count} slides, pace the contents nicely without piling too much on individual slides.
- Slide outline for high slide counts (10 to 20 slides): Build a thorough structure starting with introduction and table of contents, then dive into specific aspects of the topic incrementally, finishing with a takeaways slide and thank you / Q&A slide.

Vibe-specific guidelines for background colors:
- 'creative-vibrant': Stunning deep emerald, crimson, indigo, terracotta, or amethyst (e.g., #0D1B2A, #2D1A47, #3D1C1C, #1B3B2B). Keep matches professional.
- 'minimal-light': Serene off-whites, neutral creams, or softest pastels (e.g., #F8FAFC, #FAF9F6, #FFFDF9, #F4F4F5, #F5EFEB, #EFF6FF).
- 'sleek-dark': Tech slate, obsidian, rich charcoal, deep blue, or warm blacks (e.g., #0F172A, #111827, #0B0F19, #1C1A27).
- 'corporate-blue': Deep reliable navy darks or sophisticated clinical light blues (e.g., #1E3A8A, #0F2042, #EBF3FC, #1E293B).
- 'cyber-retro': Darkest neon space, obsidian-purple, deep retro tech blue (e.g., #0B0014, #050510, #120121, #08101F).
- 'sand-warm': Calming desert beige, terracotta clay, soft sun peach, toasted sand or light warm earth (e.g., #FAF0E6, #F4ECE1, #FFFDF0, #EAE5D9, #E4D5C5, #EAE5D9).
- 'slate-clean': Professional warm charcoal slate or technical ash grey (e.g., #1E293B, #0F172A, #FAF9F6, #E2E8F0, #F1F5F9).
- 'emerald-green': Soft leaf greens, lush botanical dark shades, or organic premium mint (e.g., #051F14, #0B3C2C, #F4FAF6, #E8F3ED, #1E3129).

Let the background colors vary subtly between slides to create a rhythmic pacing, but ensure cohesive styling.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite slide designer. You translate complex raw details or loose topics into structured, visual, clear slide presentations in JSON format with speaker notes.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            presentationTitle: {
              type: Type.STRING,
              description: "The title of the overall presentation"
            },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "The heading or main topic of this slide"
                  },
                  bulletPoints: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING
                    },
                    description: "3 to 5 concise executive bullet points"
                  },
                  backgroundColor: {
                    type: Type.STRING,
                    description: "A hex code string representing a beautiful background color. Ensure it includes the '#' sign."
                  },
                  isDark: {
                    type: Type.BOOLEAN,
                    description: "Whether the background color demands light text (true) or dark text (false) for high legibility."
                  },
                  presenterNotes: {
                    type: Type.STRING,
                    description: "Engaging 1-2 paragraph speaker notes for the presenter on this slide"
                  }
                },
                required: ["title", "bulletPoints", "backgroundColor", "isDark", "presenterNotes"]
              }
            }
          },
          required: ["presentationTitle", "slides"]
        }
      }
    });

    const responseText = response.text || "";
    let data;
    try {
      data = JSON.parse(responseText.trim());
    } catch (err) {
      console.error("Failed to parse JSON response:", responseText);
      res.status(500).json({ error: "Failed to generate structured slides JSON. Please try again." });
      return;
    }

    res.status(200).json(data);
  } catch (error: any) {
    console.error("Vercel backend serverless error:", error);
    res.status(500).json({ error: error.message || "Something went wrong on the serverless side." });
  }
}
