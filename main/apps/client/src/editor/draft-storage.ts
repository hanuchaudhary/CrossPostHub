export function saveEditorDraft(key: string, state: object) {
  const data = Object.fromEntries(
    Object.entries(state).filter(([, value]) => typeof value !== "function"),
  );
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadEditorDraft<T extends object>(
  key: string,
  current: T,
): Partial<T> | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const draft: unknown = JSON.parse(raw);
  if (!draft || typeof draft !== "object" || Array.isArray(draft))
    throw new Error("The saved draft is invalid.");
  const restore = (
    defaults: Record<string, unknown>,
    saved: Record<string, unknown>,
  ): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    for (const [field, value] of Object.entries(saved)) {
      if (
        !Object.hasOwn(defaults, field) ||
        typeof defaults[field] === "function"
      )
        continue;
      const fallback = defaults[field];
      if (
        field === "theme" &&
        !Array.isArray(fallback) &&
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        result[field] = value;
        continue;
      }
      if (
        fallback &&
        value &&
        typeof fallback === "object" &&
        typeof value === "object" &&
        !Array.isArray(fallback) &&
        !Array.isArray(value)
      ) {
        result[field] = {
          ...fallback,
          ...restore(
            fallback as Record<string, unknown>,
            value as Record<string, unknown>,
          ),
        };
      } else if (
        Array.isArray(fallback)
          ? Array.isArray(value)
          : typeof value === typeof fallback
      ) {
        result[field] = value;
      }
    }
    return result;
  };
  return restore(
    current as Record<string, unknown>,
    draft as Record<string, unknown>,
  ) as Partial<T>;
}
