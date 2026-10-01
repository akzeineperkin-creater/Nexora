import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-slate-200/80 dark:bg-[#323236]', className)}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#28282B] border border-slate-border dark:border-[#3A3A3D] rounded-card p-5 shadow-card dark:shadow-dark-card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-7 w-7 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-36 my-1" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr className="border-b border-slate-100 dark:border-[#3A3A3D] animate-pulse">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </td>
      <td className="py-4 px-4"><Skeleton className="h-4 w-12" /></td>
      <td className="py-4 px-4"><Skeleton className="h-4 w-16" /></td>
      <td className="py-4 px-4"><Skeleton className="h-4 w-20" /></td>
      <td className="py-4 px-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
      <td className="py-4 px-4 text-right"><Skeleton className="h-7 w-16 rounded-full ml-auto" /></td>
    </tr>
  );
}
