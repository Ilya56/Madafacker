/**
 * Just promisified setTimeout without any action, just delay for a flow
 * @param ms ms to wait
 */
export function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
