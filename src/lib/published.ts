import { createServerFn } from "@tanstack/react-start";
import type { SiteContent } from "@/lib/site-content";

export const loadPublished = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { readPublished } = await import("./published.server");
    return await readPublished();
  } catch {
    return null;
  }
});

export const publishContent = createServerFn({ method: "POST" })
  .validator((input: { password: string; content: SiteContent }) => input)
  .handler(async ({ data }) => {
    const { writePublished } = await import("./published.server");
    return writePublished(data.password, data.content);
  });
