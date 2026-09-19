import React, { useEffect, useState } from 'react';
import { 
  Mail, 
  Building, 
  Bookmark, 
  FileText, 
  GitCompare, 
  FolderKanban, 
  ShieldCheck, 
  LogOut
} from 'lucide-react';
import type { UserProfile } from '../types/research';

interface ProfileViewProps {
  user: UserProfile;
  initialTab?: 'overview' | 'preferences' | 'keys' | 'security';
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, initialTab = 'overview' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'preferences' | 'keys' | 'security'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Profile Banner Header */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 border border-[#1D4ED8]/30 shadow-glow-purple flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover border-2 border-[#1D4ED8] ring-4 ring-[#1D4ED8]/20 shrink-0"
          />
        ) : (
          <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-3xl font-semibold text-[#1D4ED8] ring-4 ring-[#1D4ED8]/20">
            {user.name.trim().charAt(0).toUpperCase()}
          </span>
        )}

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl font-extrabold text-[#171717] tracking-tight">{user.name}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8] text-xs font-mono border border-[#1D4ED8]/40">
              PRO RESEARCHER
            </span>
          </div>

          <p className="text-xs text-[#6B6B67] font-medium">{user.role}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-mono text-[#6B6B67] pt-1">
            <span className="flex items-center space-x-1">
              <Building className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>{user.institution}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>{user.email}</span>
            </span>
          </div>
        </div>
      </div>

      {/* RESEARCH STATS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 text-center space-y-1">
          <Bookmark className="w-5 h-5 text-[#1D4ED8] mx-auto mb-1" />
          <span className="text-2xl font-extrabold text-[#171717] font-mono block">{user.stats.savedPapers}</span>
          <span className="text-xs text-[#6B6B67] font-medium">Saved Papers</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 text-center space-y-1">
          <FileText className="w-5 h-5 text-[#1D4ED8] mx-auto mb-1" />
          <span className="text-2xl font-extrabold text-[#171717] font-mono block">{user.stats.reports}</span>
          <span className="text-xs text-[#6B6B67] font-medium">Reports Generated</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 text-center space-y-1">
          <GitCompare className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
          <span className="text-2xl font-extrabold text-[#171717] font-mono block">{user.stats.comparisons}</span>
          <span className="text-xs text-[#6B6B67] font-medium">Comparisons</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 text-center space-y-1">
          <FolderKanban className="w-5 h-5 text-amber-600 mx-auto mb-1" />
          <span className="text-2xl font-extrabold text-[#171717] font-mono block">{user.stats.projects}</span>
          <span className="text-xs text-[#6B6B67] font-medium">Active Projects</span>
        </div>
      </div>

      {/* SETTINGS NAVIGATION TABS */}
      <div className="glass-panel rounded-2xl p-6 space-y-6">
        <div className="flex items-center space-x-2 border-b border-[#D9D7D0] pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-[#DBEAFE] text-[#1D4ED8] border border-[#1D4ED8]/40'
                : 'text-[#6B6B67] hover:text-[#171717]'
            }`}
          >
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('keys')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'keys'
                ? 'bg-[#DBEAFE] text-[#1D4ED8] border border-[#1D4ED8]/40'
                : 'text-[#6B6B67] hover:text-[#171717]'
            }`}
          >
            Data Sources
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-[#DBEAFE] text-[#1D4ED8] border border-[#1D4ED8]/40'
                : 'text-[#6B6B67] hover:text-[#171717]'
            }`}
          >
            Security & Account
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#171717]">AI Engine Preferences</h3>
            <div className="space-y-3 text-xs text-[#6B6B67]">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F5F3EE] border border-[#D9D7D0] cursor-pointer">
                <div>
                  <span className="text-[#171717] font-semibold block">Interface Animations</span>
                  <span>Subtle motion effects for the research visual and menus</span>
                </div>
                <input type="checkbox" defaultChecked className="rounded bg-black text-[#1D4ED8]" />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F5F3EE] border border-[#D9D7D0] cursor-pointer">
                <div>
                  <span className="text-[#171717] font-semibold block">Default AI Model Engine</span>
                  <span>Select primary LLM model for paper summarization & extraction</span>
                </div>
                <select className="bg-white border border-[#D9D7D0] text-[#171717] rounded-lg px-3 py-1 text-xs">
                  <option>Claude 3.5 Sonnet / Gemini 1.5 Pro</option>
                  <option>GPT-4o Academic Agent</option>
                  <option>Local Llama-3 70B Quantized</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'keys' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#171717]">Data Sources</h3>
            <p className="text-xs text-[#6B6B67]">
              This workspace runs on a bundled demo research corpus. All papers, summaries,
              comparisons and reports are generated locally — no external API keys are required.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F5F3EE] border border-[#D9D7D0]">
                <div>
                  <span className="text-[#171717] font-semibold block text-xs">Demo Research Corpus</span>
                  <span className="text-[11px] text-[#6B6B67]">10 sample papers · AI · Medicine · Neuroscience · Robotics</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8] text-[11px] font-semibold border border-[#1D4ED8]/40">
                  Active
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#171717]">Security & Workspace Permissions</h3>
            <div className="p-4 rounded-xl bg-[#F5F3EE] border border-[#D9D7D0] space-y-2 text-xs text-[#6B6B67]">
              <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4" />
                <span>2-Factor Authentication Active</span>
              </span>
              <p>Your research data and saved reports are encrypted at rest with AES-256.</p>
            </div>

            <button className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-colors">
              <LogOut className="w-4 h-4" />
              <span>Log Out of Workspace</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
