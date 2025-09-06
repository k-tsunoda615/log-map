import { $fetch } from "ofetch";

export const useGeocoding = () => {
  const geocodeAddress = async (address: string) => {
    try {
      const response = (await $fetch("/api/geocode", {
        params: { address },
      })) as any;

      if (
        response.status === "OK" &&
        response.results &&
        response.results.length > 0
      ) {
        const result = response.results[0];
        return {
          success: true,
          data: {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
            formattedAddress: result.formatted_address,
            locationType: result.geometry.location_type,
          },
        };
      } else {
        return {
          success: false,
          error: `ジオコーディングに失敗しました: ${response.status}`,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error:
          error.data?.statusMessage ||
          error.message ||
          "ジオコーディングに失敗しました",
      };
    }
  };

  const geocodeMultipleAddresses = async (addresses: string[]) => {
    const results = await Promise.allSettled(
      addresses.map((address) => geocodeAddress(address))
    );

    return results.map((result, index) => ({
      address: addresses[index],
      ...(result.status === "fulfilled"
        ? result.value
        : { success: false, error: "Failed to geocode" }),
    }));
  };

  return {
    geocodeAddress,
    geocodeMultipleAddresses,
  };
};
