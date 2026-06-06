import { NextResponse } from "next/server";

import { getSiteEditorSettings } from "@/lib/site-settings-db";

export const dynamic = "force-dynamic";

type DadataSuggestion = {
  value?: string;
  unrestricted_value?: string;
  data?: {
    city?: string;
    settlement?: string;
    street_with_type?: string;
    house?: string;
    fias_id?: string;
  };
};

function text(value: unknown, max = 300) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { query?: string; city?: string }
    | null;
  const query = text(body?.query);
  const city = text(body?.city, 100);

  if (query.length < 3) {
    return NextResponse.json({ suggestions: [], configured: Boolean(process.env.DADATA_API_KEY) });
  }

  const token = process.env.DADATA_API_KEY?.trim();
  if (token) {
    try {
      const response = await fetch(
        "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            query: city && !query.toLowerCase().includes(city.toLowerCase())
              ? `${city}, ${query}`
              : query,
            count: 8,
          }),
          cache: "no-store",
        },
      );

      if (response.ok) {
        const payload = (await response.json()) as { suggestions?: DadataSuggestion[] };
        const suggestions = (payload.suggestions ?? []).map((item) => ({
          value: item.value ?? "",
          unrestrictedValue: item.unrestricted_value ?? item.value ?? "",
          city: item.data?.city ?? item.data?.settlement ?? city,
          street: item.data?.street_with_type ?? "",
          house: item.data?.house ?? "",
          fiasId: item.data?.fias_id ?? "",
        }));
        return NextResponse.json({ suggestions, configured: true });
      }
    } catch (error) {
      console.error("Address suggestions error", error);
    }
  }

  const settings = await getSiteEditorSettings();
  const needle = query.toLowerCase();
  const suggestions = settings.contacts.addresses
    .filter((address) => address.active)
    .map((address) => ({
      value: [address.city, address.address].filter(Boolean).join(", "),
      unrestrictedValue: [address.city, address.address].filter(Boolean).join(", "),
      city: address.city,
      street: address.address,
      house: "",
      fiasId: "",
    }))
    .filter((item) => item.value.toLowerCase().includes(needle))
    .slice(0, 5);

  return NextResponse.json({ suggestions, configured: Boolean(token) });
}
