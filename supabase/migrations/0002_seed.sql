-- ============================================================================
-- Seed data
--
-- Only content confirmed by the provided design files is included.
-- The "Edit Project" admin mockup also contained specific outcome claims
-- ("85% cost reduction", "3 international replications") — these read like
-- placeholder/demo copy rather than verified facts, so per the no-fake-data
-- policy they are deliberately left OUT. Add them from /admin if accurate.
-- ============================================================================

insert into profiles (
  full_name, title, hero_heading, hero_description, badge_text,
  biography, location, current_status, degree, university
) values (
  'Senuthi Yuhansa',
  'Information Technology Undergraduate',
  'Learning, Building & Exploring Technology',
  'I''m an Information Technology undergraduate interested in learning how technology works, exploring new ideas, developing technical skills, and building practical projects.',
  'Undergraduate | Learning & Building',
  'I am deeply interested in problem-solving and building practical projects. My focus lies in understanding the core architecture of systems and leveraging that knowledge to create robust, efficient, and user-centric applications.',
  'Sri Lanka',
  'Undergraduate',
  'BSc IT',
  null
);

insert into section_settings (section_key, label, enabled, display_order) values
  ('hero', 'Hero', true, 1),
  ('about', 'About', true, 2),
  ('projects', 'Projects', true, 3),
  ('skills', 'Skills', true, 4),
  ('education', 'Education', true, 5),
  ('certifications', 'Certifications', false, 6),
  ('contact', 'Contact', true, 7);

insert into project_categories (name, slug, description, display_order, active) values
  ('Hardware', 'hardware', 'Physical/embedded projects combining hardware and software.', 1, true);

insert into technologies (name) values
  ('Arduino'), ('C++'), ('Fusion 360'), ('3D Printing');

with cat as (select id from project_categories where slug = 'hardware'),
     proj as (
       insert into projects (
         title, slug, short_description, full_description,
         category_id, status, project_role, project_date,
         problem, solution, hardware_components,
         is_featured, is_published
       )
       select
         'Braille Printer',
         'braille-printer',
         'An accessible, low-cost hardware prototype designed to translate digital text into tactile braille, empowering visually impaired users with physical reading materials.',
         'The Braille Printer is a hardware-software integration project aimed at bridging the gap between digital text and physical accessibility. Operating via a custom microcontroller setup, it parses standard text files, applies braille translation algorithms, and actuates a precise mechanical head to emboss standard paper.',
         cat.id,
         'prototype',
         'Lead Hardware Engineer',
         '2023-10-01',
         'Commercial braille embossers are prohibitively expensive for individual users. This project sought to democratize access to tactile reading materials by engineering a functional, low-cost alternative using readily available components and open-source software principles, focusing on modularity and ease of assembly.',
         'We engineered a low-cost alternative utilizing standard 3D printed parts and widely available stepper motors. The firmware translates text into braille dot patterns, driving a custom solenoid mechanism to emboss standard paper.',
         E'Controller Unit: Arduino-based microcontroller handling serial communication, G-code parsing, and stepper motor coordination.\nActuation Head: Custom 3D-printed carriage housing a high-speed solenoid designed to provide the exact force needed for braille embossing.\nDrive System: NEMA 17 stepper motors coupled with GT2 timing belts for precise X/Y axis positioning of the paper and print head.',
         true,
         true
       from cat
       returning id
     )
insert into project_technologies (project_id, technology_id)
select proj.id, technologies.id
from proj, technologies
where technologies.name in ('Arduino', 'C++', 'Fusion 360', '3D Printing');
