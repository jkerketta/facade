import React, { useState } from "react";
import { User, Briefcase } from "lucide-react";

export type InfluencerType = "lifestyle" | "company";

const TypeCard = ({
	icon,
	iconBgClass,
	title,
	description,
	onClick,
	isHovered,
	onHover,
	index,
}: {
	icon: React.ReactNode;
	iconBgClass: string;
	title: string;
	description: string;
	onClick: () => void;
	isHovered: boolean;
	onHover: (hover: boolean) => void;
	index: number;
}) => (
	<button
		onClick={onClick}
		onMouseEnter={() => onHover(true)}
		onMouseLeave={() => onHover(false)}
		className={`
			relative overflow-hidden group
			bg-white p-[1px]
			transform transition-all duration-500 ease-out
			${isHovered ? 'translate-x-2 -translate-y-2' : ''}
		`}
	>
		{/* Outlined border wrapper */}
		<div className='absolute inset-0 border-1 border-black/10 group-hover:border-black/30 transition-colors duration-500 z-0' />

		{/* Inner gradient */}
		<div 
			className={`
				absolute inset-0 z-0
				bg-gradient-to-br 
				${index === 0 ? 'from-purple-500/10 to-transparent' : 'from-blue-500/10 to-transparent'}
				opacity-0 group-hover:opacity-100 transition-opacity duration-500
			`}
		/>

		{/* Actual content */}
		<div className='relative z-10 p-12 flex flex-col items-start h-full'>
			<div className={`mb-8 relative ${isHovered ? 'animate-pulse' : ''}`}>
				<div className='absolute inset-0 bg-white/5 blur-xl scale-150 rounded-xl' />
				<div className={`relative border border-black/20 p-4 ${iconBgClass} backdrop-blur-sm rounded-xl`}>
					{icon}
				</div>
			</div>

			<h3 className='text-2xl font-black tracking-tighter mb-4 uppercase'>{title}</h3>

			<div className='flex-1'>
				<p className='text-black/70 text-sm leading-relaxed'>{description}</p>
			</div>

			<div className='mt-8 w-full border-t border-black/15' />

			<div className={`
				absolute top-4 right-4 text-8xl font-black text-black/5
				transform transition-transform duration-700
				${isHovered ? 'translate-x-2 translate-y-2' : ''}
			`}>
				{index + 1}
			</div>
		</div>
	</button>
);

interface Step1ChooseTypeProps {
	onSelectType: (type: InfluencerType) => void;
}

const Step1ChooseType: React.FC<Step1ChooseTypeProps> = ({ onSelectType }) => {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	return (
		<div className='relative overflow-x-hidden'>
			<div className='absolute -top-20 -left-20 w-40 h-40 bg-[#d9ebff]/55 blur-3xl' />
			<div className='absolute -bottom-20 -right-20 w-60 h-60 bg-[#d9ebff]/55 blur-3xl' />

			<div className='relative z-10'>
				<div className='mb-16'>
					<div className='flex items-baseline gap-4 mb-6'>
						<div className='w-20 h-px bg-black/30' />
						<span className='text-black/30 text-xs tracking-[0.3em] uppercase'>Initialize</span>
					</div>

					<h1 className='text-6xl font-black tracking-tighter leading-none mb-4'>
						<span className='text-black/90'>ARCHITECT</span>
						<br />
						<span className='text-black/60'>YOUR INFLUENCE</span>
					</h1>

					<div className='flex items-center gap-6 mt-8'>
						<div className='flex-1 h-px bg-black/15' />
						<p className='text-black/40 text-sm uppercase tracking-wider'>
							Select operational mode
						</p>
						<div className='flex-1 h-px bg-black/15' />
					</div>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
					<TypeCard
						icon={<User className='w-10 h-10 text-purple-400' />}
						iconBgClass='bg-[#f3d4e6]'
						title='Lifestyle Persona'
						description='An autonomous influencer that builds a personal brand, history, and narrative over time.'
						onClick={() => onSelectType("lifestyle")}
						isHovered={hoveredIndex === 0}
						onHover={(hover) => setHoveredIndex(hover ? 0 : null)}
						index={0}
					/>
					<TypeCard
						icon={<Briefcase className='w-10 h-10 text-blue-400' />}
						iconBgClass='bg-[#d9ebff]'
						title='Brand Ambassador'
						description='A marketing-focused influencer designed to promote specific products or a company.'
						onClick={() => onSelectType("company")}
						isHovered={hoveredIndex === 1}
						onHover={(hover) => setHoveredIndex(hover ? 1 : null)}
						index={1}
					/>
				</div>

				<div className='mt-16' />
			</div>
		</div>
	);
};

export default Step1ChooseType;
