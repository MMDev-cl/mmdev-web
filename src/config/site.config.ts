export const siteConfig = {
  person: {
    name: 'Manuel Matus',
    role: 'Desarrollador Full-Stack',
    specialty: 'Servicios de asesoría informática personalizada',
    introduction:
      'Desarrollador de software con 10 años de experiencia en integración, automatización y arquitectura de sistemas. Colaboro con personas y empresas para resolver desafíos tecnológicos con soluciones claras y adaptadas a su realidad.',
    portrait: '',
    github: 'https://github.com/Manutarita',
    linkedin: '',
    instagram: '',
  },
  brand: {
    legalName: 'Manuel Matus Development SpA',
    locale: 'es-CL',
    country: 'Chile',
  },
  siteUrl: 'https://mmdev.cl',
  contact: {
    email: 'contacto@mmdev.cl',
    title: '¿Buscas asesoría informática?',
    description: 'Cuéntame qué necesitas.',
  },
  seo: {
    title: 'Manuel Matus | Desarrollador Full-Stack y asesoría informática',
    description:
      'Manuel Matus, desarrollador Full-Stack con 10 años de experiencia en software, integraciones y automatización. Asesoría informática personalizada.',
    socialImage: '/og-image.png',
  },
} as const;

export type SiteConfig = typeof siteConfig;
