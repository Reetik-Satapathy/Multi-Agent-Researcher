import React from 'react';
import { ArrowRight } from 'lucide-react';
import { AbstractSphere } from '../components/AbstractSphere';

interface HomeViewProps {
  onEnterWorkspace: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onEnterWorkspace }) => {
  return (
    <div className="relative flex h-svh w-full flex-col items-center overflow-hidden bg-[#050706] px-5 sm:px-8 select-none">
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 50% 18%, rgba(16, 32, 25, 0.55) 0%, transparent 52%),
            radial-gradient(ellipse at 50% 72%, rgba(49, 92, 75, 0.12) 0%, transparent 48%),
            linear-gradient(180deg, #050706 0%, #070A08 48%, #050706 100%)
          `,
        }}
      />

      <div className="relative z-10 flex h-full w-full max-w-3xl flex-col items-center">
        <header className="shrink-0 pt-[min(5.5vh,2.75rem)] text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.46em] text-[#F2F4EF] sm:text-[13px]">
            REWORK <span className="font-normal tracking-[0.32em] text-[#6F9B83]">Ai</span>
          </p>
        </header>

        <section className="mt-[min(4.2vh,2rem)] shrink-0 text-center">
          <p className="text-[9px] font-medium uppercase tracking-[0.42em] text-[#A5ADA7] sm:text-[10px]">
            Multi-Agent Research Platform
          </p>
          <h1 className="mt-4 font-sans text-[clamp(1.7rem,4.6vw,3.15rem)] font-light leading-[1.12] tracking-[-0.03em]">
            <span className="text-[#F2F4EF]">Your research partner</span>
            <br />
            <span className="text-[#F2F4EF]/55">for deeper understanding.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[28rem] px-2 text-[12px] font-normal leading-relaxed text-[#A5ADA7] sm:text-[13.5px]">
            Discover, analyze and build on the world's knowledge
            <br className="hidden sm:block" />
            {' '}with specialized AI research agents.
          </p>
        </section>

        <div className="relative my-[min(1.8vh,0.75rem)] flex min-h-0 w-full flex-1 items-center justify-center">
          <AbstractSphere />
        </div>

        <div className="w-full shrink-0 pb-[min(5vh,2.4rem)] pt-1">
          <button
            type="button"
            onClick={onEnterWorkspace}
            className="group mx-auto flex w-full max-w-[22.5rem] items-center justify-between rounded-md border border-white/[0.09] bg-[#070A08]/80 px-5 py-3 text-left shadow-[0_0_0_1px_rgba(49,92,75,0.08)] backdrop-blur-sm transition-all duration-300 hover:border-[#6F9B83]/45 hover:bg-[#102019]/70 hover:shadow-[0_0_28px_-12px_rgba(49,92,75,0.55)] active:scale-[0.995] sm:max-w-[24rem]"
          >
            <span className="text-[13px] font-medium tracking-wide text-[#F2F4EF]">
              Enter Research Workspace
            </span>
            <ArrowRight className="h-4 w-4 text-[#6F9B83] transition-transform duration-300 group-hover:translate-x-1.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
