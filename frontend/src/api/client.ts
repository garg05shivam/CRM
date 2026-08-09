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
    let message =
      data.message ||
      "Something went wrong";

    if (
      data.errors &&
      typeof data.errors === "object"
    ) {
      const details = Object.entries(
        data.errors,
      )
        .map(([field, errs]) => {
          const formattedField = field
            .replace(/([A-Z])/g, " $1")
            .toLowerCase();

          const msgs = Array.isArray(errs)
            ? errs.join(", ")
            : String(errs);

          return `${formattedField}: ${msgs}`;
        })
        .join("; ");

      if (details) {
        message = `${message} — ${details}`;
      }
    }

    throw new Error(message);
  }

  return data;
};