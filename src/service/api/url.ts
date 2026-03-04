type Id = number | string;

export function buildResourceItemUrl(resourcePath: string, id: Id) {
  return `${resourcePath}/${encodeURIComponent(String(id))}`;
}
