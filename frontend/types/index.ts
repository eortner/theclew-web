export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: string;
  provider: string;
  createdAt: string;
  totpEnabled: boolean;
  totpVerifiedAt?: string;
}

export interface Tag {
  id: number;
  name: string;
  category?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  visibility: 'PRIVATE' | 'SELECTIVE' | 'PUBLIC';
  status: string;
  tags: string[];
  currentLevel: number;
  createdAt: string;
  updatedAt: string;
  owner: { id: string; name: string; avatarUrl?: string };
  levelHistory: { id: string; level: number; achievedAt: string }[];
  projectTags: { tag: Tag }[];
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  metadata?: Record<string, string>;
  createdAt: string;
}

export interface Thread {
  id: string;
  type: string;
  status: string;
  subject: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  initiator: { id: string; name: string; avatarUrl?: string };
  recipient: { id: string; name: string; avatarUrl?: string };
  initiatorProject?: { id: string; name: string; currentLevel: number };
  recipientProject?: { id: string; name: string; currentLevel: number };
  mergeParties?: MergeParty[];
  _count: { messages: number };
}

export interface Message {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string; avatarUrl?: string };
}

export interface MergeParty {
  id: string;
  status: string;
  proposedEquity?: number;
  reauthAt?: string;
  confirmedAt?: string;
  user: { id: string; name: string };
}

export const LEVEL_META = [
  { name: 'Ember', color: '#e85d04', fee: '$10/yr',    unlocks: 'Platform access, Slack community, project creation' },
  { name: 'Spark', color: '#f4a261', fee: '$250/mo',   unlocks: 'Dev tools, AI credits, investor access opens' },
  { name: 'Flame', color: '#ffd166', fee: '$500/mo',   unlocks: 'Domain & site support, company-building tools' },
  { name: 'Blaze', color: '#48cae4', fee: '$1,500/mo', unlocks: 'Delaware C-Corp, US banking, debit card' },
  { name: 'Nova',  color: '#90e0ef', fee: 'TBD',       unlocks: 'Funding, exit advisory, M&A guidance' },
] as const;

export const TAG_CATEGORY_LABELS: Record<string, string> = {
  domain: 'Domain',
  tech:   'Technology',
  model:  'Business Model',
  stage:  'Stage',
  geo:    'Geography',
};