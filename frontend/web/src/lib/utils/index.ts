import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases de Tailwind CSS de forma segura
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea número con coma para miles y punto para decimales
 */
export const formatNumber = (
  value: number,
  decimals = 0
) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Formatea un número como moneda colombiana (COP)
 * Coma para miles, punto para decimales
 */
export const formatCurrency = (value: number) => {
  return `$ ${formatNumber(value, 0)}`;
};

/**
 * Formatea un número como porcentaje
 */
export const formatPercent = (value: number) => {
  return `${formatNumber(value, 1)}%`;
};
