import { createContext, useContext, useEffect, useRef, useState } from "react";
import { holdings, type Holding as RawHolding } from "@/data/properties";
import { MAINTENANCE_PASSWORD } from "@/lib/gate";
import { text, type Text } from "@/lib/lang";
import { clearClips } from "@/lib/media-store";
import { publishContent } from "@/lib/published";
import { publishable } from "@/lib/upload-media";

export type Welcome = {
  siteName: Text;
  tagline: Text;
  kicker: Text;
  title: Text;
  lede: Text;
  portfolioTitle: Text;
  portfolioLede: Text;
  footer: Text;
};

export type ContactCopy = {
  title: Text;
  lede: Text;
  email: string;
};

export type PublicFact = { label: Text; value: Text };
export type PublicShot = { src: string; alt: Text };
export type PublicGroup = { name: Text; parcels: number; gross: string; share: string };
export type PublicParcel = {
  village: string;
  ada: string;
  parsel: string;
  nitelik: Text;
  area: string;
  share: string;
  image?: string;
  lat?: number;
  lng?: number;
};

export type PublicHolding = Omit<RawHolding, "name" | "region" | "kind" | "blurb" | "story" | "note" | "facts" | "gallery" | "videos" | "groups" | "parcels"> & {
  name: Text;
  region: Text;
  kind: Text;
  blurb: Text;
  story: Text;
  note: Text;
  facts: PublicFact[];
  gallery: PublicShot[];
  videos: PublicShot[];
  groups?: PublicGroup[];
  parcels?: PublicParcel[];
};

export type SiteContent = {
  welcome: Welcome;
  contact: ContactCopy;
  holdings: PublicHolding[];
  migrated?: { pinarcaVideo?: boolean; kabakumVideo?: boolean };
};

const tr: Record<string, string> = {
  "Gencel Holdings": "Gencel Holdings",
  "Private land · Türkiye": "Özel mülk · Türkiye",
  "Five holdings · 34 deeds": "Beş varlık · 34 tapu",
  "Land and premises from the Bosphorus to the Black Sea": "Boğaz’dan Karadeniz’e arsa ve taşınmazlar",
  "Commercial units in İstanbul, and agricultural land in Dikili, Tekirdağ and Ordu — grouped the way a buyer should see them.":
    "İstanbul’da ticari bölümler; Dikili, Tekirdağ ve Ordu’da tarım arazileri — alıcının görmesi gereken şekilde gruplandı.",
  "The portfolio": "Portföy",
  "Each page is one package. Figures come from title extracts. Ordu is a set of shares, not a single fenced estate.":
    "Her sayfa bir pakettir. Rakamlar tapu dökümündendir. Ordu, çevrili tek bir arazi değil, hisseler bütünüdür.",
  "Title figures from TAKBİS extracts. Photographs are atmosphere, not the deeded view. Map pins are indicative.":
    "Rakamlar TAKBİS dökümündendir. Fotoğraflar atmosfer içindir, tapudaki görüntü değildir. Harita işaretleri yaklaşıktır.",
  Contact: "İletişim",
  "Tell us which holding you want to discuss. The form opens your email program addressed to the office.":
    "Hangi varlığı konuşmak istediğinizi yazın. Form, ofise adresli e-postanızı açar.",
  "Kuruçeşme shops": "Kuruçeşme dükkanları",
  "İstanbul · Beşiktaş": "İstanbul · Beşiktaş",
  "Two deeds, one waterfront building": "İki tapu, tek sahil yapısı",
  "Basement commercial units on a single Bosphorus parcel in Kuruçeşme.":
    "Kuruçeşme’de Boğaz’a bakan tek parselde bodrum ticari bölümler.",
  "Two independent-section deeds sit on the same plot: Ada 1708, Parsel 68, Blok A, basement units 1 and 2. The title records kat irtifakı and a dükkan use. The parcel itself is 5,820.5 m², between the waterfront road and the lanes above the strait.":
    "Aynı parselde iki bağımsız bölüm: Ada 1708, Parsel 68, Blok A, bodrum 1 ve 2. Tapuda kat irtifakı ve dükkan niteliği yazılıdır. Parsel 5.820,5 m²’dir; sahil yolu ile yamaç sokakları arasındadır.",
  "Sold as one address. Interior height, vehicle access and current occupancy are shared on request.":
    "Tek adres olarak sunulur. İç yükseklik, araç girişi ve kullanım durumu istenirse paylaşılır.",
  "Bosphorus waterfront houses and moored boats": "Boğaz kıyısında yalılar ve bağlı tekneler",
  "Tree-lined lane near the strait": "Boğaz’a inen ağaçlı sokak",
  Mahalle: "Mahalle",
  "Ada / Parsel": "Ada / Parsel",
  "Tapu tipi": "Tapu tipi",
  "Kat irtifakı": "Kat irtifakı",
  Nitelik: "Nitelik",
  Dükkan: "Dükkan",
  "Blok / Kat": "Blok / Kat",
  "A · Bodrum": "A · Bodrum",
  "Bağımsız bölüm": "Bağımsız bölüm",
  "No. 1 and No. 2": "No. 1 ve No. 2",
  "Parsel area": "Parsel alanı",
  "5,820.5 m²": "5.820,5 m²",
  Deeds: "Tapu adedi",
  "Kağıthane depot": "Kağıthane depo",
  "İstanbul · Kağıthane": "İstanbul · Kağıthane",
  "Two deeds, one premises": "İki tapu, tek taşınmaz",
  "A paired basement commercial unit in Merkez, titled as dükkan and offered as storage.":
    "Merkez’de bodrumda iki ticari bölüm. Tapuda dükkan, sunumda depo.",
  "Both deeds are kat mülkiyeti on Ada 6065, Parsel 1: 1. bodrum, bağımsız bölüm 1 and 2. The register calls them dükkan. They are offered together as one depot — loading, clear height and power are the facts a buyer should confirm on a visit.":
    "Her iki tapu Ada 6065, Parsel 1 üzerinde kat mülkiyetidir: 1. bodrum, bağımsız bölüm 1 ve 2. Kayıt niteliği dükkandır. Birlikte tek depo olarak sunulur. Yükleme, net yükseklik ve elektrik ziyarette doğrulanmalıdır.",
  "The red outline marks the two basement units, offered together as one floor.":
    "Kırmızı çerçeve iki bodrum bölümünü gösterir; birlikte tek kat olarak sunulur.",
  "High-ceiling commercial interior": "Yüksek tavanlı ticari iç mekan",
  "Street character of inner Istanbul": "İstanbul içinin sokak dokusu",
  Merkez: "Merkez",
  "Kat mülkiyeti": "Kat mülkiyeti",
  "Nitelik on title": "Tapudaki nitelik",
  "Offered as": "Sunulan kullanım",
  Depo: "Depo",
  Kat: "Kat",
  "1. Bodrum": "1. Bodrum",
  "Kabakum land": "Kabakum arsası",
  "İzmir · Dikili": "İzmir · Dikili",
  "One deed": "Tek tapu",
  "A single arsa parcel in Kabakum, on the northern Aegean coast.":
    "Kuzey Ege’de, Kabakum’da tek arsa parseli.",
  "One ana taşınmaz: Ada 145, Parsel 1, nitelik arsa. Zoning (imar), road frontage and services are not on the title extract and should be checked with Dikili Belediyesi before any build assumption.":
    "Tek ana taşınmaz: Ada 145, Parsel 1, nitelik arsa. İmar, yol cephesi ve altyapı tapu dökümünde yoktur; yapı varsayımı için Dikili Belediyesi’ne bakılmalıdır.",
  "Photographs of the Kabakum land. The pin marks the point shared for this parcel.":
    "Kabakum arsasının fotoğrafları. İşaret, bu parsel için paylaşılan noktadır.",
  "Aegean hillside with a view to the sea": "Denize bakan Ege yamacı",
  "Rural track through dry grass": "Kuru otların arasındaki kırsal yol",
  "Mahalle / Köy": "Mahalle / Köy",
  Kabakum: "Kabakum",
  "Ana taşınmaz": "Ana taşınmaz",
  Arsa: "Arsa",
  "Pınarça field": "Pınarça tarlası",
  "Tekirdağ · Kapaklı": "Tekirdağ · Kapaklı",
  "One deed · 3.67 hectares": "Tek tapu · 3,67 hektar",
  "A single tarla of 36,700 m² beside a rural road in Pınarça.":
    "Pınarça’da kırsal yol kenarında 36.700 m² tek tarla.",
  "Title extract: Ada 299, Parsel 95, nitelik tarla, yüzölçümü 36,700.45 m². Cilt 43, sayfa 4158. One clean agricultural title near the İstanbul–Tekirdağ belt. Irrigation, slope and any forest or protected overlay still need a site check.":
    "Tapu dökümü: Ada 299, Parsel 95, nitelik tarla, yüzölçümü 36.700,45 m². Cilt 43, sayfa 4158. İstanbul–Tekirdağ kuşağında tek tarım tapusu. Sulama, eğim ve orman veya koruma sınırı yerinde kontrol edilmelidir.",
  "About 9.07 acres. The pin marks the point shared for this field.":
    "Yaklaşık 9,07 dönüm ölçeğinde ABD acredir. İşaret, bu tarla için paylaşılan noktadır.",
  "Aerial view of a large field bordered by trees": "Ağaçlarla çevrili geniş tarlanın havadan görünüşü",
  "Farm track between crops and pines": "Ekin ile çam arasındaki tarla yolu",
  Pınarça: "Pınarça",
  Tarla: "Tarla",
  Field: "Tarla",
  Area: "Alan",
  "36,700.45 m²": "36.700,45 m²",
  Hectares: "Hektar",
  "3.67 ha": "3,67 ha",
  "Cilt / Sayfa": "Cilt / Sayfa",
  "Altınordu orchards": "Altınordu fındıkları",
  "Ordu · Altınordu": "Ordu · Altınordu",
  "28 deeds · three villages": "28 tapu · üç köy",
  "Hazelnut gardens and fields in Çavuşlar, Yemişli and Teyneli, offered as one set.":
    "Çavuşlar, Yemişli ve Teyneli’nde fındık bahçeleri ve tarlalar, tek set olarak.",
  "Twenty-eight ana taşınmaz deeds. Gross parcel area on the working sheet is about 169,789 m². The owned share of that land is about 5,614 m² — roughly 1.39 acres. A buyer is purchasing shares in many parcels, not a fenced estate of 17 hectares. The weight of the holding is in Çavuşlar hazelnut gardens.":
    "Yirmi sekiz ana taşınmaz. Çalışma cetvelinde brüt parsel alanı yaklaşık 169.789 m²’dir. Bu arazideki hisse yaklaşık 5.614 m²’dir. Alıcı, 17 hektarlık çevrili bir arazi değil, çok sayıda parselde hisse alır. Ağırlık Çavuşlar fındık bahçelerindedir.",
  "Pins mark each parcel inside its village. The card image is the cadastral outline from the title extract, not a surveyed corner on this map.":
    "Her işaret, parseli köyü içinde gösterir. Kart görseli tapu dökümündeki kadastro sınırıdır; bu haritadaki işaret ölçülmüş köşe değildir.",
  "Hazelnut hills above the Black Sea": "Karadeniz üstündeki fındık tepeleri",
  "Hazelnuts on the branch": "Dalında fındık",
  Villages: "Köyler",
  "Çavuşlar · Yemişli · Teyneli": "Çavuşlar · Yemişli · Teyneli",
  "Gross parcels": "Brüt parseller",
  "169,789 m²": "169.789 m²",
  "Owned share": "Hisse alanı",
  "5,614 m²": "5.614 m²",
  Uses: "Nitelikler",
  "Fındık bahçesi · tarla": "Fındık bahçesi · tarla",
  "Teyneli · fındık": "Teyneli · fındık",
  "Çavuşlar · tarla": "Çavuşlar · tarla",
  "Yemişli · tarla & fındık": "Yemişli · tarla ve fındık",
  "Çavuşlar · fındık": "Çavuşlar · fındık",
  "Fındık bahçesi": "Fındık bahçesi",
  "Hazelnut garden": "Fındık bahçesi",
  "Tarla ve fındık": "Tarla ve fındık",
  "Field and hazelnut": "Tarla ve fındık",
  "Write to the office": "Ofise yazın",
  Name: "Ad",
  "Your email": "E-postanız",
  Phone: "Telefon",
  Holding: "Varlık",
  General: "Genel",
  Message: "Mesaj",
  "Send email": "E-posta gönder",
  "No office email is set yet. Add one on the Maintenance tab.":
    "Ofis e-postası henüz yok. Bakım sekmesinde ekleyin.",
  "Your email program should open with this message.": "E-posta programınız bu iletiyle açılmalı.",
  "Maintenance password": "Bakım parolası",
  Unlock: "Aç",
  "That password is not correct.": "Parola doğru değil.",
  "Unlocked for this browser tab.": "Bu tarayıcı sekmesinde açık.",
  "Save changes": "Değişiklikleri kaydet",
  "Restore original text": "Özgün metne dön",
  "Saved. Every visitor sees this copy.": "Kaydedildi. Her ziyaretçi bu kopyayı görür.",
  "Could not save for all visitors. Try again.": "Tüm ziyaretçiler için kaydedilemedi. Yeniden deneyin.",
  Maintenance: "Bakım",
  "This holding is not in the portfolio.": "Bu varlık portföyde yok.",
  "Back to Welcome": "Karşılama sayfasına dön",
};

function pair(en: string): Text {
  return text(en, tr[en] ?? en);
}

function lift(raw: RawHolding): PublicHolding {
  return {
    ...raw,
    name: pair(raw.name),
    region: pair(raw.region),
    kind: pair(raw.kind),
    blurb: pair(raw.blurb),
    story: pair(raw.story),
    note: pair(raw.note),
    facts: raw.facts.map((f) => ({ label: pair(f.label), value: pair(f.value) })),
    gallery: raw.gallery.map((s) => ({ src: s.src, alt: pair(s.alt) })),
    videos: (raw.videos ?? []).map((s) => ({ src: s.src, alt: pair(s.alt) })),
    groups: raw.groups?.map((g) => ({ ...g, name: pair(g.name) })),
    parcels: raw.parcels?.map((p) => ({ ...p, nitelik: pair(p.nitelik) })),
  };
}

const STORAGE_KEY = "gencel-site-v2";

export const defaultContent: SiteContent = {
  welcome: {
    siteName: pair("Gencel Holdings"),
    tagline: pair("Private land · Türkiye"),
    kicker: pair("Five holdings · 34 deeds"),
    title: pair("Land and premises from the Bosphorus to the Black Sea"),
    lede: pair(
      "Commercial units in İstanbul, and agricultural land in Dikili, Tekirdağ and Ordu — grouped the way a buyer should see them.",
    ),
    portfolioTitle: pair("The portfolio"),
    portfolioLede: pair(
      "Each page is one package. Figures come from title extracts. Ordu is a set of shares, not a single fenced estate.",
    ),
    footer: pair(
      "Title figures from TAKBİS extracts. Photographs are atmosphere, not the deeded view. Map pins are indicative.",
    ),
  },
  contact: {
    title: pair("Contact"),
    lede: pair("Tell us which holding you want to discuss. The form opens your email program addressed to the office."),
    email: "",
  },
  holdings: holdings.map(lift),
};

type Store = {
  content: SiteContent;
  ready: boolean;
  save: (next: SiteContent) => Promise<void>;
  reset: () => Promise<void>;
};

const Ctx = createContext<Store | null>(null);

function isText(value: unknown): value is Text {
  return !!value && typeof value === "object" && "en" in value && "tr" in value;
}

export function freshen(content: SiteContent): SiteContent {
  const migrated = { ...content.migrated };
  return {
    ...content,
    migrated,
    holdings: content.holdings.map((holding) => {
      const fresh = defaultContent.holdings.find((item) => item.slug === holding.slug);
      let next = Array.isArray(holding.videos) ? holding : { ...holding, videos: [] };
      if (!next.gallery.some((shot) => shot.src === next.hero)) {
        next = { ...next, hero: next.gallery[0]?.src ?? "" };
      }
      if (next.slug === "kagithane" && Math.abs(next.lat - 41.0794) < 0.0002 && Math.abs(next.lng - 28.9732) < 0.0002) {
        next = { ...next, lat: 41.0796522, lng: 29.0017642, zoom: 17 };
      }
      if (next.slug === "kurucesme" && Math.abs(next.lat - 41.0526) < 0.0002 && Math.abs(next.lng - 29.0348) < 0.0002) {
        next = { ...next, lat: 41.0630079, lng: 29.039957, zoom: 17 };
      }
      if (next.slug === "tekirdag" && Math.abs(next.lat - 41.347) < 0.001 && Math.abs(next.lng - 27.925) < 0.002) {
        next = {
          ...next,
          lat: 41.34650491690603,
          lng: 28.04563969524759,
          zoom: 16,
          note:
            next.note.en === "About 9.07 acres. The map pin is indicative until the cadastral outline is imported."
              ? {
                  en: "About 9.07 acres. The pin marks the point shared for this field.",
                  tr: "Yaklaşık 9,07 dönüm ölçeğinde ABD acredir. İşaret, bu tarla için paylaşılan noktadır.",
                }
              : next.note,
        };
      }
      if (next.slug === "dikili" && Math.abs(next.lat - 39.0735) < 0.001 && Math.abs(next.lng - 26.888) < 0.001) {
        next = {
          ...next,
          lat: 39.1095735,
          lng: 26.8701101,
          zoom: 16,
          note: {
            en: "Photographs of the Kabakum land. The pin marks the point shared for this parcel.",
            tr: "Kabakum arsasının fotoğrafları. İşaret, bu parsel için paylaşılan noktadır.",
          },
        };
      }
      if (next.slug === "tekirdag" && !migrated.pinarcaVideo) {
        const clip = fresh?.videos.find((item) => item.src === "/videos/pinarca/01.mp4");
        if (clip && !next.videos.some((item) => item.src === clip.src)) next = { ...next, videos: [...next.videos, clip] };
        migrated.pinarcaVideo = true;
      }
      if (next.slug === "dikili" && !migrated.kabakumVideo) {
        const clip = fresh?.videos.find((item) => item.src === "/videos/kabakum/01.mp4");
        if (clip && !next.videos.some((item) => item.src === clip.src)) next = { ...next, videos: [...next.videos, clip] };
        migrated.kabakumVideo = true;
      }
      return next;
    }),
  };
}

function load(): SiteContent {
  if (typeof window === "undefined") return defaultContent;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultContent;
    const parsed = JSON.parse(raw) as SiteContent;
    if (!isText(parsed?.welcome?.title) || !Array.isArray(parsed.holdings)) return defaultContent;
    return freshen(parsed);
  } catch {
    return defaultContent;
  }
}

export function ContentProvider({ children, initial }: { children: React.ReactNode; initial: SiteContent | null }) {
  const [content, setContent] = useState<SiteContent>(initial ?? defaultContent);
  const [ready, setReady] = useState(initial != null);
  const started = useRef(false);

  const save = async (next: SiteContent) => {
    const stored = await publishContent({ data: { password: MAINTENANCE_PASSWORD, content: await publishable(next) } });
    setContent(stored);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      /* The server copy is what visitors see. */
    }
  };

  const reset = async () => {
    localStorage.removeItem(STORAGE_KEY);
    await clearClips();
    await save(structuredClone(defaultContent));
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (initial) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      } catch {
        /* ignore quota */
      }
      setReady(true);
      return;
    }
    const local = load();
    const hasLocal = localStorage.getItem(STORAGE_KEY);
    if (!hasLocal) {
      setReady(true);
      return;
    }
    setContent(local);
    setReady(true);
    void save(local).catch(() => {});
  }, [initial]);

  return <Ctx.Provider value={{ content, ready, save, reset }}>{children}</Ctx.Provider>;
}

export function useSite() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSite outside provider");
  return ctx;
}

export const ui = {
  writeOffice: pair("Write to the office"),
  name: pair("Name"),
  email: pair("Your email"),
  phone: pair("Phone"),
  holding: pair("Holding"),
  general: pair("General"),
  message: pair("Message"),
  send: pair("Send email"),
  noEmail: pair("No office email is set yet. Add one on the Maintenance tab."),
  opened: pair("Your email program should open with this message."),
  password: pair("Maintenance password"),
  unlock: pair("Unlock"),
  badPassword: pair("That password is not correct."),
  unlocked: pair("Unlocked for this browser tab."),
  save: pair("Save changes"),
  restore: pair("Restore original text"),
  saved: pair("Saved. Every visitor sees this copy."),
  saveFailed: pair("Could not save for all visitors. Try again."),
  welcome: pair("Welcome"),
  contact: pair("Contact"),
  maintenance: pair("Maintenance"),
  missing: pair("This holding is not in the portfolio."),
  back: pair("Back to Welcome"),
};
