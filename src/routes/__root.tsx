import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { ContentProvider } from "@/lib/site-content";
import { LanguageProvider } from "@/lib/lang";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";
import { SITE_DOMAIN } from "@/lib/site";

const APP_NAME = "Gencel Holdings";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${APP_NAME} · ${SITE_DOMAIN}` },
      { name: "description", content: "Five Turkish real-estate holdings: Bosphorus shops, a Kağıthane depot, and land in Dikili, Tekirdağ and Ordu." },
      { name: "theme-color", content: "#2a3323" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,560&family=Outfit:wght@400;500;600&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <ContentProvider>
            <LanguageProvider>
              <Outlet />
            </LanguageProvider>
          </ContentProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
