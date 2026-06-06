import { NextResponse } from "next/server";

import { getSiteEditorSettings } from "@/lib/site-settings-db";

export const dynamic = "force-dynamic";

type SuggestionMode = "city" | "address";

type AddressSuggestion = {
  value: string;
  unrestrictedValue: string;
  city: string;
  street: string;
  house: string;
  fiasId: string;
};

type DadataSuggestion = {
  value?: string;
  unrestricted_value?: string;
  data?: {
    city?: string;
    city_with_type?: string;
    settlement?: string;
    settlement_with_type?: string;
    street?: string;
    street_with_type?: string;
    house?: string;
    house_type?: string;
    fias_id?: string;
  };
};

type PhotonFeature = {
  properties?: {
    name?: string;
    city?: string;
    town?: string;
    village?: string;
    locality?: string;
    district?: string;
    state?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    countrycode?: string;
    type?: string;
    osm_id?: number | string;
  };
};

function text(value: unknown, max = 300) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanCity(value: string) {
  return value
    .replace(/^(г\.?|город|пос\.?|поселок|пгт)\s+/i, "")
    .trim();
}

function uniqueSuggestions(items: AddressSuggestion[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.value.toLowerCase()}|${item.house.toLowerCase()}`;
    if (!item.value || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function getDadataSuggestions(input: {
  token: string;
  query: string;
  city: string;
  mode: SuggestionMode;
}) {
  const query = input.mode === "address" && input.city
    ? `${input.city}, ${input.query}`
    : input.query;

  const body: Record<string, unknown> = {
    query,
    count: 10,
  };

  if (input.mode === "city") {
    body.from_bound = { value: "city" };
    body.to_bound = { value: "settlement" };
  } else {
    body.from_bound = { value: "street" };
    body.to_bound = { value: "house" };
    if (input.city) {
      body.locations = [{ city: input.city }, { settlement: input.city }];
      body.restrict_value = false;
    }
  }

  const response = await fetch(
    "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Token ${input.token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(4500),
    },
  );

  if (!response.ok) return [];

  const payload = (await response.json()) as { suggestions?: DadataSuggestion[] };

  return uniqueSuggestions(
    (payload.suggestions ?? []).map((item): AddressSuggestion => {
      const city = cleanCity(
        item.data?.city ||
          item.data?.settlement ||
          item.data?.city_with_type ||
          item.data?.settlement_with_type ||
          input.city,
      );
      const street = item.data?.street_with_type || item.data?.street || "";
      const house = item.data?.house || "";
      const shortAddress = [street, house ? `${item.data?.house_type || "д"}. ${house}` : ""]
        .filter(Boolean)
        .join(", ");

      return {
        value: input.mode === "city" ? city || item.value || "" : shortAddress || item.value || "",
        unrestrictedValue: item.unrestricted_value || item.value || "",
        city,
        street,
        house,
        fiasId: item.data?.fias_id || "",
      };
    }),
  );
}

async function getPhotonSuggestions(input: {
  query: string;
  city: string;
  mode: SuggestionMode;
}) {
  const search = input.mode === "address" && input.city
    ? `${input.city} ${input.query}`
    : input.query;
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", search);
  url.searchParams.set("lang", "ru");
  url.searchParams.set("limit", "10");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "NetizenStore/1.0 address-autocomplete",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(4500),
  });

  if (!response.ok) return [];

  const payload = (await response.json()) as { features?: PhotonFeature[] };
  const mapped = (payload.features ?? [])
    .filter((feature) => {
      const country = feature.properties?.countrycode?.toUpperCase();
      return !country || country === "RU";
    })
    .map((feature): AddressSuggestion => {
      const properties = feature.properties ?? {};
      const city = cleanCity(
        properties.city ||
          properties.town ||
          properties.village ||
          properties.locality ||
          (input.mode === "city" ? properties.name || "" : input.city),
      );
      const street = properties.street || (input.mode === "address" ? properties.name || "" : "");
      const house = properties.housenumber || "";
      const addressValue = [street, house ? `д. ${house}` : ""].filter(Boolean).join(", ");
      const full = [city, addressValue].filter(Boolean).join(", ");

      return {
        value: input.mode === "city" ? city : addressValue || full,
        unrestrictedValue: [properties.postcode, full, properties.state]
          .filter(Boolean)
          .join(", "),
        city,
        street,
        house,
        fiasId: properties.osm_id ? `osm-${properties.osm_id}` : "",
      };
    });

  const cityTypes = new Set(["city", "town", "village", "locality", "municipality"]);
  const modeFiltered = input.mode === "city"
    ? mapped.filter((_, index) => {
        const type = payload.features?.[index]?.properties?.type;
        return !type || cityTypes.has(type);
      })
    : mapped;

  return uniqueSuggestions(modeFiltered.length ? modeFiltered : mapped);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { query?: string; city?: string; mode?: SuggestionMode }
    | null;
  const query = text(body?.query);
  const city = text(body?.city, 100);
  const mode: SuggestionMode = body?.mode === "city" ? "city" : "address";

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [], configured: Boolean(process.env.DADATA_API_KEY) });
  }

  const token = process.env.DADATA_API_KEY?.trim();

  if (token) {
    try {
      const suggestions = await getDadataSuggestions({ token, query, city, mode });
      if (suggestions.length) {
        return NextResponse.json({ suggestions, configured: true, source: "dadata" });
      }
    } catch (error) {
      console.error("DaData address suggestions error", error);
    }
  }

  try {
    const suggestions = await getPhotonSuggestions({ query, city, mode });
    if (suggestions.length) {
      return NextResponse.json({ suggestions, configured: Boolean(token), source: "photon" });
    }
  } catch (error) {
    console.error("Photon address suggestions error", error);
  }

  const settings = await getSiteEditorSettings();
  const needle = query.toLowerCase();
  const suggestions = uniqueSuggestions(
    settings.contacts.addresses
      .filter((address) => address.active)
      .map((address): AddressSuggestion => ({
        value: mode === "city" ? address.city : address.address,
        unrestrictedValue: [address.city, address.address].filter(Boolean).join(", "),
        city: address.city,
        street: address.address,
        house: "",
        fiasId: "",
      }))
      .filter((item) =>
        (mode === "city" ? item.city : item.unrestrictedValue).toLowerCase().includes(needle),
      ),
  ).slice(0, 8);

  return NextResponse.json({ suggestions, configured: Boolean(token), source: "settings" });
}
