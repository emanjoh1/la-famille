export function formatXAF(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} FCFA`
}

export function formatPrice(amount: number, currency: string = 'XAF'): string {
  if (currency === 'XAF') return formatXAF(amount)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
    amount,
  )
}
