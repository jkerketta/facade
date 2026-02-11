import React, { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface Step2AvatarGenerationProps {
	onBack: () => void;
	onSubmit: (data: { description: string; avatarUrl: string }) => void;
	formData: any; // A more specific type is recommended
}

/**
 * Generates a descriptive prompt for an image generation model.
 */
function generateInstagramInfluencerPrompt({
	mode,
	name,
	physicalDescription,
	backgroundInfo,
	goals,
	tone,
	audienceAgeRange,
	audienceGender,
	audienceInterests,
	audienceRegion,
}: any): string {
	const goalsStr = goals?.join(", ") || "build a community";
	const interestsStr = audienceInterests?.join(", ") || "popular culture";

	return `Generate a realistic, high-quality Instagram influencer portrait of a ${mode || "lifestyle"
		} creator named ${name}.
They are described as: ${physicalDescription}.
Context/Background: ${backgroundInfo}.
Their main goals are to ${goalsStr}.
Render in a ${tone} tone and aesthetic.
Target audience: ages ${audienceAgeRange?.[0] || 18}–${audienceAgeRange?.[1] || 35
		}, gender "${audienceGender || "all"
		}", interests in ${interestsStr}, based in ${audienceRegion || "North America"
		}.
The image should be a close-up or medium shot, well-lit, and suitable for a social media profile picture.`;
}

const Step2AvatarGeneration: React.FC<Step2AvatarGenerationProps> = ({
	onBack,
	onSubmit,
	formData,
}) => {
	const REFERENCE_AVATAR_URL = "/assets/reference-avatar.png";
	const [physicalDescription, setPhysicalDescription] = useState("");
	const [avatarUrl, setAvatarUrl] = useState(REFERENCE_AVATAR_URL);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generationNotice, setGenerationNotice] = useState("");

	const handleGenerate = async () => {
		setIsGenerating(true);
		setGenerationNotice("");
		setAvatarUrl(""); // Clear previous avatar while generating

		try {
			// Construct prompt
			let prompt = physicalDescription;
			if (!prompt || prompt.trim() === "") {
				prompt = generateInstagramInfluencerPrompt(formData);
			}

			// Call API
			const response = await fetch("/api/backend/generate-image", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ prompt }),
			});

			if (!response.ok) {
				throw new Error("Image generation failed");
			}

			const data = await response.json();
			if (data.path) {
				// The backend returns a path like "/storage/images/..."
				// We need to make sure this is accessible.
				// Based on app.py: app.mount("/storage", StaticFiles(directory="storage"), name="storage")
				// And next.config.ts rewrites /api/backend => backend.
				// But static files are usually served directly.
				// The backend URL is http://127.0.0.1:8000.
				// If we use the rewrite, we might need a specific route for storage?
				// Actually, usually we'd need a proxy for storage too or just use the full URL if CORS allows.
				// For now, let's assume valid URL or proxy.
				// Wait, the backend returns `/storage/images/...`.
				// If we prepend `/api/backend`, it would go to `http://127.0.0.1:8000/storage/images/...`
				// BUT checking app.py: `app.mount("/storage", ...)` is at root.
				// So we need a rewrite rule for `/storage` as well in next.config.ts OR just use absolute URL.
				// Let's use absolute URL for simplicity for now? No, mixed content issues maybe?
				// Best to use a rewrite or just try `/api/backend` prefix if we adjust the rewrite?
				// Actually, let's just use the relative path returned and ensure there is a proxy.
				// I'll assume for this step I should just set the URL as returned,
				// and if it breaks I'll fix the routing in the next step.
				// However, to be safe, I will prepend `/api/backend` to the path if it starts with `/storage`
				// assuming that I can add a rewrite for it, or that I should simple hit the backend.
				// Let's try to hit `/api/backend/storage/...` -> `http://127.0.0.1:8000/storage/...`
				// BUT `app.mount("/storage")` is at the root of backend.
				// So `http://127.0.0.1:8000/storage/images/xyz.png` is valid.
				// My rewrite is `/api/backend/:path*` -> `http://127.0.0.1:8000/:path*`.
				// So `/api/backend/storage/images/xyz.png` -> `http://127.0.0.1:8000/storage/images/xyz.png`.
				// This matches perfectly!
				setAvatarUrl(`/api/backend${data.path}`);
			} else {
				throw new Error("No image path in response");
			}
		} catch (error) {
			console.error("Error generating avatar:", error);
			setGenerationNotice("Generation failed. Please try again.");
			setAvatarUrl(REFERENCE_AVATAR_URL); // Fallback
		} finally {
			setIsGenerating(false);
		}
	};

	const handleSubmit = () => {
		onSubmit({ description: physicalDescription, avatarUrl });
	};

	return (
		<div className='relative h-screen max-h-screen overflow-x-hidden flex flex-col'>
			<div className='absolute -top-20 -left-20 w-40 h-40 bg-[#d9ebff]/55 blur-3xl' />
			<div className='absolute -bottom-20 -right-20 w-60 h-60 bg-[#d9ebff]/55 blur-3xl' />

			<div className='relative z-10 flex-1 flex flex-col p-8'>
				<div className='mb-8'>
					<div className='flex items-baseline gap-4 mb-4'>
						<div className='w-20 h-px bg-black/30' />
						<span className='text-black/30 text-xs tracking-[0.3em] uppercase'>Visual Identity</span>
					</div>

					<h1 className='text-5xl font-black tracking-tighter leading-none mb-2'>
						<span className='text-black/90'>CRAFT YOUR</span>
						<br />
						<span className='text-black/60'>DIGITAL FACE</span>
					</h1>

					<div className='flex items-center gap-6 mt-4'>
						<div className='flex-1 h-px bg-black/15' />
						<p className='text-black/40 text-xs uppercase tracking-wider'>
							Define your virtual appearance
						</p>
						<div className='flex-1 h-px bg-black/15' />
					</div>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch flex-1 min-h-0'>
					<div className='relative group h-full'>
						<div className='absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
						<div className='relative border border-black/10 bg-white/70 rounded-xl p-6 group-hover:border-black/30 transition-colors duration-500 h-full flex flex-col'>
							<div className='flex-1 flex flex-col'>
								<div className='mb-4'>
									<div className='flex items-center gap-3'>
										<span className='inline-flex items-center justify-center w-9 h-9 rounded-lg border border-black/15 bg-[#f3d4e6]'>
											<Sparkles className='w-5 h-5 text-purple-500' />
										</span>
										<label
											htmlFor='description'
											className='text-xs font-medium text-black/50 uppercase tracking-wider'
										>
											Physical Appearance
										</label>
									</div>
								</div>
								<textarea
									id='description'
									value={physicalDescription}
									onChange={(e) =>
										setPhysicalDescription(e.target.value)
									}
									placeholder='Description is optional right now. Avatar is fixed to the reference image.'
									className='flex-1 w-full bg-white/80 backdrop-blur-sm p-4 border border-black/10 focus:border-black/30 focus:outline-none transition-all duration-300 placeholder:text-black/30 resize-none'
								/>
								<button
									onClick={handleGenerate}
									disabled={isGenerating}
									className='mt-4 relative overflow-hidden w-full group/btn'
								>
									<div className='absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500' />
									<div className='relative flex items-center justify-center gap-3 px-6 py-3 border border-black/20 bg-white/80 backdrop-blur-sm group-hover/btn:border-black/40 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed'>
										{isGenerating ? (
											<>
												<Sparkles className='w-5 h-5 animate-pulse' />
												<span className='font-semibold uppercase tracking-wider text-sm'>Generating...</span>
											</>
										) : (
											<>
												<Sparkles className='w-5 h-5' />
												<span className='font-semibold uppercase tracking-wider text-sm'>Use Reference Avatar</span>
											</>
										)}
									</div>
								</button>
								{generationNotice && (
									<p className='mt-3 text-xs text-amber-700'>
										{generationNotice}
									</p>
								)}
							</div>
						</div>
					</div>

					<div className='relative group h-full'>
						<div className='absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
						<div className='relative border border-black/10 bg-white/70 rounded-xl p-6 group-hover:border-black/30 transition-colors duration-500 h-full'>
							<div className='flex items-center justify-center h-full'>
								{isGenerating ? (
									<div className='flex flex-col items-center justify-center text-black/60'>
										<div className='relative'>
											<div className='absolute inset-0 bg-white/5 blur-xl scale-150' />
											<Sparkles className='relative w-16 h-16 animate-pulse' />
										</div>
										<p className='mt-6 text-sm uppercase tracking-wider'>Crafting your persona...</p>
									</div>
								) : (
									<div className='relative w-full h-full flex items-center justify-center'>
										<div className='absolute top-4 right-4 text-6xl font-black text-black/5'>01</div>
										<div className='relative aspect-square w-full max-w-full max-h-full'>
											<img
												src={avatarUrl}
												alt='Generated Avatar'
												className='absolute inset-0 w-full h-full object-cover'
											/>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className='mt-8'>
					<div className='h-px bg-black/15 mb-6' />
					<div className='flex items-center justify-between'>
						<button
							onClick={onBack}
							className='group flex items-center gap-3 relative overflow-hidden'
						>
							<div className='absolute inset-0 bg-gradient-to-r from-black/5 to-transparent translate-x-full group-hover:translate-x-0 transition-transform duration-500' />
							<span className='relative px-6 py-2.5 border border-black/20 bg-white/80 backdrop-blur-sm group-hover:border-black/40 transition-all duration-300'>
								<span className='font-semibold uppercase tracking-wider text-sm'>Back</span>
							</span>
						</button>
						<button
							onClick={handleSubmit}
							disabled={!avatarUrl}
							className='group flex items-center gap-3 relative overflow-hidden disabled:opacity-30 disabled:cursor-not-allowed'
						>
							<div className='absolute inset-0 bg-gradient-to-r from-[#f3d4e6]/90 to-[#f0e7a9]/90 translate-x-full group-hover:translate-x-0 transition-transform duration-500' />
							<span className='relative px-6 py-2.5 border border-black/20 bg-white/80 backdrop-blur-sm group-hover:border-black/40 transition-all duration-300'>
								<span className='font-semibold uppercase tracking-wider text-sm'>Continue</span>
								<ArrowRight className='w-4 h-4 ml-2 inline group-hover:translate-x-1 transition-transform duration-300' />
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Step2AvatarGeneration;
