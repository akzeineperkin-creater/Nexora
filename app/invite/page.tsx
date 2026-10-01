'use client';

import React, { useState } from 'react';
import { Gift, Copy, Check, Share2, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslation } from '@/providers/LanguageProvider';

export default function InvitePage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState<string>('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const fallbackOrigin = process.env.NEXT_PUBLIC_APP_URL || 'https://nexora-psi-beryl.vercel.app';
  const baseOrigin = origin || (typeof window !== 'undefined' ? window.location.origin : '') || fallbackOrigin;

  const nickname = profile?.nickname || profile?.username || 'TRADER';
  const referralCode = profile?.referral_code || `NEXORA-${nickname.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)}`;
  const referralUrl = `${baseOrigin}/join?ref=${referralCode}`;

  const friends = [
    { nickname: 'Marcus_S', status: t('invite.statusCompleted'), reward: t('invite.rewardClaimed'), date: t('invite.timeDaysAgo', { days: 2 }) },
    { nickname: 'Elena_R', status: t('invite.statusCompleted'), reward: t('invite.rewardClaimed'), date: t('invite.timeDaysAgo', { days: 5 }) },
    { nickname: 'David_K', status: t('invite.statusPending'), reward: t('invite.rewardPending'), date: t('invite.timeYesterday') },
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
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-dark dark:text-[#F5F5F5] tracking-tight">
            {t('invite.title')}
          </h1>
          <p className="text-xs md:text-sm text-slate-muted dark:text-[#A1A1AA] mt-0.5">
            {t('invite.subtitle')}
          </p>
        </div>
        <Badge variant="lime" size="sm">{t('invite.badge')}</Badge>
      </div>

      {/* HERO CARD */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-card-lg p-6 md:p-8 flex items-center justify-between flex-wrap gap-6 shadow-lg">
        <div className="max-w-xl">
          <Badge variant="lime" size="sm" className="mb-2">{t('invite.heroBadge')}</Badge>
          <h2 className="text-xl md:text-2xl font-extrabold text-white leading-snug">
            {t('invite.heroHeadline')}
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
            {t('invite.heroDesc')}
          </p>
        </div>

        <div className="bg-white/10 border border-white/15 p-4 rounded-xl text-center min-w-[160px]">
          <span className="text-[10px] text-slate-300 uppercase tracking-wider">{t('invite.totalBonusEarned')}</span>
          <div className="text-2xl font-extrabold font-mono text-lime my-1">{t('invite.bonusTotal')}</div>
          <Badge variant="neutral" size="sm" className="text-white border-white/20">{t('invite.friendsInvited', { count: 3 })}</Badge>
        </div>

        {/* Link Box */}
        <div className="w-full pt-4 border-t border-white/10 flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-300">{t('invite.referralLinkLabel')}</label>
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
                <span>{copied ? t('invite.copied') : t('invite.copyLink')}</span>
              </Button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${t('invite.shareTweetText')} ${referralUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none"
              >
                <Button variant="glass" size="md" className="w-full text-white border-white/20 hover:bg-white/20">
                  <Share2 className="w-4 h-4" />
                  <span>{t('invite.share')}</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ROSTER TABLE (CLEAN NEUTRAL EMPTY AVATAR STATES) */}
      <Card className="p-0 overflow-hidden shadow-sm dark:shadow-dark-card">
        <div className="p-4 sm:p-5 border-b border-slate-border dark:border-[#3A3A3D]">
          <CardTitle>{t('invite.invitedFriendsCount', { count: friends.length })}</CardTitle>
          <CardSubtitle>{t('invite.trackMilestones')}</CardSubtitle>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#1E1E21] border-b border-slate-border dark:border-[#3A3A3D] text-slate-muted dark:text-[#A1A1AA] uppercase text-[10px] sm:text-[11px] font-bold tracking-wider select-none">
                <th className="py-3 px-2.5 sm:px-4">{t('invite.colNickname')}</th>
                <th className="py-3 px-2.5 sm:px-4 hidden sm:table-cell">{t('invite.colDate')}</th>
                <th className="py-3 px-2.5 sm:px-4">{t('invite.colMilestone')}</th>
                <th className="py-3 px-2.5 sm:px-4 text-right">{t('invite.colRewardStatus')}</th>
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
                    <Badge variant={f.status.includes('3') ? 'up' : 'neutral'} size="sm">
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
