import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { prompt } = await req.json();

		if (!prompt || typeof prompt !== "string") {
			return NextResponse.json(
				{ error: "Missing required field: prompt" },
				{ status: 400 }
			);
		}

		const configuredBackend = process.env.BACKEND_URL?.trim();
		const backendCandidates = Array.from(
			new Set(
				[
					configuredBackend,
					"http://127.0.0.1:8000",
					"http://localhost:8000",
					"http://host.docker.internal:8000",
					"http://backend:8000",
				].filter((value): value is string => Boolean(value))
			)
		);

		let response: Response | null = null;
		let backendBaseUrl = backendCandidates[0];
		const networkErrors: string[] = [];

		for (const candidate of backendCandidates) {
			try {
				const attempted = await fetch(`${candidate}/generate-image`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ prompt }),
				});
				response = attempted;
				backendBaseUrl = candidate;
				break;
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Unknown network error";
				networkErrors.push(`${candidate}: ${message}`);
			}
		}

		if (!response) {
			const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
			const geminiModel = (
				process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image"
			).trim();

			if (geminiApiKey) {
				const geminiResponse = await fetch(
					`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${encodeURIComponent(geminiApiKey)}`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							contents: [{ parts: [{ text: prompt }] }],
							generationConfig: {
								responseModalities: ["TEXT", "IMAGE"],
							},
						}),
					}
				);

				const geminiRaw = await geminiResponse.text();
				let geminiData: any = {};
				if (geminiRaw) {
					try {
						geminiData = JSON.parse(geminiRaw);
					} catch {
						geminiData = { error: geminiRaw };
					}
				}

				if (geminiResponse.ok) {
					const parts =
						geminiData?.candidates?.[0]?.content?.parts ||
						geminiData?.candidates?.[0]?.parts ||
						[];
					for (const part of parts) {
						const inlineData = part?.inlineData || part?.inline_data;
						if (!inlineData?.data) continue;
						const mimeType =
							inlineData.mimeType || inlineData.mime_type || "image/png";
						return NextResponse.json({
							image_url: `data:${mimeType};base64,${inlineData.data}`,
							fallback: false,
							fallback_reason:
								"Generated via direct Gemini call because backend was unreachable.",
						});
					}
				}
			}

			const seed = encodeURIComponent(prompt.slice(0, 64) || "avatar");
			return NextResponse.json({
				image_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`,
				fallback: true,
				fallback_reason: `Backend image service unreachable (${networkErrors.join(" | ") || "connection failed"})`,
			});
		}

		const raw = await response.text();
		let data: any = {};
		if (raw) {
			try {
				data = JSON.parse(raw);
			} catch {
				data = { error: raw };
			}
		}

		if (!response.ok) {
			return NextResponse.json(
				{
					error:
						data?.detail ||
						data?.error ||
						`Failed to generate image from backend (status ${response.status}).`,
				},
				{ status: response.status }
			);
		}

		const path = data?.path;
		const image_url =
			typeof path === "string" && path.startsWith("/")
				? `${backendBaseUrl}${path}`
				: undefined;

		return NextResponse.json({
			path,
			image_url,
			fallback: Boolean(data?.fallback),
			fallback_reason: data?.fallback_reason,
		});
	} catch (error) {
		console.error("Avatar proxy route failed:", error);
		const message =
			error instanceof Error && error.message
				? error.message
				: "Unknown route failure";
		const seed = encodeURIComponent(`error-${Date.now()}`);
		return NextResponse.json({
			image_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`,
			fallback: true,
			fallback_reason: `Avatar proxy error: ${message}`,
		});
	}
}
