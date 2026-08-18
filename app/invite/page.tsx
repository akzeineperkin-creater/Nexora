'use client';

import React, { useState } from 'react';
import { Gift, Copy, Check, Share2, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/providers/AuthProvider';

export default function InvitePage() {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);

  const nickname = profile?.nickname || profile?.username || 'TRADER';
  const referralCode = profile?.referral_code || `NEXORA-${nickname.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)}`;
  const referralUrl = `https://nexora.sim/join?ref=${referralCode}`;

  const friends = [
    { nickname: 'Marcus_S', status: 'Completed 3 Trades', reward: '+$1,000 Sim Cash', date: '2 days ago' },
    { nickname: 'Elena_R', status: 'Completed 3 Trades', reward: '+$1,000 Sim Cash', date: '5 days ago' },
    { nickname: 'David_K', status: 'Pending 1 Trade', reward: 'Pending', date: 'Yesterday' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-dark tracking-tight">
            Invite Friends & Earn
          </h1>
          <p className="text-xs md:text-sm text-slate-muted mt-0.5">
            Share your unique invite link. Earn $1,000 in virtual sandbox bonus cash for every referral.
          </p>
        </div>
        <Badge variant="lime" size="sm">Referral Growth</Badge>
      </div>

      {/* HERO CARD */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-card-lg p-6 md:p-8 flex items-center justify-between flex-wrap gap-6 shadow-lg">
        <div className="max-w-xl">
          <Badge variant="lime" size="sm" className="mb-2">Earn Together</Badge>
          <h2 className="text-xl md:text-2xl font-extrabold text-white leading-snug">
            Invite fellow traders. Level up together.
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
            When your invited friend signs up and executes their first 3 simulated trades, you both receive <strong>+$1,000 in sandbox cash</strong> and unlock the exclusive <em>Networker</em> trader badge.
          </p>
        </div>

        <div className="bg-white/10 border border-white/15 p-4 rounded-xl text-center min-w-[160px]">
          <span className="text-[10px] text-slate-300 uppercase tracking-wider">Total Bonus Earned</span>
          <div className="text-2xl font-extrabold font-mono text-lime my-1">+$2,000</div>
          <Badge variant="neutral" size="sm" className="text-white border-white/20">3 Friends Invited</Badge>
        </div>

        {/* Link Box */}
        <div className="w-full pt-4 border-t border-white/10 flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-300">Your Personal Referral Link</label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="w-full sm:flex-1 min-w-0 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-mono text-white focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <Button variant="lime" size="md" onClick={handleCopy} className="flex-1 sm:flex-none">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </Button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Trade with virtual capital on NEXORA with me! ${referralUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none"
              >
                <Button variant="glass" size="md" className="w-full text-white border-white/20 hover:bg-white/20">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ROSTER TABLE (CLEAN NEUTRAL EMPTY AVATAR STATES) */}
      <Card className="p-0 overflow-hidden shadow-sm dark:shadow-dark-card">
        <div className="p-4 sm:p-5 border-b border-slate-border dark:border-[#3A3A3D]">
          <CardTitle>Invited Friends ({friends.length})</CardTitle>
          <CardSubtitle>Track qualifying trading milestones</CardSubtitle>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#1E1E21] border-b border-slate-border dark:border-[#3A3A3D] text-slate-muted dark:text-[#A1A1AA] uppercase text-[10px] sm:text-[11px] font-bold tracking-wider select-none">
                <th className="py-3 px-2.5 sm:px-4">Friend Nickname</th>
                <th className="py-3 px-2.5 sm:px-4 hidden sm:table-cell">Invited Date</th>
                <th className="py-3 px-2.5 sm:px-4">Milestone</th>
                <th className="py-3 px-2.5 sm:px-4 text-right">Reward Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#3A3A3D]">
              {friends.map((f) => (
                <tr key={f.nickname} className="hover:bg-slate-50/70 dark:hover:bg-[#323236] transition-colors">
                  <td className="py-3.5 px-2.5 sm:px-4">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D] flex items-center justify-center text-slate-600 dark:text-[#A1A1AA] shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-dark dark:text-[#F5F5F5] text-xs sm:text-sm">{f.nickname}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-2.5 sm:px-4 font-mono text-slate-muted dark:text-[#71717A] hidden sm:table-cell">{f.date}</td>
                  <td className="py-3.5 px-2.5 sm:px-4">
                    <Badge variant={f.status.includes('Completed') ? 'up' : 'neutral'} size="sm">
                      {f.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-2.5 sm:px-4 text-right font-mono font-bold text-lime-900 dark:text-lime text-xs sm:text-sm">
                    {f.reward}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
