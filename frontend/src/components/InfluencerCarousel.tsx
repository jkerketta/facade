"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect, useCallback } from "react";

interface Influencer {
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
	followers?: string;
	engagement?: string;
}

type Props = {
	influencers: Influencer[];
	className?: string;
	onCardClick: (influencer: Influencer) => void;
};

const markerTextStyle: React.CSSProperties = {
	fontFamily:
		"Marker Felt, Bradley Hand, Chalkboard SE, Comic Sans MS, cursive",
	letterSpacing: "0.02em",
};

const InfluencerCarousel = ({
	influencers,
	className = "",
	onCardClick,
}: Props) => {
	const [rotation, setRotation] = useState(0);
	const [isDragging, setIsDragging] = useState(false);

	const isDraggingRef = useRef(false);
	const startXRef = useRef(0);
	const startRotationRef = useRef(0);
	const dragDistanceRef = useRef(0);
	const clickedInfluencerRef = useRef<Influencer | null>(null);
	const currentRotationRef = useRef(0);
	const targetRotationRef = useRef(0);
	const rafRef = useRef<number | null>(null);
	const lastMoveXRef = useRef(0);
	const lastMoveTimeRef = useRef(0);
	const velocityRef = useRef(0);

	const totalCards = influencers.length;
	const safeCardCount = Math.max(totalCards, 1);
	const angleStep = 360 / safeCardCount;
	const radius = 165 + safeCardCount * 38;

	const getClientX = (
		e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent
	) => ("touches" in e ? e.touches[0].clientX : e.clientX);

	const handleDragStart = useCallback(
		(e: React.MouseEvent | React.TouchEvent, influencer: Influencer) => {
			isDraggingRef.current = true;
			setIsDragging(true);
			startXRef.current = getClientX(e);
			startRotationRef.current = rotation;
			targetRotationRef.current = rotation;
			currentRotationRef.current = rotation;
			dragDistanceRef.current = 0;
			clickedInfluencerRef.current = influencer;
			lastMoveXRef.current = startXRef.current;
			lastMoveTimeRef.current = performance.now();
			velocityRef.current = 0;
			document.body.style.cursor = "grabbing";
			document.body.style.userSelect = "none";

			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}
		},
		[rotation]
	);

	const handleDragging = useCallback((e: MouseEvent | TouchEvent) => {
		if (!isDraggingRef.current) return;
		if ("touches" in e) e.preventDefault();

		const clientX = getClientX(e);
		const deltaX = clientX - startXRef.current;
		dragDistanceRef.current = Math.abs(deltaX);

		const sensitivity = 0.28;
		targetRotationRef.current = startRotationRef.current + deltaX * sensitivity;

		const now = performance.now();
		const dt = Math.max(now - lastMoveTimeRef.current, 1);
		const dx = clientX - lastMoveXRef.current;
		velocityRef.current = dx / dt;
		lastMoveXRef.current = clientX;
		lastMoveTimeRef.current = now;

		if (rafRef.current === null) {
			const animate = () => {
				const current = currentRotationRef.current;
				const target = targetRotationRef.current;
				const smoothed = current + (target - current) * 0.22;
				currentRotationRef.current = smoothed;
				setRotation(smoothed);
				if (Math.abs(target - smoothed) > 0.08 && isDraggingRef.current) {
					rafRef.current = requestAnimationFrame(animate);
				} else {
					rafRef.current = null;
				}
			};
			rafRef.current = requestAnimationFrame(animate);
		}
	}, []);

	const handleDragEnd = useCallback(() => {
		if (!isDraggingRef.current) return;

		if (dragDistanceRef.current < 10 && clickedInfluencerRef.current) {
			onCardClick(clickedInfluencerRef.current);
		}

		const inertiaDegrees = velocityRef.current * 120;
		const momentumRotation = targetRotationRef.current + inertiaDegrees;
		const snappedRotation =
			Math.round(momentumRotation / angleStep) * angleStep;

		currentRotationRef.current = snappedRotation;
		targetRotationRef.current = snappedRotation;
		setRotation(snappedRotation);
		isDraggingRef.current = false;
		setIsDragging(false);
		clickedInfluencerRef.current = null;
		document.body.style.cursor = "default";
		document.body.style.userSelect = "auto";

		if (rafRef.current) {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		}
	}, [angleStep, onCardClick]);

	useEffect(() => {
		window.addEventListener("mousemove", handleDragging);
		window.addEventListener("touchmove", handleDragging, { passive: false });
		window.addEventListener("mouseup", handleDragEnd);
		window.addEventListener("touchend", handleDragEnd);

		return () => {
			window.removeEventListener("mousemove", handleDragging);
			window.removeEventListener("touchmove", handleDragging);
			window.removeEventListener("mouseup", handleDragEnd);
			window.removeEventListener("touchend", handleDragEnd);
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}
		};
	}, [handleDragging, handleDragEnd]);

	if (totalCards === 0) {
		return (
			<div className={`relative w-full h-full ${className}`}>
				<div className='relative w-full h-full flex items-center justify-center text-white/50'>
					No influencers yet.
				</div>
			</div>
		);
	}

	return (
		<div className={`relative w-full h-full ${className}`}>
			{totalCards === 0 ? (
				<div className='relative w-full h-full flex items-center justify-center text-black/50'>
					No influencers yet.
				</div>
			) : (
				<div
					className='relative w-full h-full flex items-center justify-center'
					style={{ perspective: "2000px", transform: "scale(0.85)" }}
				>
					<div
						className={`relative w-[340px] h-[470px] ${
							isDragging
								? "transition-none"
								: "transition-transform duration-500 ease-out"
						}`}
						style={{
							transformStyle: "preserve-3d",
							transform: `rotateY(${rotation}deg)`,
						}}
					>
						{influencers.map((influencer, index) => {
							const cardRotation = index * angleStep;
							const effectiveRotation = rotation + cardRotation;
							const normalizedAngle =
								((effectiveRotation % 360) + 360) % 360;
							const angleDifference = Math.min(
								normalizedAngle,
								360 - normalizedAngle
							);
							const brightness = 1 - (angleDifference / 180) * 0.72;

							const followers = influencer.followers || "N/A";
							const engagement = influencer.engagement || "N/A";

							return (
								<div
									key={influencer.id}
									className='absolute w-full h-full cursor-grab active:cursor-grabbing'
									style={{
										transformStyle: "preserve-3d",
										transform: `rotateY(${cardRotation}deg) translateZ(${radius}px)`,
										filter: `brightness(${brightness})`,
										transition:
											"filter 0.3s ease-out, transform 0.3s ease-out",
									}}
									onMouseDown={(e) =>
										handleDragStart(e, influencer)
									}
									onTouchStart={(e) =>
										handleDragStart(e, influencer)
									}
								>
									<div className='relative h-full w-full bg-[#fcfcfa] border border-black/20 shadow-[0_18px_40px_rgba(0,0,0,0.25)] p-3 pb-20'>
										<div className='relative h-[336px] w-full bg-black overflow-hidden'>
											<Image
												fill
												alt={influencer.name}
												className='object-cover'
												src={influencer.face_image_url}
												draggable={false}
											/>
										</div>
										<div className='absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4'>
											<p
												className='text-[28px] leading-none text-black max-w-[58%] truncate'
												style={markerTextStyle}
											>
												{influencer.name}
											</p>
											<div
												className='text-[12px] text-black/75 text-right leading-tight'
												style={markerTextStyle}
											>
												<div>{followers}</div>
												<div>{engagement}</div>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
};

export default InfluencerCarousel;
