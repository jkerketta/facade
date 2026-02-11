import React from "react";
import Link from "next/link";

const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='1.5'
		strokeLinecap='round'
		strokeLinejoin='round'
		{...props}
	>
		<path d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
		<polyline points='9 22 9 12 15 12 15 22' />
	</svg>
);

const BriefcaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='1.5'
		strokeLinecap='round'
		strokeLinejoin='round'
		{...props}
	>
		<rect x='2' y='7' width='20' height='14' rx='2' ry='2'></rect>
		<path d='M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16'></path>
	</svg>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='1.5'
		strokeLinecap='round'
		strokeLinejoin='round'
		{...props}
	>
		<line x1='12' y1='5' x2='12' y2='19'></line>
		<line x1='5' y1='12' x2='19' y2='12'></line>
	</svg>
);

const Navbar = ({ onAddClick }: { onAddClick: () => void }) => {
	return (
		<nav className='w-full border-b border-black/15 bg-white/95 backdrop-blur-sm px-4 md:px-6 py-4 grid grid-cols-[1fr_auto_1fr] items-center z-20'>
			<div className='flex items-center gap-2 md:gap-3 min-w-0'>
				<div className='text-3xl font-black tracking-[-0.04em] leading-none text-[#111]'>
					Facade
				</div>
			</div>
			<div className='justify-self-center flex items-center gap-3'>
				<Link href='/' passHref>
					<button className='h-11 w-11 flex items-center justify-center bg-[#f0e7a9] border-2 border-black/70 rounded-lg text-black shadow-[2px_2px_0px_#111] hover:-translate-y-0.5 transition-all'>
						<HomeIcon className='w-5 h-5' />
					</button>
				</Link>
				<Link href='/sponsors' passHref>
					<button className='h-11 w-11 flex items-center justify-center bg-[#f3d4e6] border-2 border-black/70 rounded-lg text-black shadow-[2px_2px_0px_#111] hover:-translate-y-0.5 transition-all'>
						<BriefcaseIcon className='w-5 h-5' />
					</button>
				</Link>
			</div>
			<div className='justify-self-end'>
				<button
					onClick={onAddClick}
					className='h-10 px-4 flex items-center gap-2 justify-center bg-black text-white rounded-full hover:opacity-90 transition-all whitespace-nowrap'
				>
					<PlusIcon className='w-4 h-4' />
					<span className='text-sm font-semibold'>new facade</span>
				</button>
			</div>
		</nav>
	);
};

export default Navbar;
