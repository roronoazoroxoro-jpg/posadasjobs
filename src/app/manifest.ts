import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PosadasJobs",
    short_name: "PosadasJobs",
    description: "Trabajo y talento en Posadas, Misiones",
    start_url: "/",
    display: "standalone",
    background_color: "#ecfdf5",
    theme_color: "#059669",
    icons: [{ src: "/toucan-mate.jpg", sizes: "512x512", type: "image/jpeg" }],
  };
}
