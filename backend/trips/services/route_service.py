import os
import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTE_API_KEY = os.getenv("OPENROUTE_API_KEY")


class RouteServiceError(Exception):
    pass


def geocode_location(location):
    if not OPENROUTE_API_KEY:
        raise RouteServiceError("OPENROUTE_API_KEY is missing in .env file.")

    response = requests.get(
        "https://api.openrouteservice.org/geocode/search",
        headers={"Authorization": OPENROUTE_API_KEY},
        params={"text": location, "size": 1},
        timeout=20,
    )

    response.raise_for_status()
    data = response.json()
    features = data.get("features", [])

    if not features:
        raise RouteServiceError(f"No coordinates found for location: {location}")

    feature = features[0]

    return {
        "input": location,
        "label": feature["properties"].get("label", location),
        "coordinates": feature["geometry"]["coordinates"],  # [lng, lat]
    }


def get_route(current_location, pickup_location, dropoff_location):
    current = geocode_location(current_location)
    pickup = geocode_location(pickup_location)
    dropoff = geocode_location(dropoff_location)

    coordinates = [
        current["coordinates"],
        pickup["coordinates"],
        dropoff["coordinates"],
    ]

    response = requests.post(
        "https://api.openrouteservice.org/v2/directions/driving-hgv/geojson",
        headers={
            "Authorization": OPENROUTE_API_KEY,
            "Content-Type": "application/json",
        },
        json={"coordinates": coordinates},
        timeout=30,
    )

    response.raise_for_status()
    data = response.json()

    feature = data["features"][0]
    summary = feature["properties"]["summary"]

    distance_miles = round(summary["distance"] / 1609.344, 2)
    duration_hours = round(summary["duration"] / 3600, 2)

    route_geometry = [
        [point[1], point[0]]
        for point in feature["geometry"]["coordinates"]
    ]

    raw_segments = feature["properties"].get("segments", [])

    segment_labels = [
        {
            "from": current["label"],
            "to": pickup["label"],
        },
        {
            "from": pickup["label"],
            "to": dropoff["label"],
        },
    ]

    segments = []

    for index, segment in enumerate(raw_segments):
        labels = segment_labels[index] if index < len(segment_labels) else {
            "from": "Route",
            "to": "Route",
        }

        segments.append({
            "from": labels["from"],
            "to": labels["to"],
            "distance_miles": round(segment["distance"] / 1609.344, 2),
            "duration_hours": round(segment["duration"] / 3600, 2),
        })

    if not segments:
        segments = [
            {
                "from": current["label"],
                "to": dropoff["label"],
                "distance_miles": distance_miles,
                "duration_hours": duration_hours,
            }
        ]

    return {
        "distance_miles": distance_miles,
        "duration_hours": duration_hours,
        "geometry": route_geometry,
        "segments": segments,
        "locations": {
            "current": {
                **current,
                "leaflet_coordinates": [
                    current["coordinates"][1],
                    current["coordinates"][0],
                ],
            },
            "pickup": {
                **pickup,
                "leaflet_coordinates": [
                    pickup["coordinates"][1],
                    pickup["coordinates"][0],
                ],
            },
            "dropoff": {
                **dropoff,
                "leaflet_coordinates": [
                    dropoff["coordinates"][1],
                    dropoff["coordinates"][0],
                ],
            },
        },
    }