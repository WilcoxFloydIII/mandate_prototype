import type { PresenceMethod, VerificationStatus } from '../types';

export function presenceMethodLabel(method: PresenceMethod | string): string {
  switch (method) {
    case 'qr_chain_verified':
      return 'Automatic (QR + Face ID)';
    case 'manual_student':
      return 'Manual (Self-reported)';
    case 'lecturer_marked':
      return 'Marked by Lecturer';
    case 'degraded_manual_entry':
      return 'Roll Call (System Unavailable)';
    case 'admin_corrected':
      return 'Corrected by Admin';
    default:
      return method.replace(/_/g, ' ');
  }
}

export function verificationStatusLabel(status: VerificationStatus | string): string {
  switch (status) {
    case 'verified':
      return 'Verified';
    case 'unverified':
      return 'Unverified';
    case 'disputed':
      return 'Disputed';
    case 'confirmed':
      return 'Confirmed';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
  }
}

export function verificationStatusClasses(status: VerificationStatus | string): string {
  switch (status) {
    case 'verified':
    case 'confirmed':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
    case 'unverified':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
    case 'disputed':
    case 'rejected':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400';
    default:
      return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
  }
}
