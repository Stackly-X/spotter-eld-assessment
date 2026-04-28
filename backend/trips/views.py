from rest_framework.decorators import api_view
from rest_framework.response import Response

from .services.route_service import get_route, RouteServiceError
from .services.hos_service import generate_hos_schedule


@api_view(["GET"])
def health_check(request):
    return Response({
        "status": "ok",
        "message": "Backend is connected and running."
    })

def get_route_point_by_ratio(route_geometry, ratio):
    if not route_geometry:
        return None

    safe_ratio = max(0, min(1, ratio))
    index = round((len(route_geometry) - 1) * safe_ratio)

    return route_geometry[index]


def build_generated_map_stops(logs, route_geometry):
    stop_events = []

    for log in logs:
        for entry in log.get("entries", []):
            remarks = entry.get("remarks", "")
            remarks_lower = remarks.lower()
            status = entry.get("status", "")

            if "30-minute break" in remarks_lower:
                stop_events.append({
                    "type": "break",
                    "label": f"Break — Day {log.get('day')}",
                    "time": f"{entry.get('start')} - {entry.get('end')}",
                    "location": entry.get("location") or "Along route",
                    "remarks": remarks,
                })

            elif "fuel stop" in remarks_lower:
                stop_events.append({
                    "type": "fuel",
                    "label": f"Fuel Stop — Day {log.get('day')}",
                    "time": f"{entry.get('start')} - {entry.get('end')}",
                    "location": entry.get("location") or "Along route",
                    "remarks": remarks,
                })

            elif status == "sleeper_berth" and (
                "10-hour rest" in remarks_lower
                or "daily rest" in remarks_lower
                or "cycle limit" in remarks_lower
                or "34-hour" in remarks_lower
            ):
                stop_events.append({
                    "type": "rest",
                    "label": f"Rest Stop — Day {log.get('day')}",
                    "time": f"{entry.get('start')} - {entry.get('end')}",
                    "location": entry.get("location") or "Along route",
                    "remarks": remarks,
                })

    total_stops = len(stop_events)

    for index, stop in enumerate(stop_events):
        ratio = (index + 1) / (total_stops + 1)
        stop["coordinates"] = get_route_point_by_ratio(route_geometry, ratio)

    return [
        stop for stop in stop_events
        if stop.get("coordinates")
    ]

@api_view(["POST"])
def plan_trip(request):
    current_location = request.data.get("current_location")
    pickup_location = request.data.get("pickup_location")
    dropoff_location = request.data.get("dropoff_location")

    log_details = request.data.get("log_details") or {}

    if not isinstance(log_details, dict):
        log_details = {}

    try:
        current_cycle_used = float(request.data.get("current_cycle_used", 0))
    except (TypeError, ValueError):
        return Response(
            {"error": "Current cycle used must be a valid number."},
            status=400
        )

    if not current_location or not pickup_location or not dropoff_location:
        return Response(
            {
                "error": "Current location, pickup location, and drop-off location are required."
            },
            status=400
        )

    if current_cycle_used < 0 or current_cycle_used > 70:
        return Response(
            {
                "error": "Current cycle used must be between 0 and 70 hours."
            },
            status=400
        )

    try:
        route = get_route(
            current_location=current_location,
            pickup_location=pickup_location,
            dropoff_location=dropoff_location,
        )
    except RouteServiceError as error:
        return Response({"error": str(error)}, status=400)
    except Exception as error:
        return Response(
            {
                "error": (
                    "Unable to calculate a truck-driving route for these locations. "
                    "Some locations may not be connected by truck-accessible roads. "
                    f"Details: {str(error)}"
                )
            },
            status=500
        )

    distance_miles = route["distance_miles"]
    drive_hours = route["duration_hours"]

    pickup_time_hours = 1
    dropoff_time_hours = 1

    try:
        hos_plan = generate_hos_schedule(
            drive_hours=drive_hours,
            distance_miles=distance_miles,
            current_cycle_used=current_cycle_used,
            current_location=route["locations"]["current"]["label"],
            pickup_location=route["locations"]["pickup"]["label"],
            dropoff_location=route["locations"]["dropoff"]["label"],
            route_segments=route.get("segments", []),
            log_details=log_details,
        )
    except Exception as error:
        return Response(
            {
                "error": f"HOS log generation failed: {str(error)}"
            },
            status=500
        )

    fuel_stops = hos_plan["fuel_stops"]
    required_breaks = hos_plan["required_breaks"]
    total_on_duty_hours = hos_plan["total_on_duty_hours"]
    remaining_cycle_hours = round(
        70 - hos_plan.get("ending_cycle_used", current_cycle_used + total_on_duty_hours),
        2
    )

    map_stops = build_generated_map_stops(
    logs=hos_plan["logs"],
    route_geometry=route["geometry"],
)

    return Response({
        "message": "Trip plan generated successfully.",
        "inputs": {
            "current_location": current_location,
            "pickup_location": pickup_location,
            "dropoff_location": dropoff_location,
            "current_cycle_used": current_cycle_used,
            "log_details": log_details,
        },
        "route": {
            "distance_miles": distance_miles,
            "duration_hours": drive_hours,
            "geometry": route["geometry"],
            "locations": route["locations"],
            "segments": route.get("segments", []),
        },
        "summary": {
            "total_distance_miles": distance_miles,
            "estimated_drive_hours": drive_hours,
            "pickup_time_hours": pickup_time_hours,
            "dropoff_time_hours": dropoff_time_hours,
            "fuel_stops": fuel_stops,
            "required_breaks": required_breaks,
            "cycle_limit_hours": 70,
            "current_cycle_used": current_cycle_used,
            "estimated_on_duty_hours": total_on_duty_hours,
            "remaining_cycle_hours": remaining_cycle_hours,
        },
        "stops": [
            {
                "type": "start",
                "label": "Start Trip",
                "location": route["locations"]["current"]["label"],
                "coordinates": route["locations"]["current"]["leaflet_coordinates"],
            },
            {
                "type": "pickup",
                "label": "Pickup - 1 hour",
                "location": route["locations"]["pickup"]["label"],
                "coordinates": route["locations"]["pickup"]["leaflet_coordinates"],
            },
            {
                "type": "break",
                "label": f"{required_breaks} required 30-minute break(s)",
                "location": "Calculated from HOS rule after 8 cumulative driving hours",
                "coordinates": None,
            },
            {
                "type": "fuel",
                "label": f"{fuel_stops} fuel stop(s)",
                "location": "Fueling required at least once every 1,000 miles",
                "coordinates": None,
            },
            {
                "type": "dropoff",
                "label": "Drop-off - 1 hour",
                "location": route["locations"]["dropoff"]["label"],
                "coordinates": route["locations"]["dropoff"]["leaflet_coordinates"],
            },
        ],
        "map_stops": map_stops,
        "logs": hos_plan["logs"],
    })