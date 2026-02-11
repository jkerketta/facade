import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

function buildFallbackSuggestions(
	name: string,
	tone: string,
	background_info: string
) {
	const text = `${name} ${tone} ${background_info}`.toLowerCase();

	let interests = ["social media", "lifestyle", "creator economy"];
	if (text.includes("fitness") || text.includes("health")) {
		interests = ["fitness", "wellness", "healthy habits"];
	} else if (text.includes("tech") || text.includes("ai")) {
		interests = ["technology", "innovation", "digital trends"];
	} else if (text.includes("travel")) {
		interests = ["travel", "adventure", "culture"];
	} else if (text.includes("food")) {
		interests = ["food", "recipes", "restaurants"];
	} else if (text.includes("fashion") || text.includes("beauty")) {
		interests = ["fashion", "style", "beauty"];
	}

	return {
		goals: [
			"grow a loyal audience",
			"publish consistent high-quality content",
			"build brand partnerships",
		],
		audience_age_range: [18, 34],
		audience_gender: "all",
		audience_interests: interests,
		audience_region: "North America",
		fallback: true,
	};
}

export async function POST(req: NextRequest) {
	const body = await req.json();
	const { name, tone, background_info } = body;

	if (!name || !tone || !background_info) {
		return NextResponse.json(
			{ error: "Missing required fields: name, tone, background_info" },
			{ status: 400 }
		);
	}

	if (!genAI) {
		console.log("GEMINI_API_KEY not found, using fallback");
		return NextResponse.json(
			buildFallbackSuggestions(name, tone, background_info)
		);
	}

	const prompt = `
    Given the following AI influencer profile:
    - Name: ${name}
    - Tone: ${tone}
    - Background/Mission: ${background_info}

    Generate a detailed target audience and a set of primary goals for this influencer.
    Return ONLY a valid JSON object with the following structure. Do not include markdown formatting or extra text.
    {
      "goals": ["string", "string", "string"],
      "audience_age_range": [number, number],
      "audience_gender": "all" | "male" | "female" | "other",
      "audience_interests": ["string", "string", "string"],
      "audience_region": "North America" | "Europe" | "Asia" | "South America" | "Africa" | "Australia" | "Other"
    }
  `;

	try {
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
		const result = await model.generateContent(prompt);
		const response = await result.response;
		let text = response.text();

		// Clean up markdown code blocks if present
		text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");

		const suggestions = JSON.parse(text);

		return NextResponse.json(suggestions);
	} catch (error) {
		console.error("Gemini API call failed:", error);
		return NextResponse.json(
			buildFallbackSuggestions(name, tone, background_info)
		);
	}
}
