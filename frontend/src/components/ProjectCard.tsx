import React from 'react';
import { FolderKanban, FileText, BookMarked, Clock, ArrowRight } from 'lucide-react';
import type { Project } from '../types/research';

interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpen }) => {
  return (
    <div 
      onClick={() => onOpen(project)}
      className="glass-panel glass-panel-hover rounded-2xl p-5 md:p-6 flex flex-col justify-between cursor-pointer space-y-4 group"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#DBEAFE] border border-[#1D4ED8]/30 flex items-center justify-center text-[#1D4ED8] group-hover:scale-105 transition-transform">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#171717] group-hover:text-[#1D4ED8] transition-colors leading-tight">
                {project.title}
              </h3>
              <div className="flex items-center space-x-1.5 text-xs text-[#6B6B67] mt-1">
                <Clock className="w-3 h-3 text-[#1D4ED8]" />
                <span>Updated {project.lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[#6B6B67] line-clamp-2 leading-relaxed my-3">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.map((tag, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded-full bg-black/5 border border-[#D9D7D0] text-[11px] font-mono text-[#6B6B67]">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="pt-4 border-t border-[#D9D7D0] flex items-center justify-between text-xs font-mono text-[#171717]">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <BookMarked className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span>{project.paperCount} papers</span>
          </span>
          <span className="text-[#171717]/20">•</span>
          <span className="flex items-center space-x-1">
            <FileText className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span>{project.reportCount} reports</span>
          </span>
        </div>

        <ArrowRight className="w-4 h-4 text-[#6B6B67] group-hover:text-[#171717] group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};
