import { defineConfig } from "astro/config";
const site = process.env.SITE_URL;
if (
  site &&
  (new URL(site).protocol !== "https:" ||
    new URL(site).pathname !== "/" ||
    new URL(site).username ||
    new URL(site).password ||
    new URL(site).search ||
    new URL(site).hash)
)
  throw new Error("SITE_URL must be an HTTPS origin without a path.");
export default defineConfig({
  site,
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
});
