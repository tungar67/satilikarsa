export type Fact = { label: string; value: string };
export type Parcel = {
  village: string;
  ada: string;
  parsel: string;
  nitelik: string;
  area: string;
  share: string;
  image?: string;
  lat?: number;
  lng?: number;
};
export type Shot = { src: string; alt: string };

export type Holding = {
  slug: string;
  index: string;
  name: string;
  region: string;
  kind: string;
  blurb: string;
  story: string;
  note: string;
  hero: string;
  gallery: Shot[];
  videos?: Shot[];
  lat: number;
  lng: number;
  zoom: number;
  facts: Fact[];
  groups?: { name: string; parcels: number; gross: string; share: string }[];
  parcels?: Parcel[];
};

export const holdings: Holding[] = [
  {
    slug: "kurucesme",
    index: "01",
    name: "Kuruçeşme shops",
    region: "İstanbul · Beşiktaş",
    kind: "Two deeds, one waterfront building",
    blurb: "Basement commercial units on a single Bosphorus parcel in Kuruçeşme.",
    story:
      "Two independent-section deeds sit on the same plot: Ada 1708, Parsel 68, Blok A, basement units 1 and 2. The title records kat irtifakı and a dükkan use. The parcel itself is 5,820.5 m², between the waterfront road and the lanes above the strait.",
    note: "Sold as one address. Interior height, vehicle access and current occupancy are shared on request.",
    hero: "/photos/kurucesme/01.jpg",
    gallery: Array.from({ length: 20 }, (_, i) => ({
      src: `/photos/kurucesme/${String(i + 1).padStart(2, "0")}.jpg`,
      alt: "Kuruçeşme shops",
    })),
    lat: 41.0630079,
    lng: 29.039957,
    zoom: 17,
    facts: [
      { label: "Mahalle", value: "Kuruçeşme" },
      { label: "Ada / Parsel", value: "1708 / 68" },
      { label: "Tapu tipi", value: "Kat irtifakı" },
      { label: "Nitelik", value: "Dükkan" },
      { label: "Blok / Kat", value: "A · Bodrum" },
      { label: "Bağımsız bölüm", value: "No. 1 and No. 2" },
      { label: "Parsel area", value: "5,820.5 m²" },
      { label: "Deeds", value: "2" },
    ],
  },
  {
    slug: "kagithane",
    index: "02",
    name: "Kağıthane depot",
    region: "İstanbul · Kağıthane",
    kind: "Two deeds, one premises",
    blurb: "A paired basement commercial unit in Merkez, titled as dükkan and offered as storage.",
    story:
      "Both deeds are kat mülkiyeti on Ada 6065, Parsel 1: 1. bodrum, bağımsız bölüm 1 and 2. The register calls them dükkan. They are offered together as one depot — loading, clear height and power are the facts a buyer should confirm on a visit.",
    note: "The red outline marks the two basement units, offered together as one floor.",
    hero: "/photos/kagithane/01.jpg",
    gallery: [{ src: "/photos/kagithane/01.jpg", alt: "Kağıthane depot" }],
    lat: 41.0796522,
    lng: 29.0017642,
    zoom: 17,
    facts: [
      { label: "Mahalle", value: "Merkez" },
      { label: "Ada / Parsel", value: "6065 / 1" },
      { label: "Tapu tipi", value: "Kat mülkiyeti" },
      { label: "Nitelik on title", value: "Dükkan" },
      { label: "Offered as", value: "Depo" },
      { label: "Kat", value: "1. Bodrum" },
      { label: "Bağımsız bölüm", value: "No. 1 and No. 2" },
      { label: "Deeds", value: "2" },
    ],
  },
  {
    slug: "dikili",
    index: "03",
    name: "Kabakum land",
    region: "İzmir · Dikili",
    kind: "One deed",
    blurb: "A single arsa parcel in Kabakum, on the northern Aegean coast.",
    story:
      "One ana taşınmaz: Ada 145, Parsel 1, nitelik arsa. Zoning (imar), road frontage and services are not on the title extract and should be checked with Dikili Belediyesi before any build assumption.",
    note: "Photographs of the Kabakum land. The pin marks the point shared for this parcel.",
    hero: "/photos/kabakum/01.jpg",
    gallery: Array.from({ length: 37 }, (_, i) => ({
      src: `/photos/kabakum/${String(i + 1).padStart(2, "0")}.jpg`,
      alt: "Kabakum land",
    })),
    videos: [{ src: "/videos/kabakum/01.mp4", alt: "Kabakum land" }],
    lat: 39.1095735,
    lng: 26.8701101,
    zoom: 16,
    facts: [
      { label: "Mahalle / Köy", value: "Kabakum" },
      { label: "Ada / Parsel", value: "145 / 1" },
      { label: "Tapu tipi", value: "Ana taşınmaz" },
      { label: "Nitelik", value: "Arsa" },
      { label: "Deeds", value: "1" },
    ],
  },
  {
    slug: "tekirdag",
    index: "04",
    name: "Pınarça field",
    region: "Tekirdağ · Kapaklı",
    kind: "One deed · 3.67 hectares",
    blurb: "A single tarla of 36,700 m² beside a rural road in Pınarça.",
    story:
      "Title extract: Ada 299, Parsel 95, nitelik tarla, yüzölçümü 36,700.45 m². Cilt 43, sayfa 4158. One clean agricultural title near the İstanbul–Tekirdağ belt. Irrigation, slope and any forest or protected overlay still need a site check.",
    note: "About 9.07 acres. The pin marks the point shared for this field.",
    hero: "/photos/pinarca/01.jpg",
    gallery: [
      { src: "/photos/pinarca/01.jpg", alt: "Pınarça field" },
      { src: "/photos/pinarca/02.jpg", alt: "Pınarça field" },
      { src: "/photos/pinarca/03.jpg", alt: "Pınarça field" },
      { src: "/photos/pinarca/04.jpg", alt: "Pınarça field" },
      { src: "/photos/pinarca/05.jpg", alt: "Pınarça field" },
      { src: "/photos/pinarca/06.jpg", alt: "Pınarça field" },
      { src: "/photos/pinarca/07.jpg", alt: "Pınarça field" },
      { src: "/photos/pinarca/08.jpg", alt: "Pınarça field" },
      { src: "/photos/pinarca/09.jpg", alt: "Pınarça field" },
      { src: "/photos/pinarca/10.jpg", alt: "Pınarça field" },
      { src: "/photos/pinarca/11.jpg", alt: "Pınarça field" },
      { src: "/photos/pinarca/12.jpg", alt: "Pınarça field" },
    ],
    videos: [{ src: "/videos/pinarca/01.mp4", alt: "Pınarça field" }],
    lat: 41.34650491690603,
    lng: 28.04563969524759,
    zoom: 16,
    facts: [
      { label: "Mahalle", value: "Pınarça" },
      { label: "Ada / Parsel", value: "299 / 95" },
      { label: "Nitelik", value: "Tarla" },
      { label: "Area", value: "36,700.45 m²" },
      { label: "Hectares", value: "3.67 ha" },
      { label: "Cilt / Sayfa", value: "43 / 4158" },
      { label: "Deeds", value: "1" },
    ],
  },
  {
    slug: "ordu",
    index: "05",
    name: "Altınordu orchards",
    region: "Ordu · Altınordu",
    kind: "28 deeds · three villages",
    blurb: "Hazelnut gardens and fields in Çavuşlar, Yemişli and Teyneli, offered as one set.",
    story:
      "Twenty-eight ana taşınmaz deeds. Gross parcel area on the working sheet is about 169,789 m². The owned share of that land is about 5,614 m² — roughly 1.39 acres. A buyer is purchasing shares in many parcels, not a fenced estate of 17 hectares. The weight of the holding is in Çavuşlar hazelnut gardens.",
    note: "Pins mark each parcel inside its village. The card image is the cadastral outline from the title extract, not a surveyed corner on this map.",
    hero: "/photos/ordu.jpg",
    gallery: [
      { src: "/photos/ordu.jpg", alt: "Hazelnut hills above the Black Sea" },
      { src: "/photos/hazelnut.jpg", alt: "Hazelnuts on the branch" },
    ],
    lat: 40.968,
    lng: 37.92,
    zoom: 12,
    facts: [
      { label: "Villages", value: "Çavuşlar · Yemişli · Teyneli" },
      { label: "Deeds", value: "28" },
      { label: "Gross parcels", value: "169,789 m²" },
      { label: "Owned share", value: "5,614 m²" },
      { label: "Uses", value: "Fındık bahçesi · tarla" },
    ],
    groups: [
      { name: "Teyneli · fındık", parcels: 2, gross: "14,121 m²", share: "318 m²" },
      { name: "Çavuşlar · tarla", parcels: 7, gross: "21,374 m²", share: "1,215 m²" },
      { name: "Yemişli · tarla & fındık", parcels: 6, gross: "42,685 m²", share: "104 m²" },
      { name: "Çavuşlar · fındık", parcels: 13, gross: "91,609 m²", share: "3,978 m²" },
    ],
    parcels: [
      { village: "Teyneli", ada: "104", parsel: "25", nitelik: "Fındık bahçesi", area: "3,305", share: "83" },
      { village: "Teyneli", ada: "146", parsel: "4", nitelik: "Fındık bahçesi", area: "10,817", share: "235" },
      { village: "Çavuşlar", ada: "139", parsel: "16", nitelik: "Tarla", area: "9,104", share: "864" },
      { village: "Çavuşlar", ada: "139", parsel: "11", nitelik: "Tarla", area: "3,627", share: "157" },
      { village: "Çavuşlar", ada: "139", parsel: "8", nitelik: "Tarla", area: "2,309", share: "100" },
      { village: "Çavuşlar", ada: "136", parsel: "1", nitelik: "Tarla", area: "3,676", share: "53" },
      { village: "Çavuşlar", ada: "139", parsel: "15", nitelik: "Tarla", area: "949", share: "15" },
      { village: "Çavuşlar", ada: "142", parsel: "1", nitelik: "Tarla", area: "1,026", share: "15" },
      { village: "Çavuşlar", ada: "134", parsel: "1", nitelik: "Tarla", area: "683", share: "10" },
      { village: "Yemişli", ada: "144", parsel: "12", nitelik: "Tarla ve fındık", area: "28,671", share: "60" },
      { village: "Yemişli", ada: "144", parsel: "2", nitelik: "Tarla ve fındık", area: "9,771", share: "31" },
      { village: "Yemişli", ada: "145", parsel: "4", nitelik: "Fındık bahçesi", area: "1,932", share: "6" },
      { village: "Yemişli", ada: "145", parsel: "3", nitelik: "Fındık bahçesi", area: "1,588", share: "5" },
      { village: "Yemişli", ada: "144", parsel: "6", nitelik: "Fındık bahçesi", area: "459", share: "1" },
      { village: "Yemişli", ada: "144", parsel: "7", nitelik: "Fındık bahçesi", area: "263", share: "1" },
      { village: "Çavuşlar", ada: "102", parsel: "29", nitelik: "Fındık bahçesi", area: "6,777", share: "1,273" },
      { village: "Çavuşlar", ada: "102", parsel: "27", nitelik: "Fındık bahçesi", area: "31,779", share: "1,018" },
      { village: "Çavuşlar", ada: "143", parsel: "2", nitelik: "Fındık bahçesi", area: "2,734", share: "370" },
      { village: "Çavuşlar", ada: "101", parsel: "2", nitelik: "Fındık bahçesi", area: "14,672", share: "339" },
      { village: "Çavuşlar", ada: "102", parsel: "6", nitelik: "Fındık bahçesi", area: "22,502", share: "261" },
      { village: "Çavuşlar", ada: "143", parsel: "1", nitelik: "Fındık bahçesi", area: "1,762", share: "238" },
      { village: "Çavuşlar", ada: "143", parsel: "3", nitelik: "Fındık bahçesi", area: "1,132", share: "175" },
      { village: "Çavuşlar", ada: "102", parsel: "18", nitelik: "Fındık bahçesi", area: "3,607", share: "202" },
      { village: "Çavuşlar", ada: "102", parsel: "28", nitelik: "Fındık bahçesi", area: "1,524", share: "60" },
      { village: "Çavuşlar", ada: "102", parsel: "4", nitelik: "Fındık bahçesi", area: "2,145", share: "15" },
      { village: "Çavuşlar", ada: "102", parsel: "2", nitelik: "Fındık bahçesi", area: "1,352", share: "10" },
      { village: "Çavuşlar", ada: "102", parsel: "3", nitelik: "Fındık bahçesi", area: "1,446", share: "10" },
      { village: "Çavuşlar", ada: "143", parsel: "20", nitelik: "Fındık bahçesi", area: "177", share: "7" },
    ],
  },
];

export function getHolding(slug: string) {
  return holdings.find((h) => h.slug === slug);
}

const villageCenter: Record<string, [number, number]> = {
  Çavuşlar: [40.94555, 37.83763],
  Yemişli: [40.93323, 37.86694],
  Teyneli: [40.93336, 37.8128],
};

const ordu = holdings.find((h) => h.slug === "ordu");
if (ordu?.parcels) {
  const seen: Record<string, number> = {};
  for (const parcel of ordu.parcels) {
    const n = seen[parcel.village] ?? 0;
    seen[parcel.village] = n + 1;
    const center = villageCenter[parcel.village] ?? [40.94, 37.84];
    const angle = n * 0.9;
    const radius = 0.0032;
    parcel.lat = center[0] + Math.cos(angle) * radius;
    parcel.lng = center[1] + Math.sin(angle) * radius;
    const folder = parcel.village === "Çavuşlar" ? "cavuslar" : parcel.village === "Yemişli" ? "yemisli" : "teyneli";
    parcel.image = `/photos/ordu/${folder}-${parcel.ada}-${parcel.parsel}.jpg`;
  }
}
