import { createServerFn } from "@tanstack/react-start";
import type { ContactInput, ContactResult } from "./contact-fields.ts";

export type { ContactFailure, ContactResult } from "./contact-fields.ts";

export const submitContact = createServerFn({ method: "POST" })
  .validator((input: ContactInput): ContactInput => input)
  .handler(async ({ data }): Promise<ContactResult> => {
    const { deliverContact } = await import("./contact.server");
    return deliverContact(data);
  });
