export type MilestoneKey =
  | 'first_steps'
  | 'first_page_live'
  | 'connected'
  | '100_visitors'
  | '1000_visitors'
  | 'first_inquiry'
  | '10_requests_done'
  | '90_day_partner'
  | 'score_75'
  | 'streak_4'
  | 'streak_8'
  | 'streak_12'
  | 'streak_26'
  | 'streak_52';

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
  streak_4: {
    key: 'streak_4',
    name: '4-Week Growth Streak',
    emoji: '🔥',
    message: "4 weeks of growth in a row, [name]! You're building real momentum.",
    hint: 'Grow your business score for 4 consecutive weeks',
  },
  streak_8: {
    key: 'streak_8',
    name: '8-Week Growth Streak',
    emoji: '🔥',
    message: "8 straight weeks of growth. You're proving consistency wins.",
    hint: 'Grow your business score for 8 consecutive weeks',
  },
  streak_12: {
    key: 'streak_12',
    name: '12-Week Growth Streak',
    emoji: '🏆',
    message: "3 months of unbroken growth, [name]. That's not luck — that's a system.",
    hint: 'Grow your business score for 12 consecutive weeks',
  },
  streak_26: {
    key: 'streak_26',
    name: '6-Month Growth Streak',
    emoji: '🚀',
    message: "6 months of consecutive growth. You're in rare company.",
    hint: 'Grow your business score for 26 consecutive weeks',
  },
  streak_52: {
    key: 'streak_52',
    name: 'Full-Year Growth Streak',
    emoji: '👑',
    message: "A full year of growth. [name], you are the top streaker. Legendary.",
    hint: 'Grow your business score for 52 consecutive weeks',
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
  'streak_4',
  'streak_8',
  'streak_12',
  'streak_26',
  'streak_52',
];

/** Streak week counts that unlock milestone badges */
export const STREAK_MILESTONES: Array<{ weeks: number; key: MilestoneKey }> = [
  { weeks: 4, key: 'streak_4' },
  { weeks: 8, key: 'streak_8' },
  { weeks: 12, key: 'streak_12' },
  { weeks: 26, key: 'streak_26' },
  { weeks: 52, key: 'streak_52' },
];
