export type ProjectStatus = 'draft' | 'prototype' | 'in_progress' | 'completed' | 'archived';

export interface Profile {
  id: string;
  full_name: string;
  title: string;
  hero_heading: string;
  hero_description: string;
  badge_text: string | null;
  biography: string | null;
  profile_photo_url: string | null;
  location: string | null;
  current_status: string | null;
  current_focus: string | null;
  interests: string | null;
  degree: string | null;
  university: string | null;
  public_email: string | null;
  availability: string | null;
  resume_url: string | null;
  updated_at: string;
}

export interface ProjectCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  active: boolean;
}

export interface Technology {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  category_id: string | null;
  status: ProjectStatus;
  project_role: string | null;
  is_team: boolean;
  team_details: string | null;
  project_date: string | null;
  cover_image_url: string | null;

  problem: string | null;
  goal: string | null;
  solution: string | null;
  how_it_works: string | null;
  hardware_components: string | null;
  software_technologies: string | null;
  architecture_description: string | null;
  architecture_image_url: string | null;
  circuit_diagram_url: string | null;
  wiring_image_url: string | null;
  development_process: string | null;
  challenges: string | null;
  lessons_learned: string | null;
  future_improvements: string | null;

  github_url: string | null;
  documentation_url: string | null;
  demo_url: string | null;
  video_url: string | null;

  is_featured: boolean;
  is_published: boolean;

  created_at: string;
  updated_at: string;

  // joined
  category?: ProjectCategory | null;
  technologies?: Technology[];
  images?: ProjectImage[];
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
}

export interface SkillCategory {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  visible: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category_id: string | null;
  icon: string | null;
  display_order: number;
  visible: boolean;
  category?: SkillCategory | null;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  start_date: string | null;
  end_date: string | null;
  currently_studying: boolean;
  description: string | null;
  display_order: number;
  visible: boolean;
}

export interface Certification {
  id: string;
  title: string;
  organization: string;
  issue_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  certificate_image_url: string | null;
  category: string | null;
  visible: boolean;
  display_order: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  display_order: number;
  enabled: boolean;
}

export interface SectionSetting {
  id: string;
  section_key: string;
  label: string;
  enabled: boolean;
  display_order: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      project_categories: { Row: ProjectCategory; Insert: Partial<ProjectCategory>; Update: Partial<ProjectCategory> };
      technologies: { Row: Technology; Insert: Partial<Technology>; Update: Partial<Technology> };
      projects: { Row: Project; Insert: Partial<Project>; Update: Partial<Project> };
      project_technologies: { Row: { project_id: string; technology_id: string }; Insert: { project_id: string; technology_id: string }; Update: never };
      project_images: { Row: ProjectImage; Insert: Partial<ProjectImage>; Update: Partial<ProjectImage> };
      skill_categories: { Row: SkillCategory; Insert: Partial<SkillCategory>; Update: Partial<SkillCategory> };
      skills: { Row: Skill; Insert: Partial<Skill>; Update: Partial<Skill> };
      education: { Row: Education; Insert: Partial<Education>; Update: Partial<Education> };
      certifications: { Row: Certification; Insert: Partial<Certification>; Update: Partial<Certification> };
      social_links: { Row: SocialLink; Insert: Partial<SocialLink>; Update: Partial<SocialLink> };
      section_settings: { Row: SectionSetting; Insert: Partial<SectionSetting>; Update: Partial<SectionSetting> };
      contact_messages: { Row: ContactMessage; Insert: Partial<ContactMessage>; Update: Partial<ContactMessage> };
      site_settings: { Row: { key: string; value: unknown }; Insert: { key: string; value: unknown }; Update: { key: string; value: unknown } };
    };
  };
}
