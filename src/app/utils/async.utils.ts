export async function runWithLoading<T>(
  setLoading: (value: boolean) => void,
  fn: () => Promise<T>,
  options?: { onCatch?: (error: unknown) => void },
): Promise<T> {
  setLoading(true);
  try {
    return await fn();
  } catch (e) {
    options?.onCatch?.(e);
    throw e;
  } finally {
    setLoading(false);
  }
}
