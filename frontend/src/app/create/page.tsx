"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Palette, Wand2 } from "lucide-react";
import "simplebar-react/dist/simplebar.min.css";
import Navbar from "@/components/Navbar";
import Step1ChooseType, {
	InfluencerType,
} from "@/components/creation-flow/Step1_ChooseType";
import Step2DefineIdentity from "@/components/creation-flow/Step2_DefineIdentity";
import Step2DefineAudience from "@/components/creation-flow/Step2_DefineAudience";
import Step2AvatarGeneration from "@/components/creation-flow/Step2_AvatarGeneration";
import Step3SetSchedule from "@/components/creation-flow/Step3SetSchedule";
import Step3CompanySchedule from "@/components/creation-flow/Step3_CompanySchedule";
import Step3GrowthAndSocials from "@/components/creation-flow/Step3_GrowthAndSocials";

const WizardStep = ({ children }: { children: React.ReactNode }) => (
	<motion.div
		initial={{ opacity: 0, x: 50 }}
		animate={{ opacity: 1, x: 0 }}
		exit={{ opacity: 0, x: -50 }}
		transition={{ duration: 0.3, ease: "easeInOut" }}
		className='w-full'
	>
		{children}
	</motion.div>
);

type Tone = "energetic" | "casual" | "professional";
type AudienceGender = "all" | "male" | "female" | "other";
type AudienceRegion =
	| "North America"
	| "Europe"
	| "Asia"
	| "South America"
	| "Africa"
	| "Australia"
	| "Other";

type FormData = {
	mode: InfluencerType;
	name: string;
	face_image_url: string;
	background_info: string;
	goals: string[];
	tone: Tone;
	audience_age_range: [number, number];
	audience_gender: AudienceGender;
	audience_interests: string[];
	audience_region: AudienceRegion;
	growth_phase_enabled: boolean;
	growth_intensity: number;
	instagram_username?: string;
	instagram_password?: string;
	schedule: any;
};

const CreateInfluencerPage = () => {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState<Partial<FormData>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleNext = () => setStep((prev) => prev + 1);
	const handleBack = () => setStep((prev) => prev - 1);

	const handleSelectType = (type: InfluencerType) => {
		setFormData({ ...formData, mode: type });
		handleNext();
	};

	const handleDefineIdentity = (data: Partial<FormData>) => {
		setFormData({ ...formData, ...data });
		handleNext();
	};

	const handleDefineAudience = (data: Partial<FormData>) => {
		setFormData({ ...formData, ...data });
		handleNext();
	};

	const handleAvatarSubmit = (data: {
		description: string;
		avatarUrl: string;
	}) => {
		setFormData({ ...formData, face_image_url: data.avatarUrl });
		handleNext();
	};

	const handleGrowthAndSocialsSubmit = (data: Partial<FormData>) => {
		setFormData({ ...formData, ...data });
		handleNext();
	};

	const handleSubmit = async (data: any) => {
		setIsSubmitting(true);
		try {
			const finalData = { ...formData, schedule: data };
			setFormData(finalData);

			const { schedule, ...apiPayloadBase } = finalData;
			const apiPayload: any = { ...apiPayloadBase };

			apiPayload.posting_frequency = {
				story_interval_hours: schedule.storyFrequencyHours,
				reel_interval_hours: schedule.postFrequencyHours,
			};

			const response = await fetch("/api/sorcerer-init", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(apiPayload),
			});

			const raw = await response.text();
			let responseData: any = {};
			if (raw) {
				try {
					responseData = JSON.parse(raw);
				} catch {
					responseData = { error: raw };
				}
			}
			if (!response.ok) {
				const errorMessage =
					responseData?.detail ||
					responseData?.error ||
					`Launch failed with status ${response.status}.`;
				alert(`Error creating influencer: ${errorMessage}`);
				return;
			}
			if (typeof window !== "undefined" && responseData?.local_only) {
				try {
					const key = "localInfluencers";
					const existing = JSON.parse(localStorage.getItem(key) || "[]");
					const merged = [responseData, ...existing].slice(0, 100);
					localStorage.setItem(key, JSON.stringify(merged));
				} catch (storageError) {
					console.error(
						"Failed to save local influencer fallback:",
						storageError
					);
				}
			}

			handleNext();
		} catch (error) {
			console.error("Failed to connect to API server.", error);
			const message =
				error instanceof Error && error.message
					? error.message
					: "Failed to connect to the API server. Please ensure it's running and accessible.";
			alert(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const mode = formData.mode;
	const stepLabels: Record<number, string> = {
		1: "type",
		2: "identity",
		3: "audience",
		4: "avatar",
		5: "growth",
		6: "schedule",
		7: "complete",
	};

	return (
		<main className='relative w-screen h-screen overflow-hidden bg-white text-black'>
			<div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.92)_55%,rgba(255,255,255,1)_100%)]' />
			<div className='absolute inset-0 bg-[radial-gradient(#00000010_1px,transparent_1px)] [background-size:32px_32px]' />

			{isSubmitting && (
				<div className='absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-50'>
					<svg
						className='animate-spin h-10 w-10 text-black mb-4'
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 24 24'
					>
						<circle
							className='opacity-25'
							cx='12'
							cy='12'
							r='10'
							stroke='currentColor'
							strokeWidth='4'
						></circle>
						<path
							className='opacity-75'
							fill='currentColor'
							d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
						></path>
					</svg>
					<h2 className='text-2xl font-bold text-black'>
						launching your influencer...
					</h2>
					<p className='text-black/70 mt-2'>
						please wait a moment, we're setting things up.
					</p>
				</div>
			)}

			<div className='relative z-10 h-full flex flex-col'>
				<Navbar showAddButton={false} />

				<section className='w-full flex-1 overflow-y-auto px-4 pb-8 pt-8 md:px-10 md:pt-12'>
					<header className='max-w-5xl mx-auto mb-8 text-center'>
						<div className='flex items-center justify-center gap-3 mb-3'>
							<div className='h-10 w-10 rounded-lg border-2 border-black/70 bg-[#f3d4e6] shadow-[2px_2px_0px_#111] flex items-center justify-center'>
								<Sparkles className='h-5 w-5 text-black' />
							</div>
							<div className='h-10 w-10 rounded-lg border-2 border-black/70 bg-[#d9ebff] shadow-[2px_2px_0px_#111] flex items-center justify-center'>
								<Palette className='h-5 w-5 text-black' />
							</div>
							<div className='h-10 w-10 rounded-lg border-2 border-black/70 bg-[#f0e7a9] shadow-[2px_2px_0px_#111] flex items-center justify-center'>
								<Wand2 className='h-5 w-5 text-black' />
							</div>
						</div>
						<h1 className='text-4xl md:text-6xl font-black tracking-[-0.04em] text-black'>
							new façade questionnaire
						</h1>
						<p className='mt-2 text-black/70'>
							step {Math.min(step, 7)} of 7: {stepLabels[Math.min(step, 7)]}
						</p>
					</header>

					<div className='max-w-5xl mx-auto border border-black/20 bg-white/78 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.12)]'>
						<AnimatePresence mode='wait'>
							{step === 1 && (
								<WizardStep key='step1'>
									<Step1ChooseType onSelectType={handleSelectType} />
								</WizardStep>
							)}
							{step === 2 && mode && (
								<WizardStep key='step2'>
									<Step2DefineIdentity
										influencerType={mode}
										onBack={handleBack}
										onSubmit={handleDefineIdentity}
									/>
								</WizardStep>
							)}
							{step === 3 && mode && (
								<WizardStep key='step3-audience'>
									<Step2DefineAudience
										name={formData.name || ""}
										tone={formData.tone || "casual"}
										background_info={formData.background_info || ""}
										onBack={handleBack}
										onSubmit={handleDefineAudience}
									/>
								</WizardStep>
							)}
							{step === 4 && (
								<WizardStep key='step4-avatar'>
									<Step2AvatarGeneration
										onBack={handleBack}
										onSubmit={handleAvatarSubmit}
										formData={formData}
									/>
								</WizardStep>
							)}
							{step === 5 && (
								<WizardStep key='step5-growth'>
									<Step3GrowthAndSocials
										onBack={handleBack}
										onSubmit={handleGrowthAndSocialsSubmit}
									/>
								</WizardStep>
							)}
							{step === 6 && mode === "lifestyle" && (
								<WizardStep key='step6-lifestyle-schedule'>
									<Step3SetSchedule
										influencerType={mode}
										onBack={handleBack}
										onSubmit={handleSubmit}
										isSubmitting={isSubmitting}
									/>
								</WizardStep>
							)}
							{step === 6 && mode === "company" && (
								<WizardStep key='step6-company-schedule'>
									<Step3CompanySchedule
										onBack={handleBack}
										onSubmit={handleSubmit}
									/>
								</WizardStep>
							)}
							{step === 7 && (
								<WizardStep key='step7'>
									<div className='text-center py-20 px-6'>
										<h1 className='text-3xl font-bold'>
											setup complete!
										</h1>
										<p className='text-black/60 mt-4'>
											your new influencer has been created.
										</p>
										<button
											onClick={() => router.push("/")}
											className='mt-8 px-8 py-3 bg-gradient-to-r from-[#f3d4e6] to-[#f0e7a9] border border-black/20 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity'
										>
											back to home
										</button>
									</div>
								</WizardStep>
							)}
						</AnimatePresence>
					</div>
				</section>
			</div>
		</main>
	);
};

export default CreateInfluencerPage;
