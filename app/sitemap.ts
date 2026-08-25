import type { MetadataRoute } from 'next';
import { getPublishedProjects } from '@/lib/data/public';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const projects = await getPublishedProjects();

  const staticRoutes = ['', '/about', '/projects', '/skills', '/education', '/contact'].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));

  const projectRoutes = projects.map((p) => ({
    url: `${siteUrl}/projects/${p.slug}`,
    lastModified: new Date(p.updated_at),
  }));

  return [...staticRoutes, ...projectRoutes];
}
