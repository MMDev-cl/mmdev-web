export const siteConfig = {
  person: {
    name: 'Manuel Matus',
    role: 'Desarrollador Full-Stack',
    specialty: 'Servicios de asesoría informática personalizada',
    introduction:
      'Soy desarrollador de software con 10 años de experiencia en integración, automatización y arquitectura de sistemas. Ayudo a empresas y personas a resolver desafíos tecnológicos con soluciones claras y adaptadas a su realidad.',
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
    description:
      'Cuéntame qué necesitas. Podemos partir con una conversación sencilla y ver juntos cómo avanzar.',
  },
  seo: {
    title: 'Manuel Matus | Desarrollador Full-Stack y asesoría informática',
    description:
      'Manuel Matus, desarrollador Full-Stack con 10 años de experiencia en software, integraciones y automatización. Asesoría informática personalizada.',
    socialImage: '/og-image.png',
  },
} as const;

export type SiteConfig = typeof siteConfig;
