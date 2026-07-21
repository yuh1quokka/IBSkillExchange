import { User, House, Diamond, SquarePlus, CalendarDays } from 'lucide-react';

export const CATEGORIES = [
  'Biology',
  'Chemistry',
  'Math',
  'English',
  'Japanese',
  'History',
  'TOK',
  'EE',
  'IA',
  'CAS',
  'Presentation',
  'Essay',
  'Video Editing',
  'Art',
  'Ideas',
  'Other'
];

export const CLASSES = [
  '1-9',
  '2-9',
  '3-9'
];

export const NAV_ITEMS = [
  ['home', <House size={20} />, 'ホーム'],
  ['requests', <Diamond size={20} />, 'リクエスト'],
  ['create', <SquarePlus size={20} />, '出品'],
  ['bookings', <CalendarDays size={20} />, '予約'],
  ['profile', <User size={20} />, 'プロフィール'],
];