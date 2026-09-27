/**
 * Checks if the application should fallback to mock API data.
 * In production, this must evaluate to false to ensure we do not
 * silently swallow backend failures.
 */
export const useMockApi = () => {
  return import.meta.env.VITE_USE_MOCK_API === 'true';
};
