export const siteConfig = {
  brand: {
    name: 'MM Dev',
    legalName: 'Manuel Matus Development SpA',
    tagline: 'Tecnología clara para trabajar mejor.',
    locale: 'es-CL',
    country: 'Chile',
  },
  siteUrl: 'https://mmdev.cl',
  navigation: [
    { label: 'Qué hacemos', href: '/#capacidades' },
    { label: 'Cómo trabajamos', href: '/#metodo' },
    { label: 'Nuestra forma de trabajar', href: '/#empresa' },
    { label: 'Contacto', href: '/#contacto' },
  ],
  hero: {
    eyebrow: 'Desarrollo de software e infraestructura digital',
    title: 'La tecnología de tu empresa, bien resuelta.',
    description:
      'Desarrollamos software, conectamos tus sistemas y nos hacemos cargo de la infraestructura que necesitas para trabajar. Partimos de lo que ya tienes y construimos contigo el siguiente paso.',
    primaryAction: { label: 'Cuéntanos qué necesitas', href: '/#contacto' },
    secondaryAction: { label: 'Explora lo que hacemos', href: '/#capacidades' },
    signalTitle: 'Un ejemplo concreto',
    signalDescription:
      'Tu inventario, tienda en línea y punto de venta pueden compartir información sin que tu equipo copie datos a mano.',
  },
  capabilities: [
    {
      number: '01',
      title: 'Software para tu operación',
      description:
        'Creamos aplicaciones y herramientas a medida cuando lo que existe no resuelve tu forma de trabajar.',
    },
    {
      number: '02',
      title: 'Sitios web y ventas en línea',
      description:
        'Desde una página de presentación hasta una tienda conectada con tu inventario y tus medios de pago.',
    },
    {
      number: '03',
      title: 'Inventario y gestión',
      description:
        'Implementamos sistemas para ordenar productos, ventas y procesos, con espacio para crecer junto a tu empresa.',
    },
    {
      number: '04',
      title: 'Integraciones y automatización',
      description:
        'Conectamos plataformas, pagos y canales de venta para reducir el trabajo repetitivo y los datos duplicados.',
    },
    {
      number: '05',
      title: 'Dominios y correo corporativo',
      description:
        'Te ayudamos a registrar y administrar tu dominio, crear correos profesionales y mantener el control de tus cuentas.',
    },
    {
      number: '06',
      title: 'Servidores y modernización',
      description:
        'Alojamos y administramos servicios o trabajamos sobre tu infraestructura. También migramos sistemas antiguos y datos dispersos.',
    },
  ],
  method: [
    {
      number: '01',
      title: 'Escuchar y revisar',
      description:
        'Conversamos contigo y revisamos tus herramientas, procesos y prioridades antes de proponer cambios.',
    },
    {
      number: '02',
      title: 'Acordar un plan',
      description:
        'Definimos qué resolver primero, qué puedes aprovechar y cuánto costarán el proyecto y su operación.',
    },
    {
      number: '03',
      title: 'Construir y conectar',
      description:
        'Desarrollamos, configuramos e integramos las piezas necesarias, explicando las decisiones importantes.',
    },
    {
      number: '04',
      title: 'Entregar y acompañar',
      description:
        'Probamos contigo el resultado y dejamos tus accesos, información y próximos pasos claramente identificados.',
    },
  ],
  company: {
    eyebrow: 'Quién está detrás',
    title: 'Experiencia técnica, trato directo y cuentas claras.',
    description:
      'Soy Manuel Matus, desarrollador de software con 10 años de experiencia en sistemas, integraciones y automatización. Creé MM Dev para poner ese trabajo al alcance de empresas que necesitan una persona con quien hablar y una solución que puedan entender y controlar.',
    principles: [
      'Tu marca, dominio, cuentas y datos deben estar bajo tu control.',
      'Te explicamos los costos iniciales y recurrentes antes de avanzar.',
      'Evaluamos opciones de código abierto y de menor costo cuando cumplen lo que necesitas.',
      'Trabajamos con seguridad, respaldos y documentación acordes a cada proyecto.',
    ],
  },
  contact: {
    email: 'contacto@mmdev.cl',
    title: 'Cuéntanos qué te gustaría mejorar.',
    description:
      'No necesitas tener la solución definida. Describe tu situación con tus palabras y conversemos sobre el primer paso.',
    serviceOptions: [
      'Desarrollo de software',
      'Sitio o plataforma web',
      'Implementación de sistemas',
      'Automatización e integraciones',
      'Dominios, DNS o correo',
      'Infraestructura y continuidad',
      'Otra consulta o necesito orientación',
    ],
  },
  seo: {
    title: 'MM Dev | Software, integraciones e infraestructura para empresas',
    description:
      'Desarrollamos software, conectamos sistemas y ordenamos la tecnología de tu empresa. Trabajo cercano, costos claros y control de tus activos digitales en Chile.',
    socialImage: '/og-image.png',
  },
} as const;

export type SiteConfig = typeof siteConfig;
