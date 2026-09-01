import { Router } from "express";

const router = Router();

let cachedLocation = null;
let cachedAt = 0;

const CACHE_TIME = 10 * 60 * 1000; 

router.get("/reverse", async (req, res, next) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({
        error: "Valid lat and lng are required",
      });
    }

    const roundedLat = Number(lat.toFixed(3));
    const roundedLng = Number(lng.toFixed(3));

    const cacheKey = `${roundedLat},${roundedLng}`;

    if (
      cachedLocation &&
      cachedLocation.key === cacheKey &&
      Date.now() - cachedAt < CACHE_TIME
    ) {
      return res.json(cachedLocation.data);
    }

    const url = new URL(
      "https://nominatim.openstreetmap.org/reverse",
    );

    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", roundedLat);
    url.searchParams.set("lon", roundedLng);
    url.searchParams.set("zoom", "10");
    url.searchParams.set("addressdetails", "1");

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "ResQAI/1.0 (ResQAI emergency preparedness application)",
        "Accept-Language": "en",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Nominatim returned ${response.status}`,
      );
    }

    const data = await response.json();

    const address = data.address || {};

    const name =
      address.city ||
      address.town ||
      address.municipality ||
      address.county ||
      address.state ||
      "Your location";

    const result = {
      name,
      displayName: data.display_name || name,
      lat,
      lng,
    };

    cachedLocation = {
      key: cacheKey,
      data: result,
    };

    cachedAt = Date.now();

    res.json(result);
  } catch (error) {
    console.error(
      "Reverse geocoding failed:",
      error.message,
    );

    next(error);
  }
});

export default router;