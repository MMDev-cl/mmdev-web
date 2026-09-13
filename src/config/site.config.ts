export const siteConfig = {
  brand: {
    name: 'MM Dev',
    legalName: 'Manuel Matus Development SpA',
    tagline: 'Tecnología diseñada para operar, integrarse y crecer.',
    locale: 'es-CL',
    country: 'Chile',
  },
  siteUrl: 'https://mmdev.cl',
  navigation: [
    { label: 'Capacidades', href: '/#capacidades' },
    { label: 'Cómo trabajamos', href: '/#metodo' },
    { label: 'Empresa', href: '/#empresa' },
    { label: 'Contacto', href: '/#contacto' },
  ],
  hero: {
    eyebrow: 'Manuel Matus Development SpA',
    title: 'Tecnología diseñada para operar, integrarse y crecer.',
    description:
      'Diseñamos software, plataformas web e infraestructura digital para empresas que necesitan soluciones claras, seguras y sostenibles.',
    primaryAction: { label: 'Conversemos', href: '/#contacto' },
    secondaryAction: { label: 'Conocer capacidades', href: '/#capacidades' },
    signalTitle: 'Ingeniería aplicada al negocio',
    signalDescription:
      'Implementación documentada, activos bajo control y continuidad técnica desde el primer despliegue.',
  },
  capabilities: [
    {
      number: '01',
      title: 'Software e integraciones',
      description:
        'Desarrollo backend, automatización e integración entre sistemas para resolver procesos concretos.',
    },
    {
      number: '02',
      title: 'Sitios y plataformas web',
      description:
        'Experiencias web rápidas, accesibles y preparadas para crecer junto con la operación.',
    },
    {
      number: '03',
      title: 'Sistemas empresariales',
      description:
        'Implementación y adaptación de plataformas para inventario, operación y gestión comercial.',
    },
    {
      number: '04',
      title: 'Automatización de procesos',
      description:
        'Flujos reproducibles que reducen tareas manuales, errores y dependencia operacional.',
    },
    {
      number: '05',
      title: 'Dominios, DNS y correo',
      description:
        'Configuración y gobierno de activos digitales críticos con propiedad y recuperación claras.',
    },
    {
      number: '06',
      title: 'Infraestructura y continuidad',
      description:
        'Despliegues versionados, respaldos y controles técnicos orientados a una operación sostenible.',
    },
  ],
  method: [
    {
      number: '01',
      title: 'Entender',
      description:
        'Levantamos el contexto, las restricciones y el resultado que realmente necesita el negocio.',
    },
    {
      number: '02',
      title: 'Diseñar',
      description:
        'Definimos alcance, arquitectura, riesgos, responsabilidades y criterios de aceptación.',
    },
    {
      number: '03',
      title: 'Implementar',
      description:
        'Construimos de forma versionada, verificable y separada de los datos sensibles.',
    },
    {
      number: '04',
      title: 'Validar y continuar',
      description:
        'Probamos, documentamos y dejamos una ruta clara de soporte, recuperación y evolución.',
    },
  ],
  company: {
    eyebrow: 'Empresa',
    title: 'Una contraparte técnica para decisiones que deben perdurar.',
    description:
      'MM Dev es la línea tecnológica de Manuel Matus Development SpA. Combinamos desarrollo, infraestructura e integración para entregar soluciones mantenibles y conectadas con la realidad operacional de cada empresa.',
    principles: [
      'Propiedad clara de dominios, cuentas y activos.',
      'Código y despliegues bajo control de versiones.',
      'Seguridad y recuperación consideradas desde el diseño.',
      'Documentación útil para operar y evolucionar.',
    ],
  },
  contact: {
    email: 'contacto@mmdev.cl',
    title: 'Cuéntenos qué necesita resolver.',
    description:
      'Comparta el contexto de su empresa y la necesidad principal. Revisaremos la consulta y responderemos desde nuestro canal corporativo.',
    serviceOptions: [
      'Desarrollo de software',
      'Sitio o plataforma web',
      'Implementación de sistemas',
      'Automatización e integraciones',
      'Dominios, DNS o correo',
      'Infraestructura y continuidad',
      'Necesito orientación',
    ],
  },
  seo: {
    title: 'MM Dev | Desarrollo de software e infraestructura digital',
    description:
      'Desarrollo de software, plataformas web, automatización, integración de sistemas e infraestructura digital para empresas en Chile.',
    socialImage: '/og-image.png',
  },
} as const;

export type SiteConfig = typeof siteConfig;
