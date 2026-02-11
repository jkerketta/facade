import { NextRequest, NextResponse } from "next/server";

function getBackendCandidates(): string[] {
	const configuredBackend = process.env.BACKEND_URL?.trim();
	return Array.from(
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
}

async function forward(
	req: NextRequest,
	params: { path: string[] }
): Promise<NextResponse> {
	const routePath = (params.path || []).join("/");
	const search = req.nextUrl.search || "";
	const candidates = getBackendCandidates();
	const requestBody =
		req.method === "GET" || req.method === "HEAD"
			? undefined
			: await req.text();

	const networkErrors: string[] = [];

	for (const candidate of candidates) {
		try {
			const upstream = await fetch(`${candidate}/${routePath}${search}`, {
				method: req.method,
				headers: {
					"Content-Type": req.headers.get("content-type") || "application/json",
				},
				body: requestBody,
			});

			const contentType = upstream.headers.get("content-type") || "";
			const raw = await upstream.text();

			if (contentType.includes("application/json")) {
				try {
					const data = raw ? JSON.parse(raw) : {};
					return NextResponse.json(data, { status: upstream.status });
				} catch {
					return NextResponse.json(
						{ error: raw || "Invalid JSON response from backend." },
						{ status: upstream.status }
					);
				}
			}

			return new NextResponse(raw, {
				status: upstream.status,
				headers: {
					"Content-Type": contentType || "text/plain; charset=utf-8",
				},
			});
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unknown network error";
			networkErrors.push(`${candidate}: ${message}`);
		}
	}

	return NextResponse.json(
		{
			error: `Backend API unreachable (${networkErrors.join(" | ") || "connection failed"})`,
		},
		{ status: 502 }
	);
}

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	return forward(req, await params);
}

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	return forward(req, await params);
}

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	return forward(req, await params);
}

export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	return forward(req, await params);
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	return forward(req, await params);
}
