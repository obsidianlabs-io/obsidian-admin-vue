export async function handleDynamicAuthRouteInitFailure(resetStore: () => Promise<void>) {
  await resetStore();
}
