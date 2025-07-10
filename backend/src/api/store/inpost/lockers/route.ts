import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { INPOST_API_KEY } from "../../../../lib/constants";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const {
      latitude,
      longitude,
      city,
      postcode,
      country_code = "PL",
      radius = 5000,
      limit = 20,
    } = req.query;

    if (!INPOST_API_KEY) {
      res.status(400).json({
        error: "InPost API not configured",
      });
      return;
    }

    // Build query parameters
    const queryParams = new URLSearchParams();

    if (latitude && longitude) {
      queryParams.append("latitude", latitude as string);
      queryParams.append("longitude", longitude as string);
    }

    if (city) queryParams.append("city", city as string);
    if (postcode) queryParams.append("postcode", postcode as string);
    if (country_code)
      queryParams.append("country_code", country_code as string);
    if (radius) queryParams.append("radius", radius.toString());
    if (limit) queryParams.append("limit", limit.toString());

    // Add function filter for parcel lockers
    queryParams.append("functions", "parcel_locker");
    queryParams.append("type", "parcel_locker");

    // Call InPost API
    const apiUrl = "https://api-shipx-pl.easypack24.net";
    const response = await fetch(`${apiUrl}/v1/points?${queryParams}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${INPOST_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      res.status(response.status).json({
        error: `InPost API error: ${response.status} ${response.statusText}`,
      });
      return;
    }

    const data = await response.json();

    // Transform the data to a more frontend-friendly format
    const lockers = (data.items || []).map((locker: any) => ({
      id: locker.name,
      name: locker.name,
      description: locker.location_description,
      address: {
        line1: locker.address?.line1 || "",
        line2: locker.address?.line2 || "",
        city: locker.address?.city || "",
        postcode: locker.address?.post_code || "",
        country: locker.address?.country_code || "",
      },
      location: {
        latitude: locker.location?.latitude || 0,
        longitude: locker.location?.longitude || 0,
      },
      opening_hours: locker.opening_hours || "24/7",
      payment_available: locker.payment_available || false,
      is_next: locker.is_next || false,
      recommended: locker.recommended || false,
      image_url: locker.image_url || "",
      status: locker.status || "Operating",
    }));

    res.json({
      lockers,
      total: lockers.length,
    });
  } catch (error) {
    console.error("Error fetching InPost lockers:", error);
    res.status(500).json({
      error: "Failed to fetch InPost lockers",
    });
  }
}
