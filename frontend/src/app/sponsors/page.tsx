"use client";

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import AddSponsorModal from "@/components/modals/AddSponsorModal";
import { Search, Plus } from "lucide-react";

interface Sponsor {
	id: number;
	name: string;
	website: string;
	industry: string;
	sponsorship_tier: "Platinum" | "Gold" | "Silver" | string;
	status: "Active" | "Inactive" | string;
	created_at: string;
	updated_at: string;
}

const SponsorCard = ({
	sponsor,
	index,
}: {
	sponsor: Sponsor;
	index: number;
}) => {
	const initial = sponsor.name ? sponsor.name.charAt(0).toUpperCase() : "?";

	const tierStyles: { [key: string]: string } = {
		Platinum:
			"border-purple-400/50 bg-purple-900/50 text-purple-200 shadow-lg shadow-purple-500/20",
		Gold: "border-amber-400/50 bg-amber-900/50 text-amber-200 shadow-lg shadow-amber-500/20",
		Silver: "border-gray-400/50 bg-gray-900/50 text-gray-200 shadow-lg shadow-gray-500/20",
	};

	const statusStyles: { [key: string]: string } = {
		Active: "bg-green-500/10 text-green-400",
		Inactive: "bg-yellow-500/10 text-yellow-400",
	};

	const tierStyle =
		tierStyles[sponsor.sponsorship_tier] ||
		"border-gray-600/50 text-gray-400";
	const statusStyle =
		statusStyles[sponsor.status] || "bg-gray-500/10 text-gray-400";

	return (
		<div
			className='relative group bg-gradient-to-br from-white/5 to-white/0 p-6 rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-purple-400/50 hover:scale-105 hover:shadow-2xl hover:shadow-purple-900/50 animate-fade-in-up'
			style={{ animationDelay: `${index * 50}ms` }}
		>
			<div className='absolute inset-0 flex items-center justify-center'>
				<span className='text-[12rem] font-black text-white/5 opacity-50 transition-all duration-500 group-hover:opacity-100 group-hover:scale-125 group-hover:text-purple-400/10'>
					{initial}
				</span>
			</div>

			<div className='relative z-10 flex flex-col h-full'>
				<div className='flex-grow'>
					<div className='flex justify-between items-start'>
						<h2 className='font-bold text-2xl text-white tracking-tight'>
							{sponsor.name}
						</h2>
						<span
							className={`px-2 py-0.5 text-xs rounded-full ${statusStyle}`}
						>
							{sponsor.status}
						</span>
					</div>
					<a
						href={`http://${sponsor.website}`}
						target='_blank'
						rel='noopener noreferrer'
						className='text-purple-400 hover:text-purple-300 transition-colors text-sm block mt-1 font-mono'
					>
						{sponsor.website}
					</a>
					<p className='text-white/60 text-sm mt-4'>
						Industry: {sponsor.industry}
					</p>
				</div>

				<div className='mt-6 flex justify-between items-center pt-4 border-t border-white/10'>
					<span
						className={`px-3 py-1 text-xs font-bold rounded-full ${tierStyle}`}
					>
						{sponsor.sponsorship_tier}
					</span>
					<button className='text-xs bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-colors font-semibold'>
						Propose
					</button>
				</div>
			</div>
		</div>
	);
};

const SponsorsPage = () => {
	const [sponsors, setSponsors] = useState<Sponsor[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [fetchError, setFetchError] = useState<string | null>(null);

	const fetchSponsors = async () => {
		try {
			const response = await fetch("/api/backend/sponsors");
			if (!response.ok) {
				const body = await response.text();
				const fallbackMessage =
					response.status === 502
						? "backend is unreachable. start the backend server to load sponsors."
						: "failed to load sponsors.";
				setFetchError(
					body
						? `${fallbackMessage} (${response.status})`
						: fallbackMessage
				);
				setSponsors([]);
				return;
			}
			const data: Sponsor[] = await response.json();
			setSponsors(data);
			setFetchError(null);
		} catch (error) {
			console.error("Error fetching sponsors:", error);
			setFetchError(
				"could not load sponsors due to a network error. please try again."
			);
			setSponsors([]);
		}
	};

	useEffect(() => {
		fetchSponsors();
	}, []);

	const filteredSponsors = useMemo(() => {
		return sponsors.filter(
			(sponsor) =>
				sponsor.name
					?.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				sponsor.industry
					?.toLowerCase()
					.includes(searchTerm.toLowerCase())
		);
	}, [sponsors, searchTerm]);

	return (
		<main className='relative w-screen h-screen bg-white text-black overflow-hidden'>
			<video
				autoPlay
				muted
				loop
				playsInline
				className='absolute inset-0 h-full w-full object-cover'
			>
				<source src='/assets/background.mp4?v=20260211' type='video/mp4' />
			</video>
			<div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.52)_50%,rgba(255,255,255,0.72)_100%)]' />
			<div className='hidden starfield'></div>
			<div className='hidden absolute inset-0 z-0 bg-gradient-to-br from-[#1d1229] via-transparent to-[#12291d] opacity-50'></div>

			<div className='relative z-10 h-full flex flex-col'>
				<Navbar showAddButton={false} />
				<section className='w-full flex-1 flex flex-col items-center justify-center px-4 pb-8 pt-8 md:px-10 overflow-y-auto'>
					<header className='text-center w-full max-w-4xl mx-auto mb-10 md:mb-12'>
						<h1 className='text-5xl md:text-7xl font-bold tracking-tighter'>
							Strategic Partnerships
						</h1>
						<p className='text-black/60 mt-4 text-lg max-w-2xl mx-auto'>
							Curate and manage your network of brand collaborations.
							Leverage data-driven insights to align with partners that resonate with your audience demographics.
						</p>
					</header>

					<div className='w-full max-w-2xl mx-auto mb-10 md:mb-12'>
						<div className='scanner-container'>
							<Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/60 z-10' />
							<input
								type='text'
								placeholder='Search for brands, industries, or tiers...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='w-full bg-transparent py-3 pl-12 pr-4 text-black placeholder-black/50 focus:outline-none'
							/>
						</div>
					</div>

					<div className='w-full max-w-6xl mx-auto'>
						{fetchError && (
							<div className='mb-6 border border-black/20 bg-[#f3d4e6]/70 text-black/80 px-4 py-3 rounded-lg text-sm'>
								{fetchError}
							</div>
						)}
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
							{filteredSponsors.map((sponsor, index) => (
								<SponsorCard
									key={sponsor.id}
									sponsor={sponsor}
									index={index}
								/>
							))}
						</div>
						{filteredSponsors.length === 0 && (
							<div className='text-center py-16 animate-fade-in-up'>
								<p className='text-black/60 text-lg'>
									No partners found matching your criteria.
								</p>
							</div>
						)}
					</div>
				</section>
			</div>

			<button
				onClick={() => setIsModalOpen(true)}
				className='group fixed bottom-8 right-8 z-20 flex items-center justify-center'
			>
				<span className='absolute right-full mr-4 text-sm text-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap'>
					Add New Partner
				</span>
				<div className='relative w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center hover:scale-105 transition-transform duration-300'>
					<div className='absolute inset-0 bg-black/20 rounded-full animate-pulse-slow'></div>
					<Plus className='w-8 h-8 text-white' />
				</div>
			</button>

			<AddSponsorModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSponsorAdded={fetchSponsors}
			/>

			<style jsx>{`
				.scanner-container {
					position: relative;
					background-color: rgba(255, 255, 255, 0.8);
					backdrop-filter: blur(4px);
					border: 1px solid rgba(0, 0, 0, 0.2);
					padding: 2px;
				}
				.scanner-container::before,
				.scanner-container::after {
					content: "";
					position: absolute;
					width: 20px;
					height: 20px;
					border-color: rgba(192, 132, 252, 0.8);
					border-style: solid;
					transition: all 0.3s ease;
				}
				.scanner-container::before {
					top: -2px;
					left: -2px;
					border-width: 2px 0 0 2px;
				}
				.scanner-container::after {
					bottom: -2px;
					right: -2px;
					border-width: 0 2px 2px 0;
				}
				.scanner-container:focus-within::before,
				.scanner-container:focus-within::after {
					width: calc(100% + 2px);
					height: calc(100% + 2px);
				}

				@keyframes pulse-slow {
					0%,
					100% {
						transform: scale(1);
						opacity: 1;
					}
					50% {
						transform: scale(1.1);
						opacity: 0.7;
					}
				}

				.animate-pulse-slow {
					animation: pulse-slow 3s infinite ease-in-out;
				}

				.starfield {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background-image: radial-gradient(
							1px 1px at 20px 30px,
							#eee,
							rgba(0, 0, 0, 0)
						),
						radial-gradient(
							1px 1px at 40px 70px,
							#fff,
							rgba(0, 0, 0, 0)
						),
						radial-gradient(
							2px 2px at 50px 160px,
							#ddd,
							rgba(0, 0, 0, 0)
						),
						radial-gradient(
							2px 2px at 90px 40px,
							#fff,
							rgba(0, 0, 0, 0)
						),
						radial-gradient(
							1px 1px at 130px 80px,
							#fff,
							rgba(0, 0, 0, 0)
						),
						radial-gradient(
							2px 2px at 160px 120px,
							#ddd,
							rgba(0, 0, 0, 0)
						);
					background-repeat: repeat;
					background-size: 200px 200px;
					animation: move-stars 200s linear infinite;
					opacity: 0.5;
				}

				@keyframes move-stars {
					from {
						transform: translate(0, 0);
					}
					to {
						transform: translate(-1000px, -500px);
					}
				}

				@keyframes fade-in-up {
					from {
						opacity: 0;
						transform: translateY(20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				.animate-fade-in-up {
					opacity: 0;
					animation: fade-in-up 0.5s ease-out forwards;
				}

			`}</style>
		</main>
	);
};

export default SponsorsPage;
