# # from django.shortcuts import render

# # # Create your views here.

# from rest_framework.decorators import api_view
# from rest_framework.response import Response


# @api_view(["GET"])
# def health_check(request):
#     return Response({
#         "status": "ok",
#         "message": "Backend is connected and running."
#     })


# @api_view(["POST"])
# def plan_trip(request):
#     current_location = request.data.get("current_location")
#     pickup_location = request.data.get("pickup_location")
#     dropoff_location = request.data.get("dropoff_location")
#     current_cycle_used = request.data.get("current_cycle_used", 0)

#     if not current_location or not pickup_location or not dropoff_location:
#         return Response(
#             {
#                 "error": "Current location, pickup location, and drop-off location are required."
#             },
#             status=400
#         )

#     return Response({
#         "message": "Trip plan generated successfully.",
#         "inputs": {
#             "current_location": current_location,
#             "pickup_location": pickup_location,
#             "dropoff_location": dropoff_location,
#             "current_cycle_used": current_cycle_used,
#         },
#         "summary": {
#             "total_distance_miles": 720,
#             "estimated_drive_hours": 12.5,
#             "pickup_time_hours": 1,
#             "dropoff_time_hours": 1,
#             "fuel_stops": 0,
#             "required_breaks": 1,
#             "cycle_limit_hours": 70,
#             "remaining_cycle_hours": 70 - float(current_cycle_used),
#         },
#         "stops": [
#             {
#                 "type": "start",
#                 "label": "Start Trip",
#                 "location": current_location,
#             },
#             {
#                 "type": "pickup",
#                 "label": "Pickup - 1 hour",
#                 "location": pickup_location,
#             },
#             {
#                 "type": "break",
#                 "label": "30-minute rest break after 8 hours driving",
#                 "location": "Along route",
#             },
#             {
#                 "type": "dropoff",
#                 "label": "Drop-off - 1 hour",
#                 "location": dropoff_location,
#             },
#         ],
#         "logs": [
#             {
#                 "day": 1,
#                 "date": "Sample Day 1",
#                 "total_miles": 550,
#                 "entries": [
#                     {
#                         "status": "off_duty",
#                         "start": "00:00",
#                         "end": "08:00",
#                         "remarks": "Off duty before trip",
#                     },
#                     {
#                         "status": "on_duty",
#                         "start": "08:00",
#                         "end": "09:00",
#                         "remarks": "Pre-trip / pickup work",
#                     },
#                     {
#                         "status": "driving",
#                         "start": "09:00",
#                         "end": "17:00",
#                         "remarks": "Driving",
#                     },
#                     {
#                         "status": "off_duty",
#                         "start": "17:00",
#                         "end": "17:30",
#                         "remarks": "30-minute break",
#                     },
#                     {
#                         "status": "driving",
#                         "start": "17:30",
#                         "end": "20:30",
#                         "remarks": "Driving",
#                     },
#                     {
#                         "status": "sleeper_berth",
#                         "start": "20:30",
#                         "end": "24:00",
#                         "remarks": "Sleeper berth / rest",
#                     },
#                 ],
#             }
#         ],
#     })














# #views.py
# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from .services.route_service import get_route, RouteServiceError
# from .services.hos_service import generate_hos_schedule


# @api_view(["GET"])
# def health_check(request):
#     return Response({
#         "status": "ok",
#         "message": "Backend is connected and running."
#     })


# @api_view(["POST"])
# def plan_trip(request):
#     current_location = request.data.get("current_location")
#     pickup_location = request.data.get("pickup_location")
#     dropoff_location = request.data.get("dropoff_location")
#     current_cycle_used = float(request.data.get("current_cycle_used", 0))

#     if not current_location or not pickup_location or not dropoff_location:
#         return Response(
#             {
#                 "error": "Current location, pickup location, and drop-off location are required."
#             },
#             status=400
#         )

#     if current_cycle_used < 0 or current_cycle_used > 70:
#         return Response(
#             {
#                 "error": "Current cycle used must be between 0 and 70 hours."
#             },
#             status=400
#         )

#     try:
#         route = get_route(
#             current_location=current_location,
#             pickup_location=pickup_location,
#             dropoff_location=dropoff_location,
#         )
#     except RouteServiceError as error:
#         return Response({"error": str(error)}, status=400)
#     # except Exception:
#     #     return Response(
#     #         {
#     #             "error": "Unable to calculate route. Please check the locations and try again."
#     #         },
#     #         status=500
#     #     )
#     except Exception:
#     return Response(
#         {
#             "error": (
#                 "Unable to calculate a truck-driving route for these locations. "
#                 "Some locations may require ferry/air travel or may not be connected "
#                 "by truck-accessible roads. Please try connected road locations."
#             )
#         },
#         status=500
#     )

#     distance_miles = route["distance_miles"]
#     drive_hours = route["duration_hours"]

#     # fuel_stops = int(distance_miles // 1000)
#     # required_breaks = int(drive_hours // 8)

#     # pickup_time_hours = 1
#     # dropoff_time_hours = 1

#     # total_on_duty_hours = round(
#     #     drive_hours + pickup_time_hours + dropoff_time_hours + (fuel_stops * 0.5),
#     #     2
#     # )

#     # remaining_cycle_hours = round(70 - current_cycle_used - total_on_duty_hours, 2)

#     pickup_time_hours = 1
#     dropoff_time_hours = 1

#     hos_plan = generate_hos_schedule(
#         drive_hours=drive_hours,
#         distance_miles=distance_miles,
#         current_cycle_used=current_cycle_used,
#         current_location=route["locations"]["current"]["label"],
#         pickup_location=route["locations"]["pickup"]["label"],
#         dropoff_location=route["locations"]["dropoff"]["label"],
#     )

#     fuel_stops = hos_plan["fuel_stops"]
#     required_breaks = hos_plan["required_breaks"]
#     total_on_duty_hours = hos_plan["total_on_duty_hours"]
#     remaining_cycle_hours = round(70 - current_cycle_used - total_on_duty_hours, 2)

#     return Response({
#         "message": "Trip plan generated successfully.",
#         "inputs": {
#             "current_location": current_location,
#             "pickup_location": pickup_location,
#             "dropoff_location": dropoff_location,
#             "current_cycle_used": current_cycle_used,
#         },
#         "route": {
#             "distance_miles": distance_miles,
#             "duration_hours": drive_hours,
#             "geometry": route["geometry"],
#             "locations": route["locations"],
#         },
#         "summary": {
#             "total_distance_miles": distance_miles,
#             "estimated_drive_hours": drive_hours,
#             "pickup_time_hours": pickup_time_hours,
#             "dropoff_time_hours": dropoff_time_hours,
#             "fuel_stops": fuel_stops,
#             "required_breaks": required_breaks,
#             "cycle_limit_hours": 70,
#             "current_cycle_used": current_cycle_used,
#             "estimated_on_duty_hours": total_on_duty_hours,
#             "remaining_cycle_hours": remaining_cycle_hours,
#         },
#         "stops": [
#             {
#                 "type": "start",
#                 "label": "Start Trip",
#                 "location": route["locations"]["current"]["label"],
#                 "coordinates": route["locations"]["current"]["leaflet_coordinates"],
#             },
#             {
#                 "type": "pickup",
#                 "label": "Pickup - 1 hour",
#                 "location": route["locations"]["pickup"]["label"],
#                 "coordinates": route["locations"]["pickup"]["leaflet_coordinates"],
#             },
#             # {
#             #     "type": "break",
#             #     "label": "30-minute break after 8 hours driving",
#             #     "location": "Along route",
#             #     "coordinates": None,
#             # },
#             {
#                 "type": "break",
#                 "label": f"{required_breaks} required 30-minute break(s)",
#                 "location": "Calculated from HOS rule after 8 cumulative driving hours",
#                 "coordinates": None,
#             },
#             {
#                "type": "fuel",
#               "label": f"{fuel_stops} fuel stop(s)",
#               "location": "Fueling required at least once every 1,000 miles",
#               "coordinates": None,
#             },
#             {
#                 "type": "dropoff",
#                 "label": "Drop-off - 1 hour",
#                 "location": route["locations"]["dropoff"]["label"],
#                 "coordinates": route["locations"]["dropoff"]["leaflet_coordinates"],
#             },
#         ],
#         # "logs": [
#         #     {
#         #         "day": 1,
#         #         "date": "Sample Day 1",
#         #         "total_miles": min(distance_miles, 550),
#         #         "entries": [
#         #             {
#         #                 "status": "off_duty",
#         #                 "start": "00:00",
#         #                 "end": "08:00",
#         #                 "remarks": "Off duty before trip",
#         #             },
#         #             {
#         #                 "status": "on_duty",
#         #                 "start": "08:00",
#         #                 "end": "09:00",
#         #                 "remarks": "Pre-trip / pickup work",
#         #             },
#         #             {
#         #                 "status": "driving",
#         #                 "start": "09:00",
#         #                 "end": "17:00",
#         #                 "remarks": "Driving",
#         #             },
#         #             {
#         #                 "status": "off_duty",
#         #                 "start": "17:00",
#         #                 "end": "17:30",
#         #                 "remarks": "30-minute break",
#         #             },
#         #             {
#         #                 "status": "driving",
#         #                 "start": "17:30",
#         #                 "end": "20:30",
#         #                 "remarks": "Driving",
#         #             },
#         #             {
#         #                 "status": "sleeper_berth",
#         #                 "start": "20:30",
#         #                 "end": "24:00",
#         #                 "remarks": "Sleeper berth / rest",
#         #             },
#         #         ],
#         #     }
#         # ],
#         "logs": hos_plan["logs"],
#     })









# views.py

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


@api_view(["POST"])
def plan_trip(request):
    current_location = request.data.get("current_location")
    pickup_location = request.data.get("pickup_location")
    dropoff_location = request.data.get("dropoff_location")

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
    remaining_cycle_hours = round(70 - current_cycle_used - total_on_duty_hours, 2)

    return Response({
        "message": "Trip plan generated successfully.",
        "inputs": {
            "current_location": current_location,
            "pickup_location": pickup_location,
            "dropoff_location": dropoff_location,
            "current_cycle_used": current_cycle_used,
        },
        "route": {
            "distance_miles": distance_miles,
            "duration_hours": drive_hours,
            "geometry": route["geometry"],
            "locations": route["locations"],
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
        "logs": hos_plan["logs"],
    })