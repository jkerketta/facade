import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const payload = await req.json();

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
		const networkErrors: string[] = [];

		for (const candidate of backendCandidates) {
			try {
				const attempted = await fetch(`${candidate}/sorcerer/init`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
				response = attempted;
				break;
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Unknown network error";
				networkErrors.push(`${candidate}: ${message}`);
			}
		}

		if (!response) {
			const now = new Date().toISOString();
			const fallbackInfluencer = {
				id: Date.now(),
				name: payload?.name || "New Influencer",
				face_image_url: payload?.face_image_url || "",
				persona: {
					background: payload?.background_info || "",
					goals: payload?.goals || [],
					tone: payload?.tone || "casual",
				},
				mode: payload?.mode || "lifestyle",
				audience_targeting: {
					age_range: payload?.audience_age_range || [18, 35],
					gender: payload?.audience_gender || "all",
					interests: payload?.audience_interests || [],
					region: payload?.audience_region || "North America",
				},
				growth_phase_enabled: Boolean(payload?.growth_phase_enabled),
				growth_intensity:
					typeof payload?.growth_intensity === "number"
						? payload.growth_intensity
						: 0.5,
				posting_frequency: payload?.posting_frequency || null,
				is_active: true,
				created_at: now,
				updated_at: now,
				local_only: true,
				warning: `Backend API unreachable (${networkErrors.join(" | ") || "connection failed"})`,
			};
			return NextResponse.json(fallbackInfluencer);
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
						`Backend /sorcerer/init failed with status ${response.status}.`,
				},
				{ status: response.status }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Sorcerer init proxy route failed:", error);
		return NextResponse.json(
			{ error: "Launch route failed before reaching backend." },
			{ status: 500 }
		);
	}
}
