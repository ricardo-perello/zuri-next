import { createTransportClient, PRODUCTION_API_BASE } from "@zuri-next/core";

/** Dev uses Vite proxy; prod calls the public API directly (CORS *). */
const baseUrl = import.meta.env.DEV ? "/transport/v1" : PRODUCTION_API_BASE;

export const transport = createTransportClient({ baseUrl });
