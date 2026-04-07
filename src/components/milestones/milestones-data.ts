export type MilestoneKey =
  | 'first_steps'
  | 'first_page_live'
  | 'connected'
  | '100_visitors'
  | '1000_visitors'
  | 'first_inquiry'
  | '10_requests_done'
  | '90_day_partner'
  | 'score_75';

export interface MilestoneConfig {
  key: MilestoneKey;
  name: string;
  emoji: string;
  /** May contain [name] placeholder */
  message: string;
  /** Shown when milestone is locked */
  hint: string;
  /** If true, show a progress bar when unearned */
  progressable?: boolean;
}

export const MILESTONE_CONFIGS: Record<MilestoneKey, MilestoneConfig> = {
  first_steps: {
    key: 'first_steps',
    name: 'First Steps',
    emoji: '👋',
    message: 'Welcome to the Caliber family, [name]! Your growth journey starts now.',
    hint: 'Create your account and log in for the first time',
  },
  first_page_live: {
    key: 'first_page_live',
    name: 'First Page Live',
    emoji: '🚀',
    message: 'Your first page is live! Your online presence just got real.',
    hint: 'Have your first page set to active',
  },
  connected: {
    key: 'connected',
    name: 'Connected',
    emoji: '🤝',
    message: "You're connected! Your Caliber team is ready to move.",
    hint: 'Send your first message to the team',
  },
  '100_visitors': {
    key: '100_visitors',
    name: '100 Visitors',
    emoji: '📈',
    message: '100 people have visited your site. The momentum is building.',
    hint: 'Reach 100 page views on your site',
    progressable: true,
  },
  '1000_visitors': {
    key: '1000_visitors',
    name: '1,000 Visitors',
    emoji: '🔥',
    message: "1,000 visitors! You're officially on the map.",
    hint: 'Reach 1,000 page views on your site',
    progressable: true,
  },
  first_inquiry: {
    key: 'first_inquiry',
    name: 'First Inquiry',
    emoji: '💌',
    message: 'Your first inquiry just came in. Your website is working.',
    hint: 'Receive your first form submission or lead',
  },
  '10_requests_done': {
    key: '10_requests_done',
    name: '10 Requests Completed',
    emoji: '⚡',
    message: "10 things done. You're a power user — your site keeps getting better.",
    hint: 'Have 10 change requests marked as completed',
    progressable: true,
  },
  '90_day_partner': {
    key: '90_day_partner',
    name: '90-Day Partner',
    emoji: '🏆',
    message: '90 days in. Most clients see their biggest results right around now.',
    hint: 'Be an active client for 90 days',
  },
  score_75: {
    key: 'score_75',
    name: 'Score Milestone',
    emoji: '🎯',
    message: "Growth Score: 75. You're in the top tier. Keep going.",
    hint: 'Reach a Growth Score of 75 or higher',
    progressable: true,
  },
};

export const MILESTONE_ORDER: MilestoneKey[] = [
  'first_steps',
  'first_page_live',
  'connected',
  '100_visitors',
  '1000_visitors',
  'first_inquiry',
  '10_requests_done',
  '90_day_partner',
  'score_75',
];
