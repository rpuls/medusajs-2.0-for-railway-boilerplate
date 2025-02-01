const withRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) break;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export const getMeilisearchAdminKey = async (endpoint: string, masterKey: string): Promise<string> => {
  console.log('Attempting to fetch Meilisearch admin key...');
  const operation = async () => {
    const response = await fetch(`${endpoint}/keys`, {
      headers: { Authorization: `Bearer ${masterKey}` }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Meilisearch keys: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Meilisearch keys response:', data);

    const adminKey = data?.results?.find((key: any) => 
      Array.isArray(key.actions) && 
      key.actions.includes('*')
    );

    if (!adminKey?.key) {
      throw new Error('No valid admin key found in Meilisearch response');
    }
    return adminKey.key;
  };

  return await withRetry(operation);
};
