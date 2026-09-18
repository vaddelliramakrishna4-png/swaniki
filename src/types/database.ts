export type EventTemplate = 'Grove' | 'Sprint' | 'Bloom' | 'Vertex' | 'Ember';

export type EventStatus = 'published' | 'draft' | 'live' | 'past' | 'cancelled';

export type RSVPStatus = 'confirmed' | 'waitlisted' | 'cancelled';

export interface CustomQuestion {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox';
  options?: string[];
  required: boolean;
}

export interface Speaker {
  name: string;
  role: string;
  company?: string;
  avatar_url?: string;
  bio?: string;
}

export interface AgendaItem {
  time: string;
  title: string;
  description?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface EventSections {
  speakers?: Speaker[];
  agenda?: AgendaItem[];
  faq?: FAQItem[];
  gallery?: string[];
}

export interface RSVPFormConfig {
  enable_plus_one?: boolean;
  allow_plus_one?: boolean;
  enable_dietary?: boolean;
  collect_dietary?: boolean;
  custom_questions?: CustomQuestion[];
}

export interface EventItem {
  id: string;
  organizer_id?: string;
  title: string;
  description: string | null;
  category: string | null;
  theme_template: EventTemplate | string;
  start_time: string;
  end_time: string | null;
  start_at?: string;
  end_at?: string;
  location: string | null;
  venue_name: string | null;
  location_name?: string | null;
  location_address?: string | null;
  is_virtual: boolean;
  capacity: number;
  approval_required: boolean;
  status: EventStatus | string;
  created_at?: string;
  cover_url: string | null;
  custom_questions: CustomQuestion[];
  rsvp_form_config?: RSVPFormConfig;
  slug?: string | null;
  tagline?: string | null;
  sections?: EventSections;
  organizer_name?: string;
  organizer_avatar?: string;
  city?: string | null;
  rsvp_count?: number;
}

export interface RSVPAnswers {
  phone?: string;
  plus_one?: boolean;
  plus_one_name?: string;
  notes?: string;
  [key: string]: any;
}

export interface RSVPItem {
  id: string;
  event_id: string;
  user_id?: string | null;
  guest_name: string;
  guest_email: string;
  status: RSVPStatus | string;
  answers: RSVPAnswers;
  created_at?: string;
  event?: EventItem | null;
}

export interface CommentItem {
  id: string;
  event_id: string;
  author_name: string;
  author_email?: string;
  body: string;
  created_at: string;
}

export interface DatePollOption {
  date: string;
  votes: string[]; // array of emails
}

export interface DatePollItem {
  id: string;
  organizer_id?: string;
  title: string;
  slug: string;
  options: DatePollOption[];
  created_at: string;
}

export interface ProfileItem {
  id: string;
  role: 'organizer' | 'guest';
  name: string;
  handle: string;
  bio?: string;
  logo_url?: string;
  brand_color?: string;
  brand_font?: string;
  phone?: string;
  email?: string;
  created_at?: string;
}
