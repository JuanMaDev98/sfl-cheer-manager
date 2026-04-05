export type Locale = 'en' | 'es';

const translations = {
  en: {
    // Onboarding
    'onboarding.title': 'Welcome to SFL Cheer Manager',
    'onboarding.subtitle': 'Connect your Sunflower Land farm',
    'onboarding.farm_id_placeholder': 'Enter your Farm ID',
    'onboarding.farm_id_hint': 'Find your Farm ID in the game settings',
    'onboarding.username_loading': 'Checking farm...',
    'onboarding.username_found': 'Farm found!',
    'onboarding.username_not_found': 'Farm ID not found. Please check and try again.',
    'onboarding.username_error': 'Could not verify farm. Please try again.',
    'onboarding.confirm_username': 'Is this you?',
    'onboarding.refresh': 'Refresh',
    'onboarding.continue': 'Continue',
    // Navigation
    'nav.home': 'Home',
    'nav.create': 'Publish',
    'nav.my_posts': 'My Posts',
    'nav.settings': 'Settings',
    // Feed
    'feed.title': 'SFL Cheer Manager',
    'feed.empty': 'No posts yet. Be the first!',
    'feed.no_results': 'No posts match your filters.',
    'feed.filter_all': 'All',
    'feed.filter_help': 'Help',
    'feed.filter_cheer': 'Cheer',
    'feed.filter_no_interest': 'No interest yet',
    'feed.contact_count': '{count} contacts today',
    'feed.active_users': '{count} active users',
    // Post Detail
    'post.detail.title': 'Post Details',
    'post.type.help': 'Help x Help',
    'post.type.cheer': 'Cheer x Cheer',
    'post.note': 'Note',
    'post.note_empty': 'No note',
    'post.language': 'Language',
    'post.contact': 'Contact on Telegram',
    'post.contact_warning': 'You are about to open a chat with this user on Telegram.',
    'post.close': 'Close Post',
    'post.confirm_close': 'Are you sure you want to close this post?',
    'post.closed': 'Post closed',
    'post.reset_interest': 'Remove notification',
    'post.interest_removed': 'Notification removed',
    // Create Post
    'create.title': 'Publish a Request',
    'create.type_label': 'What do you need?',
    'create.language_label': 'Your communication language',
    'create.note_label': 'Note (optional)',
    'create.note_hint': 'Briefly describe what you are looking for...',
    'create.submit': 'Publish',
    'create.success': 'Published successfully!',
    'create.error': 'Could not publish. Please try again.',
    'create.type_exists': 'You already have an active post for this type.',
    // Username Required
    'username.required': 'Your Telegram username must be visible to create posts.',
    'username.required_action': 'Go to Telegram Settings → Edit Profile → Username',
    // Errors
    'error.generic': 'Something went wrong. Please try again.',
    'error.network': 'Network error. Please check your connection.',
  },
  es: {
    // Onboarding
    'onboarding.title': 'Bienvenido a SFL Cheer Manager',
    'onboarding.subtitle': 'Conecta tu granja de Sunflower Land',
    'onboarding.farm_id_placeholder': 'Ingresa tu Farm ID',
    'onboarding.farm_id_hint': 'Encuentra tu Farm ID en la configuración del juego',
    'onboarding.username_loading': 'Verificando granja...',
    'onboarding.username_found': '¡Granja encontrada!',
    'onboarding.username_not_found': 'Farm ID no encontrado. Por favor verifica e intenta de nuevo.',
    'onboarding.username_error': 'No se pudo verificar la granja. Por favor intenta de nuevo.',
    'onboarding.confirm_username': '¿Eres tú?',
    'onboarding.refresh': 'Actualizar',
    'onboarding.continue': 'Continuar',
    // Navigation
    'nav.home': 'Inicio',
    'nav.create': 'Publicar',
    'nav.my_posts': 'Mis Publicaciones',
    'nav.settings': 'Configuración',
    // Feed
    'feed.title': 'SFL Cheer Manager',
    'feed.empty': 'No hay publicaciones aún. ¡Sé el primero!',
    'feed.no_results': 'Ninguna publicación coincide con tus filtros.',
    'feed.filter_all': 'Todos',
    'feed.filter_help': 'Ayuda',
    'feed.filter_cheer': 'Animación',
    'feed.filter_no_interest': 'Sin interés aún',
    'feed.contact_count': '{count} contactos hoy',
    'feed.active_users': '{count} usuarios activos',
    // Post Detail
    'post.detail.title': 'Detalles de la Publicación',
    'post.type.help': 'Ayuda x Ayuda',
    'post.type.cheer': 'Animación x Animación',
    'post.note': 'Nota',
    'post.note_empty': 'Sin nota',
    'post.language': 'Idioma',
    'post.contact': 'Contactar por Telegram',
    'post.contact_warning': 'Estás a punto de abrir un chat con este usuario en Telegram.',
    'post.close': 'Cerrar Publicación',
    'post.confirm_close': '¿Estás seguro de que quieres cerrar esta publicación?',
    'post.closed': 'Publicación cerrada',
    'post.reset_interest': 'Quitar notificación',
    'post.interest_removed': 'Notificación eliminada',
    // Create Post
    'create.title': 'Publicar una Solicitud',
    'create.type_label': '¿Qué necesitas?',
    'create.language_label': 'Tu idioma de comunicación',
    'create.note_label': 'Nota (opcional)',
    'create.note_hint': 'Describe brevemente lo que buscas...',
    'create.submit': 'Publicar',
    'create.success': '¡Publicado exitosamente!',
    'create.error': 'No se pudo publicar. Por favor intenta de nuevo.',
    'create.type_exists': 'Ya tienes una publicación activa de este tipo.',
    // Username Required
    'username.required': 'Tu nombre de usuario de Telegram debe ser visible para crear publicaciones.',
    'username.required_action': 'Ve a Telegram → Configuración → Editar Perfil → Nombre de usuario',
    // Errors
    'error.generic': 'Algo salió mal. Por favor intenta de nuevo.',
    'error.network': 'Error de red. Por favor verifica tu conexión.',
  },
};

export function t(key: string, locale: Locale = 'en', params: Record<string, string | number> = {}): string {
  let text = (translations[locale] as Record<string, string>)?.[key] ?? (translations.en as Record<string, string>)?.[key] ?? key;

  Object.entries(params).forEach(([k, v]) => {
    text = text.replace(`{${k}}`, String(v));
  });

  return text;
}

export const supportedLocales: Locale[] = ['en', 'es'];
