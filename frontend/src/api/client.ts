const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = localStorage.getItem(
    "accessToken",
  );

  const headers = new Headers(
    options.headers,
  );

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Something went wrong",
    );
  }

  return data;
};