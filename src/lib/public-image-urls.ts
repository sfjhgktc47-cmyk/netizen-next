export type PublicImageKind = "category" | "product" | "variant" | "banner" | "benefit" | "setting";

function isBase64Image(value: string) {
  return /^data:image\/[^;]+;base64,/.test(value.trim());
}

export function publicImageUrl(
  kind: PublicImageKind,
  id: string,
  field: string,
  value: string,
  index?: number,
) {
  const cleanValue = typeof value === "string" ? value.trim() : "";

  if (!cleanValue || !isBase64Image(cleanValue)) {
    return cleanValue;
  }

  const path = [
    kind,
    encodeURIComponent(id),
    encodeURIComponent(field),
  ].join("/");

  const query = typeof index === "number" ? `?index=${index}` : "";

  return `/api/public-image/${path}${query}`;
}

export function publicImageUrls(
  kind: PublicImageKind,
  id: string,
  field: string,
  values: string[],
) {
  return values.map((value, index) => publicImageUrl(kind, id, field, value, index));
}
