/**
 *  Rounding function for neatly displaying pixel values to a maximum of 2 decimal places.
 *
 *  Examples:
 *  formatNumber(124)                 // 124
 *  formatNumber(201.5)               // 201.5
 *  formatNumber(88.56)               // 88.56
 *  formatNumber(299.636)             // 299.64
 *  formatNumber(67.699)              // 67.7
 *  formatNumber(454.99999999999994)  // 455
 *  formatNumber(12.340)              // 12.34
 *  formatNumber(5.6000)              // 5.6
 */

export function formatNumber(value: number): number {
  const rounded = Math.round(value * 100) / 100;
  return parseFloat(rounded.toString());
}
