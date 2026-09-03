export const fetcher = async <T>(url: string): Promise<T> => {
  try {
    const response = await fetch(url);

    // Check for HTTP errors (4xx, 5xx)
    if (!response.ok) {
      const errorBody = await response.text();
      // Throw an error with the status and the body (if any)
      throw new Error(`Request failed: ${response.status} ${errorBody}`);
    }

    // Return the JSON data
    return (await response.json()) as T; // Optional: Add 'as T' for strict typing
  } catch (error) {
    // Log to console (optional) and re-throw so SWR can catch it
    console.error("Fetch error in fetcher:", error);
    throw error;
  }
};