export interface Profile {
  id: number;
  full_name: string;
  role_title: string;
  hero_greeting: string;
  hero_role: string;
  hero_subtitle: string;
  about_text: string;
  location: string | null;
  availability: string | null;
  languages: string | null;
  interests: string | null;
  avatar_url: string | null;
  cv_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  email: string | null;
  hero_bg_image_url: string | null;
  hero_bg_color: string | null;
  hero_text_color: string | null;
  updated_at: string;
}

export type TechnologyCategory = 'backend' | 'frontend' | 'database' | 'tools';

export interface Technology {
  id: string;
  category: TechnologyCategory;
  name: string;
  icon_slug: string;
  sort_order: number;
  created_at: string;
}

export type ProjectStatus = 'production' | 'in_progress' | 'archived';

export interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  tech_tags: string[];
  github_url: string | null;
  demo_url: string | null;
  status: ProjectStatus;
  sort_order: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  technologies: string[];
  sort_order: number;
  created_at: string;
}

export type EducationType = 'education' | 'certificate';

export interface EducationCertificate {
  id: string;
  type: EducationType;
  title: string;
  institution: string;
  date: string;
  certificate_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Hobby {
  id: string;
  emoji: string;
  label: string;
  sort_order: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
