import { NextResponse } from "next/server";

import { getSiteEditorSettings } from "@/lib/site-settings-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    region_with_type?: string;
    city?: string;
    city_with_type?: string;
    settlement?: string;
    settlement_with_type?: string;
    street?: string;
    street_with_type?: string;
    house?: string;
    house_type?: string;
    block?: string;
    block_type?: string;
    fias_id?: string;
  };
};

type YandexComponent = {
  name?: string;
  kind?: string;
};

type YandexSuggestion = {
  title?: { text?: string };
  subtitle?: { text?: string };
  address?: {
    formatted_address?: string;
    component?: YandexComponent[];
  };
  uri?: string;
};

type PhotonFeature = {
  properties?: {
    name?: string;
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    locality?: string;
    district?: string;
    county?: string;
    state?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    countrycode?: string;
    type?: string;
    osm_key?: string;
    osm_value?: string;
    osm_id?: number | string;
  };
};

function text(value: unknown, max = 300) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanCity(value: string) {
  return value
    .replace(/^(г\.?|город|пос\.?|поселок|посёлок|пгт|с\.?|село|дер\.?|деревня)\s+/i, "")
    .trim();
}

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[ё]/g, "е")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueSuggestions(items: AddressSuggestion[], limit = 12) {
  const seen = new Set<string>();
  const result: AddressSuggestion[] = [];

  for (const item of items) {
    const key = normalizeKey(
      [item.city, item.street, item.house, item.value].filter(Boolean).join("|")
    );

    if (!item.value || !key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);

    if (result.length >= limit) break;
  }

  return result;
}

function componentValue(components: YandexComponent[] | undefined, kinds: string[]) {
  return (
    components?.find((component) =>
      kinds.includes(String(component.kind || "").toLowerCase())
    )?.name || ""
  );
}

async function getDadataSuggestions(input: {
  token: string;
  query: string;
  city: string;
  mode: SuggestionMode;
}) {
  const combinedQuery =
    input.mode === "address" && input.city
      ? `${input.city}, ${input.query}`
      : input.query;

  const body: Record<string, unknown> = {
    query: combinedQuery,
    count: 15,
  };

  if (input.mode === "city") {
    // Cities, towns, villages and other settlements across Russia.
    body.from_bound = { value: "city" };
    body.to_bound = { value: "settlement" };
  } else {
    body.from_bound = { value: "street" };
    body.to_bound = { value: "house" };

    // Boost the selected city but do not hard-restrict the result. A hard
    // restriction often returns an empty list for towns stored as settlements.
    if (input.city) {
      body.locations_boost = [
        { city: input.city },
        { settlement: input.city },
      ];
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
      signal: AbortSignal.timeout(4000),
    }
  );

  if (!response.ok) return [];

  const payload = (await response.json()) as { suggestions?: DadataSuggestion[] };

  return uniqueSuggestions(
    (payload.suggestions ?? []).map((item): AddressSuggestion => {
      const data = item.data ?? {};
      const city = cleanCity(
        data.city ||
          data.settlement ||
          data.city_with_type ||
          data.settlement_with_type ||
          input.city
      );
      const street = data.street_with_type || data.street || "";
      const houseParts = [
        data.house ? `${data.house_type || "д"}. ${data.house}` : "",
        data.block ? `${data.block_type || "стр"}. ${data.block}` : "",
      ].filter(Boolean);
      const house = data.house || "";
      const shortAddress = [street, ...houseParts].filter(Boolean).join(", ");
      const fullAddress =
        item.unrestricted_value ||
        item.value ||
        [data.region_with_type, city, shortAddress].filter(Boolean).join(", ");

      return {
        value:
          input.mode === "city"
            ? city || item.value || ""
            : shortAddress || item.value || "",
        unrestrictedValue: fullAddress,
        city,
        street,
        house,
        fiasId: data.fias_id || "",
      };
    })
  );
}

async function getYandexSuggestions(input: {
  apiKey: string;
  query: string;
  city: string;
  mode: SuggestionMode;
  sessionToken: string;
}) {
  const url = new URL("https://suggest-maps.yandex.ru/v1/suggest");
  const combinedQuery =
    input.mode === "address" && input.city
      ? `${input.city}, ${input.query}`
      : input.query;

  url.searchParams.set("apikey", input.apiKey);
  url.searchParams.set("text", combinedQuery);
  url.searchParams.set("lang", "ru");
  url.searchParams.set("results", "10");
  url.searchParams.set("highlight", "0");
  url.searchParams.set("countries", "ru");
  url.searchParams.set("print_address", "1");
  url.searchParams.set(
    "types",
    input.mode === "city" ? "locality" : "street,house"
  );

  if (input.sessionToken) {
    url.searchParams.set("sessiontoken", input.sessionToken);
  }

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
  });

  if (!response.ok) return [];

  const payload = (await response.json()) as { results?: YandexSuggestion[] };

  return uniqueSuggestions(
    (payload.results ?? []).map((item): AddressSuggestion => {
      const components = item.address?.component;
      const title = text(item.title?.text);
      const subtitle = text(item.subtitle?.text);
      const formattedAddress = text(item.address?.formatted_address);
      const city = cleanCity(
        componentValue(components, ["locality"]) ||
          (input.mode === "city" ? title : input.city)
      );
      const street = componentValue(components, ["street", "route"]);
      const house = componentValue(components, ["house"]);
      const shortAddress = [street, house ? `д. ${house}` : ""]
        .filter(Boolean)
        .join(", ");

      return {
        value:
          input.mode === "city"
            ? city || title
            : shortAddress || title || formattedAddress,
        unrestrictedValue:
          formattedAddress || [subtitle, title].filter(Boolean).join(", "),
        city,
        street,
        house,
        fiasId: item.uri || "",
      };
    })
  );
}

async function getPhotonSuggestions(input: {
  query: string;
  city: string;
  mode: SuggestionMode;
}) {
  const search = [
    input.mode === "address" ? input.city : "",
    input.query,
    "Россия",
  ]
    .filter(Boolean)
    .join(", ");
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", search);
  url.searchParams.set("lang", "ru");
  url.searchParams.set("limit", "15");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "NetizenStore/1.0 address-autocomplete",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
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
          properties.hamlet ||
          properties.locality ||
          (input.mode === "city" ? properties.name || "" : input.city)
      );
      const street =
        properties.street ||
        (input.mode === "address" ? properties.name || "" : "");
      const house = properties.housenumber || "";
      const addressValue = [street, house ? `д. ${house}` : ""]
        .filter(Boolean)
        .join(", ");
      const full = [
        properties.postcode,
        properties.state,
        city,
        addressValue,
      ]
        .filter(Boolean)
        .join(", ");

      return {
        value: input.mode === "city" ? city : addressValue || full,
        unrestrictedValue: full,
        city,
        street,
        house,
        fiasId: properties.osm_id ? `osm-${properties.osm_id}` : "",
      };
    });

  const cityValues = new Set([
    "city",
    "town",
    "village",
    "hamlet",
    "locality",
    "municipality",
  ]);

  const modeFiltered =
    input.mode === "city"
      ? mapped.filter((item, index) => {
          const properties = payload.features?.[index]?.properties;
          const placeType = String(
            properties?.osm_value || properties?.type || ""
          ).toLowerCase();
          return Boolean(item.city) && (!placeType || cityValues.has(placeType));
        })
      : mapped.filter((item) => Boolean(item.street || item.house));

  return uniqueSuggestions(modeFiltered.length ? modeFiltered : mapped);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        query?: string;
        city?: string;
        mode?: SuggestionMode;
        sessionToken?: string;
      }
    | null;
  const query = text(body?.query);
  const city = text(body?.city, 120);
  const sessionToken = text(body?.sessionToken, 100);
  const mode: SuggestionMode = body?.mode === "city" ? "city" : "address";

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [], configured: false });
  }

  const dadataToken = process.env.DADATA_API_KEY?.trim() || "";
  const yandexKey =
    process.env.YANDEX_GEOSUGGEST_API_KEY?.trim() ||
    process.env.YANDEX_MAPS_API_KEY?.trim() ||
    "";

  const providerCalls: Array<Promise<AddressSuggestion[]>> = [];
  const providerNames: string[] = [];

  if (dadataToken) {
    providerNames.push("dadata");
    providerCalls.push(
      getDadataSuggestions({ token: dadataToken, query, city, mode })
    );
  }

  if (yandexKey) {
    providerNames.push("yandex");
    providerCalls.push(
      getYandexSuggestions({
        apiKey: yandexKey,
        query,
        city,
        mode,
        sessionToken,
      })
    );
  }

  // Open fallback. It keeps the form usable when commercial API keys are not
  // configured, but DaData/Yandex remain the authoritative full-address source.
  providerNames.push("photon");
  providerCalls.push(getPhotonSuggestions({ query, city, mode }));

  const settled = await Promise.allSettled(providerCalls);
  const merged = uniqueSuggestions(
    settled.flatMap((result) =>
      result.status === "fulfilled" ? result.value : []
    )
  );

  if (merged.length > 0) {
    return NextResponse.json(
      {
        suggestions: merged,
        configured: Boolean(dadataToken || yandexKey),
        source: providerNames.join("+"),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  // Final local fallback: active store/pickup addresses from site settings.
  const settings = await getSiteEditorSettings();
  const needle = normalizeKey(query);
  const localSuggestions = uniqueSuggestions(
    settings.contacts.addresses
      .filter((address) => address.active)
      .map((address): AddressSuggestion => ({
        value: mode === "city" ? address.city : address.address,
        unrestrictedValue: [address.city, address.address]
          .filter(Boolean)
          .join(", "),
        city: address.city,
        street: address.address,
        house: "",
        fiasId: address.id,
      }))
      .filter((item) =>
        normalizeKey(
          mode === "city" ? item.city : item.unrestrictedValue
        ).includes(needle)
      )
  );

  return NextResponse.json(
    {
      suggestions: localSuggestions,
      configured: Boolean(dadataToken || yandexKey),
      source: "settings",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
