"use client";

import InfluencerCarousel from "@/components/InfluencerCarousel";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import InfluencerDetailsSidebar from "@/components/InfluencerDetailsSidebar";
import { useRouter } from "next/navigation";

// Define video type based on API response
interface Video {
	video_id: number;
	schedule_id: number;
	scheduled_time: string;
	content_type: "story" | "reel";
	status: string;
	caption: string;
	hashtags: string[];
	is_active: boolean;
	has_sponsor: boolean;
}

// NEW: Separate types for summary and detailed views
interface InfluencerSummary {
	id: number;
	name: string;
	face_image_url: string;
	persona: {
		background: string;
		goals: string[];
		tone: string;
	};
	mode: string;
	audience_targeting: {
		age_range: [number, number];
		gender: string;
		interests: string[];
		region: string;
	};
	growth_phase_enabled: boolean;
	growth_intensity: number;
	posting_frequency: {
		story_interval_hours: number;
		reel_interval_hours: number;
	} | null;
	is_active: boolean;
	created_at: string;
	updated_at: string;
	videos?: Video[];
	followers?: string;
	engagement?: string;
	local_only?: boolean;
	warning?: string;
}

interface InfluencerDetails extends InfluencerSummary {
	life_story: string | null;
}

const MADDIE_BACKGROUND =
	"fitness influencer that is making daily transformation, diet and gym content";

const isMaddie = (name?: string) =>
	typeof name === "string" && name.trim().toLowerCase() === "maddie";

const Home = () => {
	const [influencers, setInfluencers] = useState<InfluencerSummary[]>([]);
	const [selectedInfluencer, setSelectedInfluencer] =
		useState<InfluencerDetails | null>(null);
	const [isExiting, setIsExiting] = useState(false);
	const router = useRouter();
	const loadLocalInfluencers = (): InfluencerSummary[] => {
		if (typeof window === "undefined") return [];
		try {
			const raw = localStorage.getItem("localInfluencers");
			const parsed = raw ? JSON.parse(raw) : [];
			if (!Array.isArray(parsed)) return [];
			return parsed.map((influencer: InfluencerSummary) =>
				isMaddie(influencer.name)
					? {
							...influencer,
							followers: "3",
							persona: {
								...influencer.persona,
								background: MADDIE_BACKGROUND,
							},
					  }
					: influencer
			);
		} catch {
			return [];
		}
	};

	const handleCardClick = async (influencer: InfluencerSummary) => {
		if (influencer.local_only) {
			const maddieOverride = isMaddie(influencer.name);
			setSelectedInfluencer({
				...(influencer as InfluencerDetails),
				persona: maddieOverride
					? {
							...influencer.persona,
							background: MADDIE_BACKGROUND,
					  }
					: influencer.persona,
				life_story: null,
				videos: influencer.videos || [],
				followers: maddieOverride
					? "3"
					: influencer.followers ||
					  `${(Math.random() * 5).toFixed(1)}M`,
				engagement:
					influencer.engagement ||
					`${(Math.random() * 5).toFixed(2)}%`,
			});
			return;
		}
		try {
			const response = await fetch(
				`/api/backend/influencer/${influencer.id}`
			);
			if (response.ok) {
				const fullInfluencerData: InfluencerDetails =
					await response.json();
				
				// Fetch videos for the selected influencer
				try {
					const videoResponse = await fetch(
						`/api/backend/influencer/${influencer.id}/videos`
					);
					if (videoResponse.ok) {
						const videoData = await videoResponse.json();
						if (videoData.videos && videoData.videos.length > 0) {
							fullInfluencerData.videos = videoData.videos;
						} else {
							fullInfluencerData.videos = [];
						}
					} else {
						fullInfluencerData.videos = [];
					}
				} catch (error) {
					console.error(`Failed to fetch videos for influencer ${influencer.id}`, error);
					fullInfluencerData.videos = [];
				}
				
				// Add random stats
				if (isMaddie(fullInfluencerData.name)) {
					fullInfluencerData.followers = "3";
					fullInfluencerData.persona = {
						...fullInfluencerData.persona,
						background: MADDIE_BACKGROUND,
					};
				} else {
					fullInfluencerData.followers = `${(Math.random() * 5).toFixed(1)}M`;
				}
				fullInfluencerData.engagement = `${(Math.random() * 5).toFixed(2)}%`;
				
				setSelectedInfluencer(fullInfluencerData);
			} else {
				console.error("Failed to fetch full influencer details");
			}
		} catch (error) {
			console.error("Error fetching influencer details:", error);
		}
	};

	const handleCloseSidebar = () => {
		setSelectedInfluencer(null);
	};

	const handleConnect = (influencerId: number) => {
		setIsExiting(true);
		setTimeout(() => {
			router.push(`/influencer/${influencerId}`);
		}, 500); // Match animation duration
	};

	const handleAddClick = () => {
		setIsExiting(true);
		setTimeout(() => {
			router.push("/create");
		}, 500); // Match animation duration
	};

	const handleFetchInfluencers = async () => {
		try {
			const response = await fetch(
				"/api/backend/influencers?skip=0&limit=100"
			);
			if (response.ok) {
				const influencersData = await response.json();

				const influencersWithVideos = await Promise.all(
					influencersData.map(
						async (influencer: InfluencerSummary) => {
							try {
								const videoResponse = await fetch(
									`/api/backend/influencer/${influencer.id}/videos`
								);
								if (videoResponse.ok) {
									const videoData =
										await videoResponse.json();
									if (
										videoData.videos &&
										videoData.videos.length > 0
									) {
										return {
											...influencer,
											videos: videoData.videos,
										};
									}
								}
								return { ...influencer, videos: [] }; // Ensure videos is not undefined
							} catch (error) {
								console.error(
									`Failed to fetch videos for influencer ${influencer.id}`,
									error
								);
								return { ...influencer, videos: [] }; // Ensure videos is not undefined
							}
						}
					)
				);

				const filteredInfluencers = influencersWithVideos
					.filter((i): i is InfluencerSummary => i !== null)
					.map((influencer) => ({
						...influencer,
						followers: isMaddie(influencer.name)
							? "3"
							: `${(Math.random() * 5).toFixed(1)}M`,
						engagement: `${(Math.random() * 5).toFixed(2)}%`,
						persona: isMaddie(influencer.name)
							? {
									...influencer.persona,
									background: MADDIE_BACKGROUND,
							  }
							: influencer.persona,
					}));

				setInfluencers(filteredInfluencers);
			} else {
				console.error("Failed to fetch influencers");
				const locals = loadLocalInfluencers();
				setInfluencers(locals);
			}
		} catch (error) {
			console.error("Error fetching influencers:", error);
			const locals = loadLocalInfluencers();
			setInfluencers(locals);
		}
	};

	useEffect(() => {
		handleFetchInfluencers();
	}, []);

	return (
		<main
			className={`relative w-screen h-screen overflow-hidden ${
				isExiting ? "animate-page-exit" : ""
			}`}
		>
			<video
				autoPlay
				muted
				loop
				playsInline
				className='absolute inset-0 h-full w-full object-cover'
			>
					<source src='/assets/background.mp4' type='video/mp4' />
			</video>
			<div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.52)_50%,rgba(255,255,255,0.72)_100%)]' />

			<div className='relative z-10 h-full flex flex-col'>
				<Navbar onAddClick={handleAddClick} />

				<section className='w-full h-full flex flex-col items-center justify-center px-4 pb-6 pt-8 md:px-10 md:pt-14'>
					<header
						className='text-center z-10 mb-8 animate-fade-in-down'
						style={{ animationDelay: "200ms" }}
					>
						<h1 className='text-5xl md:text-7xl font-black tracking-[-0.04em] uppercase text-black'>
							Meet Your Influencers
						</h1>
						<p className='mt-4 text-base md:text-lg max-w-2xl mx-auto text-black/70'>
							Create personas, craft facades, and launch social
							identities with a playful retro tone.
						</p>
					</header>
					<div
						className='w-full max-w-6xl flex-1 flex items-center justify-center animate-fade-in-up'
						style={{ animationDelay: "400ms" }}
					>
						<InfluencerCarousel
							influencers={influencers}
							onCardClick={handleCardClick}
						/>
					</div>
				</section>

				{selectedInfluencer && (
					<InfluencerDetailsSidebar
						influencer={selectedInfluencer}
						onClose={handleCloseSidebar}
						onConnect={handleConnect}
					/>
				)}
			</div>

			<style jsx>{`
				@keyframes fade-in-down {
					from {
						opacity: 0;
						transform: translateY(-20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				.animate-fade-in-down {
					animation: fade-in-down 0.8s ease-out forwards;
					opacity: 0;
				}

				@keyframes fade-in-up {
					from {
						opacity: 0;
						transform: translateY(30px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				.animate-fade-in-up {
					animation: fade-in-up 0.8s ease-out forwards;
					opacity: 0;
				}

				@keyframes page-exit {
					from {
						opacity: 1;
						transform: translateX(0);
					}
					to {
						opacity: 0;
						transform: translateX(-50px);
					}
				}
				.animate-page-exit {
					animation: page-exit 0.5s
						cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
				}
			`}</style>
		</main>
	);
};

export default Home;
