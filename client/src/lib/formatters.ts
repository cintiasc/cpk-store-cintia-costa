/**
 * Formata um valor numérico para moeda brasileira (BRL)
 * @param value - Valor numérico ou string a ser formatado
 * @returns String formatada como R$ 0,00
 */
export function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

/**
 * Formata um número decimal para o padrão brasileiro
 * @param value - Valor numérico ou string a ser formatado
 * @param decimals - Número de casas decimais (padrão: 2)
 * @returns String formatada com vírgula como separador decimal
 */
export function formatNumber(value: string | number, decimals: number = 2): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue);
}
