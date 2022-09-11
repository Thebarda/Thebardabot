interface CustomFetchProps {
  endpoint: string;
  fetchHeaders?: HeadersInit;
  signal?: AbortSignal;
}

export const customFetch = async <T>({ endpoint, fetchHeaders, signal }: CustomFetchProps): Promise<T> => {
  return fetch(endpoint, {
    headers: fetchHeaders,
    signal,
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    return response.json();
  })
}