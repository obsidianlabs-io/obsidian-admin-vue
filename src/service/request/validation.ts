export type ValidationErrorMap = Partial<Record<string, string[]>>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toStringMessages(value: unknown): string[] {
  if (typeof value === 'string') {
    const message = value.trim();

    return message ? [message] : [];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => {
      if (typeof item === 'string') {
        return item.trim();
      }

      if (isRecord(item) && typeof item.message === 'string') {
        return item.message.trim();
      }

      return '';
    })
    .filter(Boolean);
}

function normalizeValidationErrors(candidate: unknown): ValidationErrorMap {
  if (!isRecord(candidate)) {
    return {};
  }

  return Object.entries(candidate).reduce<ValidationErrorMap>((acc, [field, value]) => {
    const messages = toStringMessages(value);

    if (messages.length > 0) {
      acc[field] = messages;
    }

    return acc;
  }, {});
}

function extractValidationErrors(error: unknown): ValidationErrorMap {
  if (!error || typeof error !== 'object') {
    return {};
  }

  const response = (
    error as {
      response?: {
        data?: {
          errors?: unknown;
          data?: {
            errors?: unknown;
          };
        };
      };
    }
  ).response;

  return {
    ...normalizeValidationErrors(response?.data?.errors),
    ...normalizeValidationErrors(response?.data?.data?.errors)
  };
}

export function resolveValidationErrors(error: unknown): ValidationErrorMap {
  return extractValidationErrors(error);
}
