from math import ceil


MAX_DRIVING_BEFORE_BREAK = 8
BREAK_DURATION = 0.5
MAX_DRIVING_PER_SHIFT = 11
MAX_ON_DUTY_WINDOW = 14
REQUIRED_REST_HOURS = 10
PICKUP_HOURS = 1
DROPOFF_HOURS = 1
FUEL_STOP_HOURS = 0.5
FUEL_EVERY_MILES = 1000
CYCLE_LIMIT_HOURS = 70


def decimal_to_time(hours):
    total_minutes = int(round(hours * 60))
    hour = total_minutes // 60
    minute = total_minutes % 60

    if hour >= 24:
        hour = 24
        minute = 0

    return f"{hour:02d}:{minute:02d}"


def add_event(events, day, status, start, end, remarks, location=""):
    if end <= start:
        return

    events.append({
        "day": day,
        "status": status,
        "start_decimal": round(start, 2),
        "end_decimal": round(end, 2),
        "start": decimal_to_time(start),
        "end": decimal_to_time(end),
        "duration": round(end - start, 2),
        "remarks": remarks,
        "location": location,
    })


def split_events_by_day(events):
    logs_by_day = {}

    for event in events:
        day = event["day"]
        logs_by_day.setdefault(day, []).append(event)

    logs = []

    for day, entries in logs_by_day.items():
        totals = {
            "off_duty": 0,
            "sleeper_berth": 0,
            "driving": 0,
            "on_duty": 0,
        }

        for entry in entries:
            totals[entry["status"]] += entry["duration"]

        total_logged = round(sum(totals.values()), 2)

        logs.append({
            "day": day,
            "date": f"Day {day}",
            "total_miles": 0,
            "entries": entries,
            "totals": {key: round(value, 2) for key, value in totals.items()},
            "total_logged_hours": total_logged,
        })

    return logs


def generate_hos_schedule(
    drive_hours,
    distance_miles,
    current_cycle_used,
    current_location,
    pickup_location,
    dropoff_location,
):
    events = []

    day = 1
    time = 0
    remaining_drive = drive_hours
    cycle_used = current_cycle_used
    cumulative_drive_since_break = 0
    fuel_stops_needed = int(distance_miles // FUEL_EVERY_MILES)
    fuel_stops_added = 0

    # Start with off-duty time before shift
    add_event(
        events,
        day,
        "off_duty",
        0,
        8,
        "Off duty before starting trip",
        current_location,
    )

    time = 8

    # Pickup / pre-trip work
    add_event(
        events,
        day,
        "on_duty",
        time,
        time + PICKUP_HOURS,
        "Pickup / loading / pre-trip inspection",
        pickup_location,
    )

    time += PICKUP_HOURS
    cycle_used += PICKUP_HOURS

    while remaining_drive > 0:
        remaining_cycle = CYCLE_LIMIT_HOURS - cycle_used

        if remaining_cycle <= 0:
            # 34-hour restart simplified into off-duty/sleeper rest
            add_event(
                events,
                day,
                "sleeper_berth",
                time,
                24,
                "Cycle limit reached — sleeper berth/rest",
                "Along route",
            )
            day += 1
            time = 0
            cycle_used = 0
            cumulative_drive_since_break = 0
            add_event(events, day, "off_duty", 0, 10, "34-hour/cycle restart continued", "Along route")
            time = 10
            continue

        available_before_break = MAX_DRIVING_BEFORE_BREAK - cumulative_drive_since_break
        available_today = min(
            MAX_DRIVING_PER_SHIFT,
            MAX_ON_DUTY_WINDOW - (time - 8),
            available_before_break,
            remaining_drive,
            remaining_cycle,
        )

        if available_today <= 0:
            if cumulative_drive_since_break >= MAX_DRIVING_BEFORE_BREAK:
                add_event(
                    events,
                    day,
                    "off_duty",
                    time,
                    min(time + BREAK_DURATION, 24),
                    "30-minute break after 8 cumulative driving hours",
                    "Along route",
                )
                time += BREAK_DURATION
                cumulative_drive_since_break = 0
                continue

            # End of daily driving window/shift
            if time < 24:
                add_event(
                    events,
                    day,
                    "sleeper_berth",
                    time,
                    24,
                    "Sleeper berth / daily rest",
                    "Along route",
                )

            day += 1
            time = 0

            add_event(
                events,
                day,
                "sleeper_berth",
                0,
                REQUIRED_REST_HOURS,
                "10-hour rest completed",
                "Along route",
            )

            time = REQUIRED_REST_HOURS
            cumulative_drive_since_break = 0
            continue

        drive_start = time
        drive_end = time + available_today

        add_event(
            events,
            day,
            "driving",
            drive_start,
            drive_end,
            "Driving",
            "Along route",
        )

        time = drive_end
        remaining_drive -= available_today
        cycle_used += available_today
        cumulative_drive_since_break += available_today

        # Add fuel stop every 1000 miles as on-duty not driving.
        expected_fuel_stops = int(
            ((drive_hours - remaining_drive) / max(drive_hours, 1)) * fuel_stops_needed
        )

        if fuel_stops_added < expected_fuel_stops:
            add_event(
                events,
                day,
                "on_duty",
                time,
                min(time + FUEL_STOP_HOURS, 24),
                "Fuel stop",
                "Along route",
            )
            time += FUEL_STOP_HOURS
            cycle_used += FUEL_STOP_HOURS
            fuel_stops_added += 1
            cumulative_drive_since_break = 0

    # Drop-off
    if time + DROPOFF_HOURS > 24:
        add_event(
            events,
            day,
            "sleeper_berth",
            time,
            24,
            "Sleeper berth / daily rest",
            "Along route",
        )
        day += 1
        time = 0

    add_event(
        events,
        day,
        "on_duty",
        time,
        time + DROPOFF_HOURS,
        "Drop-off / unloading",
        dropoff_location,
    )

    time += DROPOFF_HOURS
    cycle_used += DROPOFF_HOURS

    # Fill rest of final day so total equals 24 hours
    if time < 24:
        add_event(
            events,
            day,
            "off_duty",
            time,
            24,
            "Off duty after trip completion",
            dropoff_location,
        )

    logs = split_events_by_day(events)

    # Estimate daily miles based on driving hours per day
    miles_per_drive_hour = distance_miles / drive_hours if drive_hours else 0

    for log in logs:
        driving_hours = log["totals"].get("driving", 0)
        log["total_miles"] = round(driving_hours * miles_per_drive_hour, 2)

    return {
        "logs": logs,
        "fuel_stops": fuel_stops_needed,
        "required_breaks": len([
            event for event in events
            if "30-minute break" in event["remarks"]
        ]),
        "total_on_duty_hours": round(
            sum(event["duration"] for event in events if event["status"] in ["driving", "on_duty"]),
            2,
        ),
    }