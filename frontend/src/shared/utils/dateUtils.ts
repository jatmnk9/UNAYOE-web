import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha a un formato legible en español
 */
export const formatDate = (
  date: string | Date,
  formatStr: string = 'dd/MM/yyyy HH:mm'
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) {
      return 'Fecha inválida';
    }

    return format(dateObj, formatStr, { locale: es });
  } catch (error) {
    return 'Fecha inválida';
  }
};

/**
 * Formatea una fecha de forma relativa (ej: "hace 2 horas")
 */
export const formatRelativeDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) {
      return 'Fecha inválida';
    }

    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Ahora mismo';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
    } else {
      return formatDate(dateObj, 'dd/MM/yyyy');
    }
  } catch (error) {
    return 'Fecha inválida';
  }
};

/**
 * Formatea una fecha solo con la hora
 */
export const formatTime = (date: string | Date): string => {
  return formatDate(date, 'HH:mm');
};

/**
 * Formatea una fecha solo con el día
 */
export const formatDateOnly = (date: string | Date): string => {
  return formatDate(date, 'dd/MM/yyyy');
};

/**
 * Formatea una fecha de forma completa en español
 */
export const formatDateLong = (date: string | Date): string => {
  return formatDate(date, "d 'de' MMMM 'de' yyyy");
};

/**
 * Verifica si una fecha es hoy
 */
export const isToday = (date: string | Date): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();

    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    return false;
  }
};

/**
 * Obtiene el mínimo datetime para inputs (ahora)
 */
export const getMinDateTime = (): string => {
  return new Date().toISOString().slice(0, 16);
};
