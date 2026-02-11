import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Step3GrowthAndSocialsProps {
	onBack: () => void;
	onSubmit: (data: {
		growth_phase_enabled: boolean;
		growth_intensity: number;
		instagram_username?: string;
		instagram_password?: string;
	}) => void;
}

const Step3GrowthAndSocials: React.FC<Step3GrowthAndSocialsProps> = ({
	onBack,
	onSubmit,
}) => {
	const [growth_phase_enabled, setGrowthPhaseEnabled] = useState(true);
	const [growth_intensity, setGrowthIntensity] = useState(0.5);
	const [instagram_username, setInstagramUsername] = useState("");
	const [instagram_password, setInstagramPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = () => {
		onSubmit({
			growth_phase_enabled,
			growth_intensity,
			instagram_username,
			instagram_password,
		});
	};

	return (
		<div className='relative h-screen max-h-screen overflow-x-hidden flex flex-col'>
			<div className='absolute -top-20 -left-20 w-40 h-40 bg-[#d9ebff]/55 blur-3xl' />
			<div className='absolute -bottom-20 -right-20 w-60 h-60 bg-[#d9ebff]/55 blur-3xl' />

			<div className='relative z-10 flex-1 flex flex-col p-8'>
				<div className='mb-8'>
					<div className='flex items-baseline gap-4 mb-4'>
						<div className='w-20 h-px bg-black/30' />
						<span className='text-black/30 text-xs tracking-[0.3em] uppercase'>Configure</span>
					</div>

					<h1 className='text-5xl font-black tracking-tighter leading-none mb-2'>
						<span className='text-black/90'>CONFIGURE</span>
						<br />
						<span className='text-black/60'>GROWTH & ACCOUNTS</span>
					</h1>

					<div className='flex items-center gap-6 mt-4'>
						<div className='flex-1 h-px bg-black/15' />
						<p className='text-black/40 text-xs uppercase tracking-wider'>
							Automation settings
						</p>
						<div className='flex-1 h-px bg-black/15' />
					</div>
				</div>

				<div className='flex-1 min-h-0 overflow-y-auto pr-4 mb-6'>
					<div className='space-y-8'>
						<fieldset className='border border-black/10 bg-white/70 rounded-xl p-6'>
							<legend className='text-sm font-medium text-black/70 px-2'>
								Growth Settings
							</legend>
							<div className='space-y-6'>
								<div className='flex items-center justify-between'>
									<div>
										<label
											htmlFor='growth_phase_enabled'
											className='text-sm font-medium text-black/70'
										>
											Enable Automated Growth Phase
										</label>
										<p className='text-xs text-black/50 mt-1'>
											Automatically grow your audience
										</p>
									</div>
									<button
										onClick={() =>
											setGrowthPhaseEnabled(!growth_phase_enabled)
										}
										className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${growth_phase_enabled
												? "bg-teal-500"
												: "bg-black/20"
											}`}
									>
										<span
											className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${growth_phase_enabled
													? "translate-x-5"
													: "translate-x-0"
												}`}
										/>
									</button>
								</div>
								{growth_phase_enabled && (
									<div className='space-y-2'>
										<div className='flex justify-between'>
											<label
												htmlFor='growth_intensity'
												className='text-sm font-medium text-black/70'
											>
												Growth Intensity
											</label>
											<span className='text-sm text-black/70'>
												{(growth_intensity * 100).toFixed(0)}%
											</span>
										</div>
										<input
											id='growth_intensity'
											type='range'
											min='0'
											max='1'
											step='0.05'
											value={growth_intensity}
											onChange={(e) =>
												setGrowthIntensity(
													parseFloat(e.target.value)
												)
											}
											className='w-full h-2 bg-black/20 rounded-lg appearance-none cursor-pointer accent-black [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-black'
										/>
									</div>
								)}
							</div>
						</fieldset>

						<fieldset className='border border-black/10 bg-white/70 rounded-xl p-6'>
							<legend className='text-sm font-medium text-black/70 px-2'>
								Social Accounts (Optional)
							</legend>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<div>
									<label
										htmlFor='instagram_username'
										className='block text-sm font-medium text-black/70 mb-2'
									>
										TikTok Username
									</label>
									<input
										type='text'
										id='instagram_username'
										value={instagram_username}
										onChange={(e) =>
											setInstagramUsername(e.target.value)
										}
										className='w-full px-4 py-2 bg-white/5 border border-black/10 rounded-lg placeholder-black/40 text-black focus:outline-none focus:ring-2 focus:ring-black/20'
										placeholder='@username'
										autoComplete="off"
									/>
								</div>
								<div>
									<label
										htmlFor='instagram_password'
										className='block text-sm font-medium text-black/70 mb-2'
									>
										TikTok Password
									</label>
									<div className='relative'>
										<input
											type={showPassword ? "text" : "password"}
											id='instagram_password'
											value={instagram_password}
											onChange={(e) =>
												setInstagramPassword(e.target.value)
											}
											className='w-full px-4 py-2 bg-white/5 border border-black/10 rounded-lg placeholder-black/40 text-black focus:outline-none focus:ring-2 focus:ring-black/20'
											placeholder='password'
											autoComplete="off"
										/>
										<button
											type='button'
											onClick={() => setShowPassword(!showPassword)}
											className='absolute inset-y-0 right-0 pr-3 flex items-center'
										>
											{showPassword ? (
												<EyeOff className='h-5 w-5 text-black/50' />
											) : (
												<Eye className='h-5 w-5 text-black/50' />
											)}
										</button>
									</div>
								</div>
							</div>
						</fieldset>
					</div>
				</div>

				<div className='mt-auto'>
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
							className='group flex items-center gap-3 relative overflow-hidden'
						>
							<div className='absolute inset-0 bg-gradient-to-r from-[#f3d4e6]/90 to-[#f0e7a9]/90 translate-x-full group-hover:translate-x-0 transition-transform duration-500' />
							<span className='relative px-6 py-2.5 border border-black/20 bg-white/80 backdrop-blur-sm group-hover:border-black/40 transition-all duration-300'>
								<span className='font-semibold uppercase tracking-wider text-sm'>Continue</span>
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Step3GrowthAndSocials;
