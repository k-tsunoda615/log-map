export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const address = query.address as string;

  if (!address) {
    throw createError({
      statusCode: 400,
      statusMessage: "Address parameter is required",
    });
  }

  const apiKey =
    process.env.GOOGLE_GEOCODING_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Google Geocoding API key is not configured",
    });
  }

  try {
    const response = await $fetch(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address: address,
          key: apiKey,
        },
      }
    );

    return response;
  } catch (error: any) {
    console.error("Geocoding API error:", error);

    throw createError({
      statusCode: 500,
      statusMessage: `Geocoding failed: ${error.message || "Unknown error"}`,
    });
  }
});
