import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENROUTE_API_KEY")

if not API_KEY:
    raise ValueError("OPENROUTE_API_KEY is missing. Check your backend/.env file.")


def geocode_location(location):
    url = "https://api.openrouteservice.org/geocode/search"

    response = requests.get(
        url,
        headers={"Authorization": API_KEY},
        params={"text": location, "size": 1},
        timeout=20,
    )

    response.raise_for_status()
    data = response.json()

    features = data.get("features", [])
    if not features:
        raise ValueError(f"No coordinates found for: {location}")

    coordinates = features[0]["geometry"]["coordinates"]
    label = features[0]["properties"].get("label", location)

    return {
        "location": location,
        "label": label,
        "coordinates": coordinates,
    }


def get_route(points):
    url = "https://api.openrouteservice.org/v2/directions/driving-hgv/geojson"

    response = requests.post(
        url,
        headers={
            "Authorization": API_KEY,
            "Content-Type": "application/json",
        },
        json={"coordinates": points},
        timeout=30,
    )

    response.raise_for_status()
    data = response.json()

    summary = data["features"][0]["properties"]["summary"]

    return {
        "distance_miles": round(summary["distance"] / 1609.344, 2),
        "duration_hours": round(summary["duration"] / 3600, 2),
        "geometry_type": data["features"][0]["geometry"]["type"],
        "route_points_count": len(data["features"][0]["geometry"]["coordinates"]),
    }


current = geocode_location("San Francisco, CA")
pickup = geocode_location("Los Angeles, CA")
dropoff = geocode_location("San Diego, CA")

print("Current:", current)
print("Pickup:", pickup)
print("Drop-off:", dropoff)

route = get_route([
    current["coordinates"],
    pickup["coordinates"],
    dropoff["coordinates"],
])

print("Route:", route)