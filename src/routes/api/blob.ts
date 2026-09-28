import { createFileRoute } from "@tanstack/react-router";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { MAINTENANCE_PASSWORD } from "@/lib/gate";

export const Route = createFileRoute("/api/blob")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as HandleUploadBody;
          const json = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (_pathname, clientPayload) => {
              const payload = JSON.parse(clientPayload || "{}") as { password?: string };
              if (payload.password !== MAINTENANCE_PASSWORD) throw new Error("That password is not correct.");
              return {
                allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/quicktime"],
                addRandomSuffix: false,
                maximumSizeInBytes: 80 * 1024 * 1024,
              };
            },
            onUploadCompleted: async () => {},
          });
          return Response.json(json);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Upload failed";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
