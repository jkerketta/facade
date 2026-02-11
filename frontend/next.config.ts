import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "*", // Allow images from all domains
			},
			{
				protocol: "http",
				hostname: "*", // Allow images from all domains
			},
		],
	},
	devIndicators: false,
	async rewrites() {
		return [
			{
				source: "/api/backend/:path*",
				destination: "http://127.0.0.1:8000/:path*",
			},
			{
				source: "/docs",
				destination: "http://127.0.0.1:8000/docs",
			},
			{
				source: "/openapi.json",
				destination: "http://127.0.0.1:8000/openapi.json",
			},
		];
	},
};

export default nextConfig;
