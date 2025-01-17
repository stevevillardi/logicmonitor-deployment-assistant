import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lm-deployment-assistant.vercel.app'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/callback', '/pov/', '/active-pov/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
} 