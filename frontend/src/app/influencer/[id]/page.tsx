"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import React, { useEffect, useState, useCallback } from "react";
import "react-calendar/dist/Calendar.css";
import AddPostModal from "@/components/modals/AddPostModal";
import ContentTimeline from "@/components/shared/ContentTimeline";
import ScheduleCalendar from "@/components/shared/ScheduleCalendar";
import DivineIntervention from "@/components/DivineIntervention";
import PostDetailsModal from "@/components/modals/PostDetailsModal";

// Define video and influencer types based on API response
interface Video {
	video_id: number;
	schedule_id: number;
	scheduled_time: string;
	content_type: "story" | "reel" | "post";
	status: string;
	caption: string;
	hashtags: string[];
	is_active: boolean;
	has_sponsor: boolean;
}

interface Influencer {
	id: number;
	name: string;
	face_image_url: string;
	life_story: string | null;
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
}

const MADDIE_BACKGROUND =
	"fitness influencer that is making daily transformation, diet and gym content";

const isMaddie = (name?: string) =>
	typeof name === "string" && name.trim().toLowerCase() === "maddie";

const buildMaddieFitnessVideos = (): Video[] => {
	const today = new Date();
	const videos: Video[] = [];
	for (let i = 0; i < 7; i++) {
		const day = new Date(today);
		day.setDate(today.getDate() + i);
		const baseId = i * 10;

		// For EXACTLY "today" (i === 0), we want exactly 2 REELS.
		if (i === 0) {
			// Reel 1: Morning
			const reel1Time = new Date(day);
			reel1Time.setHours(9, 0, 0, 0); // 9 AM
			videos.push({
				video_id: baseId + 1,
				schedule_id: baseId + 1,
				scheduled_time: reel1Time.toISOString(),
				content_type: "reel",
				status: "scheduled",
				caption: "Kickstarting the day! 🏃‍♀️✨ #MorningGrind",
				hashtags: ["fitness", "morningroutine", "gymlife"],
				is_active: true,
				has_sponsor: false,
			});

			// Reel 2: Evening
			const reel2Time = new Date(day);
			reel2Time.setHours(18, 0, 0, 0); // 6 PM
			videos.push({
				video_id: baseId + 3, // Keep ID distinct
				schedule_id: baseId + 3,
				scheduled_time: reel2Time.toISOString(),
				content_type: "reel",
				status: "scheduled",
				caption: "Wrapping up the daily goals. 💪 #NoExcuses",
				hashtags: ["workout", "transformation", "goals"],
				is_active: true,
				has_sponsor: false,
			});
			continue;
		}

		// Other days: Keep original pattern (Reel -> Story -> Reel)
		const morning = new Date(day);
		morning.setHours(7, 0, 0, 0);
		const lunch = new Date(day);
		lunch.setHours(12, 30, 0, 0);
		const evening = new Date(day);
		evening.setHours(18, 0, 0, 0);

		videos.push(
			{
				video_id: baseId + 1,
				schedule_id: baseId + 1,
				scheduled_time: morning.toISOString(),
				content_type: "reel",
				status: "scheduled",
				caption: "Morning transformation check-in and progress update.",
				hashtags: ["fitness", "transformation", "dailyprogress"],
				is_active: true,
				has_sponsor: false,
			},
			{
				video_id: baseId + 2,
				schedule_id: baseId + 2,
				scheduled_time: lunch.toISOString(),
				content_type: "story",
				status: "scheduled",
				caption: "Diet content: high-protein meal prep and macro split.",
				hashtags: ["diet", "nutrition", "mealprep"],
				is_active: true,
				has_sponsor: false,
			},
			{
				video_id: baseId + 3,
				schedule_id: baseId + 3,
				scheduled_time: evening.toISOString(),
				content_type: "reel",
				status: "scheduled",
				caption: "Gym session of the day with form and intensity notes.",
				hashtags: ["gym", "workout", "training"],
				is_active: true,
				has_sponsor: false,
			}
		);
	}
	return videos;
};

const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		{...props}
	>
		<path d='m15 18-6-6 6-6' />
	</svg>
);

const Section = ({
	children,
	className,
	delay = 0,
}: {
	children: React.ReactNode;
	className?: string;
	delay?: number;
}) => (
	<div
		className={`animate-reveal ${className}`}
		style={{ animationDelay: `${delay}ms` }}
	>
		{children}
	</div>
);

const InfluencerProfilePage = () => {
	const params = useParams();
	const router = useRouter();
	const [influencer, setInfluencer] = useState<Influencer | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedDateForPost, setSelectedDateForPost] = useState<Date | null>(
		null
	);
	const [isPostDetailsModalOpen, setIsPostDetailsModalOpen] = useState(false);
	const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
	const [viewMode, setViewMode] = useState<"timeline" | "calendar">(
		"timeline"
	);

	const loadLocalInfluencer = (influencerId: string): Influencer | null => {
		if (typeof window === "undefined") return null;
		try {
			const raw = localStorage.getItem("localInfluencers");
			const list = raw ? JSON.parse(raw) : [];
			if (!Array.isArray(list)) return null;
			const match = list.find(
				(item: any) => String(item?.id) === String(influencerId)
			);
			if (!match) return null;
			const maddie = isMaddie(match.name);
			return {
				id: Number(match.id),
				name: match.name || "Local Influencer",
				face_image_url:
					match.face_image_url ||
					"https://api.dicebear.com/7.x/bottts/svg?seed=local-profile",
				life_story: match.life_story || null,
				persona: {
					background: maddie
						? MADDIE_BACKGROUND
						: match.persona?.background || "",
					goals: match.persona?.goals || [],
					tone: match.persona?.tone || "casual",
				},
				mode: match.mode || "lifestyle",
				audience_targeting: {
					age_range: match.audience_targeting?.age_range || [18, 35],
					gender: match.audience_targeting?.gender || "all",
					interests: match.audience_targeting?.interests || [],
					region: match.audience_targeting?.region || "North America",
				},
				growth_phase_enabled: Boolean(match.growth_phase_enabled),
				growth_intensity:
					typeof match.growth_intensity === "number"
						? match.growth_intensity
						: 0.5,
				posting_frequency: match.posting_frequency || null,
				is_active: true,
				created_at: match.created_at || new Date().toISOString(),
				updated_at: match.updated_at || new Date().toISOString(),
				videos: maddie
					? buildMaddieFitnessVideos()
					: match.videos || [],
				followers: maddie
					? "3"
					: match.followers || `${(Math.random() * 5).toFixed(1)}M`,
				engagement:
					match.engagement || `${(Math.random() * 5).toFixed(2)}%`,
				local_only: true,
			};
		} catch {
			return null;
		}
	};

	const fetchInfluencerData = useCallback(async () => {
		const influencerIdParam = params.id;
		const influencerId = Array.isArray(influencerIdParam)
			? influencerIdParam[0]
			: influencerIdParam;
		if (!influencerId) {
			setLoadError("Missing influencer id.");
			setIsLoading(false);
			return;
		}
		setIsLoading(true);
		setLoadError(null);

		try {
			const influencerRes = await fetch(
				`/api/backend/influencer/${influencerId}`
			);
			if (!influencerRes.ok) {
				const localFallback = loadLocalInfluencer(String(influencerId));
				if (localFallback) {
					setInfluencer(localFallback);
				} else {
					setInfluencer(null);
					setLoadError("Influencer profile is unavailable.");
				}
				return;
			}
			const influencerData: Influencer = await influencerRes.json();

			const videoRes = await fetch(
				`/api/backend/influencer/${influencerId}/videos`
			);
			let videos: Video[] = [];
			if (videoRes.ok) {
				const videoData = await videoRes.json();
				if (videoData.videos && videoData.videos.length > 0) {
					videos = videoData.videos;
				}
			}

			const fullInfluencerData: Influencer = {
				...influencerData,
				videos,
				followers: `${(Math.random() * 5).toFixed(1)}M`,
				engagement: `${(Math.random() * 5).toFixed(2)}%`,
			};
			if (isMaddie(fullInfluencerData.name)) {
				fullInfluencerData.followers = "3";
				fullInfluencerData.persona = {
					...fullInfluencerData.persona,
					background: MADDIE_BACKGROUND,
				};
				fullInfluencerData.videos = buildMaddieFitnessVideos();
			}

			setInfluencer(fullInfluencerData);
		} catch (error) {
			console.error("Error fetching influencer data:", error);
			const localFallback = loadLocalInfluencer(String(influencerId));
			if (localFallback) {
				setInfluencer(localFallback);
			} else {
				setInfluencer(null);
				setLoadError("Network error while loading profile.");
			}
		} finally {
			setIsLoading(false);
		}
	}, [params.id]);

	useEffect(() => {
		fetchInfluencerData();
	}, [fetchInfluencerData]);

	const handlePostClick = (video: Video) => {
		setSelectedVideo(video);
		setIsPostDetailsModalOpen(true);
	};

	const handleAddPost = (date: Date) => {
		setSelectedDateForPost(date);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedDateForPost(null);
	};

	const handleScheduleSubmit = async (postData: any) => {
		if (!influencer) return;
		if (influencer.local_only) {
			alert(
				"This influencer is local-only right now. Start backend connectivity to schedule posts."
			);
			return;
		}

		const payload = {
			...postData,
			video_params: {
				...postData.video_params,
				influencer_id: influencer.id,
			},
		};

		try {
			const response = await fetch("/api/backend/schedule", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (response.ok) {
				alert("Post scheduled successfully!");
				handleCloseModal();
				await fetchInfluencerData();
			} else {
				const error = await response.json();
				alert(
					`Failed to schedule post: ${error.detail || "Unknown error"
					}`
				);
			}
		} catch (error) {
			console.error("Error scheduling post:", error);
			alert("An error occurred while scheduling the post.");
		}
	};

	if (isLoading) {
		return (
			<div className='w-screen h-screen bg-white flex items-center justify-center text-black'>
				<p>Loading...</p>
			</div>
		);
	}
	if (!influencer) {
		return (
			<div className='w-screen h-screen bg-white flex flex-col items-center justify-center text-black gap-4'>
				<p>{loadError || "Profile not found."}</p>
				<button
					onClick={() => router.push("/")}
					className='px-4 py-2 border border-black/30 hover:bg-black/5'
				>
					Back to Home
				</button>
			</div>
		);
	}

	const scheduleByDay = (influencer.videos || []).reduce(
		(acc: Record<string, any[]>, video: any) => {
			const date = new Date(video.scheduled_time)
				.toISOString()
				.split("T")[0];
			if (!acc[date]) {
				acc[date] = [];
			}
			acc[date].push({
				type: video.content_type,
				time: new Date(video.scheduled_time).toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				}),
				description: video.caption,
			});
			return acc;
		},
		{}
	);

	return (
		<div className='min-h-screen bg-white text-black overflow-x-hidden'>
			<div className='hidden absolute inset-0 z-0'>
				<Image
					src={influencer.face_image_url}
					alt={influencer.name}
					layout='fill'
					className='object-cover opacity-10 blur-3xl scale-150'
				/>
				<div className='absolute inset-0 bg-gradient-to-b from-black/10 via-black/60 to-transparent' />
				<div className='absolute inset-0 bg-[url(/grid.svg)] opacity-5' />
			</div>

			<main className='relative z-10 p-8 md:p-12 lg:p-16'>
				<header className='flex items-center justify-between mb-16 md:mb-24 animate-fade-in-down'>
					<button
						onClick={() => router.back()}
						className='p-2 hover:bg-black/5 transition-colors flex items-center gap-2 text-sm uppercase tracking-widest'
					>
						<ChevronLeftIcon className='w-5 h-5' />
						<span>Directory</span>
					</button>
					<p className='border border-black/20 px-3 py-1 text-sm font-medium uppercase tracking-widest'>
						{influencer.mode} Mode
					</p>
				</header>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-16'>
					{/* Left Column */}
					<div className='lg:col-span-1 space-y-16'>
						<Section delay={0}>
							<div className='relative w-full h-[60vh] max-h-[700px] min-h-[500px] bg-black/5'>
								<Image
									src={influencer.face_image_url}
									alt={influencer.name}
									fill
									className='object-cover'
								/>
							</div>
							<div className='mt-6'>
								<p className='text-black/60 text-lg'>
									@
									{influencer.name
										.toLowerCase()
										.replace(/\\s+/g, "")}
								</p>
								<h1 className='text-6xl md:text-8xl font-bold tracking-tighter uppercase break-words'>
									{influencer.name}
								</h1>
							</div>
						</Section>

						<Section
							delay={200}
							className='border-y border-black/10 py-8'
						>
							<h2 className='text-sm text-black/50 uppercase tracking-widest mb-4'>
								Audience Profile
							</h2>
							<div className='space-y-4'>
								<div className='flex justify-between items-baseline'>
									<span className='text-black/70'>
										Region:
									</span>
									<span className='font-mono'>
										{influencer.audience_targeting.region}
									</span>
								</div>
								<div className='flex justify-between items-baseline'>
									<span className='text-black/70'>
										Gender:
									</span>
									<span className='font-mono'>
										{influencer.audience_targeting.gender}
									</span>
								</div>
								<div className='flex justify-between items-baseline'>
									<span className='text-black/70'>
										Age Range:
									</span>
									<span className='font-mono'>
										{
											influencer.audience_targeting
												.age_range[0]
										}
										-
										{
											influencer.audience_targeting
												.age_range[1]
										}
									</span>
								</div>
								<div className='pt-4'>
									<h3 className='text-black/70 mb-2'>
										Interests:
									</h3>
									<div className='flex flex-wrap gap-2'>
										{influencer.audience_targeting.interests.map(
											(interest) => (
												<span
													key={interest}
													className='px-2 py-1 bg-black/5 border border-black/10 text-xs'
												>
													{interest}
												</span>
											)
										)}
									</div>
								</div>
							</div>
						</Section>

						<Section delay={300}>
							<h2 className='text-sm text-black/50 uppercase tracking-widest mb-4'>
								Persona
							</h2>
							<p className='text-black/80 leading-relaxed font-light'>
								{influencer.persona.background}
							</p>
						</Section>
					</div>

					{/* Right Column */}
					<div className='lg:col-span-2 space-y-16'>
						<Section
							delay={100}
							className='grid grid-cols-1 md:grid-cols-2 gap-8 border-y border-black/10 py-8'
						>
							<div className='text-center'>
								<h3 className='text-sm text-black/50 uppercase tracking-widest mb-2'>
									Followers
								</h3>
								<p className='text-6xl font-light tracking-tighter'>
									{influencer.followers}
								</p>
							</div>
							<div className='text-center'>
								<h3 className='text-sm text-black/50 uppercase tracking-widest mb-2'>
									Engagement
								</h3>
								<p className='text-6xl font-light tracking-tighter'>
									{influencer.engagement}
								</p>
							</div>
						</Section>

						{influencer.life_story && (
							<Section delay={400}>
								<div className='flex items-center justify-center gap-4 mb-4'>
									<h2 className='text-sm text-black/50 uppercase tracking-widest'>
										Life Story
									</h2>
									<DivineIntervention
										influencerId={influencer.id}
										onIntervention={fetchInfluencerData}
									/>
								</div>
								<p className='text-black/70 leading-loose whitespace-pre-wrap text-lg font-light border-y border-black/10 py-8 px-4'>
									{influencer.life_story}
								</p>
							</Section>
						)}

						<Section delay={500}>
							<div className='flex justify-between items-center mb-4'>
								<h2 className='text-sm text-black/50 uppercase tracking-widest'>
									Content Plan
								</h2>
								<div className='flex items-center border border-black/20'>
									<button
										onClick={() => setViewMode("timeline")}
										className={`px-3 py-1 text-xs uppercase transition-colors duration-200 ease-in-out ${viewMode === "timeline"
												? "bg-white text-black"
												: "bg-transparent text-black/50 hover:bg-black/5"
											}`}
									>
										Timeline
									</button>
									<button
										onClick={() => setViewMode("calendar")}
										className={`px-3 py-1 text-xs uppercase transition-colors duration-200 ease-in-out ${viewMode === "calendar"
												? "bg-white text-black"
												: "bg-transparent text-black/50 hover:bg-black/5"
											}`}
									>
										Calendar
									</button>
								</div>
							</div>
							{viewMode === "timeline" ? (
								<ContentTimeline
									videos={influencer.videos || []}
									onAddPost={handleAddPost}
									onPostClick={handlePostClick}
								/>
							) : (
								<div className='bg-black/20 p-2'>
									<ScheduleCalendar
										schedule={scheduleByDay}
										onAddPost={handleAddPost}
									/>
								</div>
							)}
						</Section>
					</div>
				</div>
			</main>

			{selectedDateForPost && (
				<AddPostModal
					isOpen={isModalOpen}
					onClose={handleCloseModal}
					onSubmit={handleScheduleSubmit}
					date={selectedDateForPost}
				/>
			)}

			<PostDetailsModal
				isOpen={isPostDetailsModalOpen}
				onClose={() => setIsPostDetailsModalOpen(false)}
				video={selectedVideo}
			/>

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
					animation: fade-in-down 0.6s 0.3s ease-out forwards;
					opacity: 0;
				}

				@keyframes reveal {
					from {
						opacity: 0;
						transform: translateY(40px) scale(0.98);
					}
					to {
						opacity: 1;
						transform: translateY(0) scale(1);
					}
				}
				.animate-reveal {
					animation: reveal 0.8s cubic-bezier(0.22, 1, 0.36, 1)
						forwards;
					opacity: 0;
				}
			`}</style>
		</div>
	);
};

export default InfluencerProfilePage;
