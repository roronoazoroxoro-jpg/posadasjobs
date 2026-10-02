export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { prepareProductionDatabase } = await import("./lib/prepare-db");
    prepareProductionDatabase();
  }
}
