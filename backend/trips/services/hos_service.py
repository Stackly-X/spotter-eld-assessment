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
RESTART_HOURS = 34

EPSILON = 0.01

def absolute_time(day, time):
    return ((day - 1) * 24) + time


def decimal_to_time(hours):
    total_minutes = int(round(hours * 60))
    hour = total_minutes // 60
    minute = total_minutes % 60

    if hour >= 24:
        return "24:00"

    return f"{hour:02d}:{minute:02d}"


def add_event(events, day, status, start, end, remarks, location=""):
    start = max(0, min(24, round(start, 2)))
    end = max(0, min(24, round(end, 2)))

    if end <= start:
        return

    events.append({
        "day": day,
        "status": status,
        "start_decimal": start,
        "end_decimal": end,
        "start": decimal_to_time(start),
        "end": decimal_to_time(end),
        "duration": round(end - start, 2),
        "remarks": remarks,
        "location": location,
    })


def add_rest_period(events, day, time, hours, remarks, location="Along route", status="sleeper_berth"):
    remaining = hours
    current_day = day
    current_time = time
    first = True

    while remaining > EPSILON:
        end_time = min(24, current_time + remaining)

        add_event(
            events,
            current_day,
            status,
            current_time,
            end_time,
            remarks if first else f"{remarks} continued",
            location,
        )

        used = end_time - current_time
        remaining -= used
        first = False

        if remaining > EPSILON:
            current_day += 1
            current_time = 0
        else:
            current_time = end_time

    return current_day, current_time


def schedule_on_duty(
    events,
    day,
    time,
    duration,
    remarks,
    location,
    cycle_used,
    duty_start,
):
    remaining = duration

    while remaining > EPSILON:
        if cycle_used >= CYCLE_LIMIT_HOURS:
            day, time = add_rest_period(
                events,
                day,
                time,
                RESTART_HOURS,
                "70-hour cycle limit reached — 34-hour restart",
            )
            cycle_used = 0
            duty_start = absolute_time(day, time)

        if time >= 24:
            day += 1
            time = 0
            

        if duty_start is None:
            duty_start = absolute_time(day, time)

        available_today = 24 - time
        available_cycle = CYCLE_LIMIT_HOURS - cycle_used
        chunk = min(remaining, available_today, available_cycle)

        add_event(events, day, "on_duty", time, time + chunk, remarks, location)

        time += chunk
        cycle_used += chunk
        remaining -= chunk

        if time >= 24 and remaining > EPSILON:
            day += 1
            time = 0
            

    return day, time, cycle_used, duty_start


def schedule_drive(
    events,
    day,
    time,
    drive_hours,
    cycle_used,
    duty_start,
    shift_driving,
    driving_since_break,
    route_from,
    route_to,
    context,
):
    remaining_drive = drive_hours

    while remaining_drive > EPSILON:
        if cycle_used >= CYCLE_LIMIT_HOURS:
            day, time = add_rest_period(
                events,
                day,
                time,
                RESTART_HOURS,
                "70-hour cycle limit reached — 34-hour restart",
            )
            cycle_used = 0
            duty_start = absolute_time(day, time)
            shift_driving = 0
            driving_since_break = 0

        if duty_start is None:
            duty_start = absolute_time(day, time)

        if time >= 24:
            day += 1
            time = 0
         
        remaining_shift_drive = MAX_DRIVING_PER_SHIFT - shift_driving
        remaining_window = MAX_ON_DUTY_WINDOW - (absolute_time(day, time) - duty_start)
        remaining_before_break = MAX_DRIVING_BEFORE_BREAK - driving_since_break
        remaining_cycle = CYCLE_LIMIT_HOURS - cycle_used

        if driving_since_break >= MAX_DRIVING_BEFORE_BREAK - EPSILON:
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
            driving_since_break = 0

            if time >= 24:
                day += 1
                time = 0
             

            continue

        if remaining_shift_drive <= EPSILON or remaining_window <= EPSILON:
            day, time = add_rest_period(
                events,
                day,
                time,
                REQUIRED_REST_HOURS,
                "10-hour rest completed",
            )

            duty_start = absolute_time(day, time)
            shift_driving = 0
            driving_since_break = 0
            continue

        next_fuel_at = (context["fuel_stops_added"] + 1) * FUEL_EVERY_MILES

        if (
            context["fuel_stops_added"] < context["fuel_stops_needed"]
            and context["miles_per_drive_hour"] > 0
            and context["miles_driven"] < next_fuel_at
        ):
            drive_until_fuel = (next_fuel_at - context["miles_driven"]) / context["miles_per_drive_hour"]
        else:
            drive_until_fuel = remaining_drive

        available_drive = min(
            remaining_drive,
            remaining_shift_drive,
            remaining_window,
            remaining_before_break,
            remaining_cycle,
            24 - time,
            drive_until_fuel,
        )

        if available_drive <= EPSILON:
            day, time = add_rest_period(
                events,
                day,
                time,
                REQUIRED_REST_HOURS,
                "10-hour rest completed",
            )
            duty_start = absolute_time(day, time)
            shift_driving = 0
            driving_since_break = 0
            continue

        add_event(
            events,
            day,
            "driving",
            time,
            time + available_drive,
            f"Driving from {route_from} to {route_to}",
            "Along route",
        )

        time += available_drive
        remaining_drive -= available_drive
        cycle_used += available_drive
        shift_driving += available_drive
        driving_since_break += available_drive
        context["miles_driven"] += available_drive * context["miles_per_drive_hour"]

        reached_fuel_point = (
            context["fuel_stops_added"] < context["fuel_stops_needed"]
            and context["miles_driven"] >= next_fuel_at - 1
        )

        if reached_fuel_point and remaining_drive > EPSILON:
            if time + FUEL_STOP_HOURS > 24:
                day, time = add_rest_period(
                    events,
                    day,
                    time,
                    REQUIRED_REST_HOURS,
                    "10-hour rest completed",
                )
                duty_start = time
                shift_driving = 0
                driving_since_break = 0

            add_event(
                events,
                day,
                "on_duty",
                time,
                time + FUEL_STOP_HOURS,
                "Fuel stop",
                "Along route",
            )

            time += FUEL_STOP_HOURS
            cycle_used += FUEL_STOP_HOURS
            context["fuel_stops_added"] += 1

    return day, time, cycle_used, duty_start, shift_driving, driving_since_break


# def split_events_by_day(events):
def split_events_by_day(events, log_details=None):
    logs_by_day = {}

    for event in events:
        logs_by_day.setdefault(event["day"], []).append(event)

    logs = []

    for day in sorted(logs_by_day.keys()):
        entries = sorted(logs_by_day[day], key=lambda item: item["start_decimal"])

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
            "log_details": log_details or {},
        })

    return logs


def fill_missing_day_time(events):
    logs_by_day = {}

    for event in events:
        logs_by_day.setdefault(event["day"], []).append(event)

    for day, entries in logs_by_day.items():
        entries = sorted(entries, key=lambda item: item["start_decimal"])

        if not entries:
            continue

        last_end = entries[-1]["end_decimal"]

        if last_end < 24:
            add_event(
                events,
                day,
                "off_duty",
                last_end,
                24,
                "Off duty",
                entries[-1].get("location", "Along route"),
            )


def generate_hos_schedule(
    drive_hours,
    distance_miles,
    current_cycle_used,
    current_location,
    pickup_location,
    dropoff_location,
    route_segments=None,
    log_details=None,
):
    events = []

    day = 1
    time = 0
    cycle_used = current_cycle_used
    duty_start = None
    shift_driving = 0
    driving_since_break = 0

    fuel_stops_needed = int(distance_miles // FUEL_EVERY_MILES)

    context = {
        "miles_driven": 0,
        "miles_per_drive_hour": distance_miles / drive_hours if drive_hours else 0,
        "fuel_stops_needed": fuel_stops_needed,
        "fuel_stops_added": 0,
    }

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
    duty_start = absolute_time(day, time)

    segments = route_segments or [
        {
            "from": current_location,
            "to": pickup_location,
            "duration_hours": 0,
            "distance_miles": 0,
        },
        {
            "from": pickup_location,
            "to": dropoff_location,
            "duration_hours": drive_hours,
            "distance_miles": distance_miles,
        },
    ]

    if segments:
        first_segment = segments[0]

        day, time, cycle_used, duty_start, shift_driving, driving_since_break = schedule_drive(
            events=events,
            day=day,
            time=time,
            drive_hours=first_segment["duration_hours"],
            cycle_used=cycle_used,
            duty_start=duty_start,
            shift_driving=shift_driving,
            driving_since_break=driving_since_break,
            route_from=first_segment["from"],
            route_to=first_segment["to"],
            context=context,
        )

    day, time, cycle_used, duty_start = schedule_on_duty(
        events=events,
        day=day,
        time=time,
        duration=PICKUP_HOURS,
        remarks="Pickup / loading",
        location=pickup_location,
        cycle_used=cycle_used,
        duty_start=duty_start,
    )

    remaining_segments = segments[1:] if len(segments) > 1 else []

    if not remaining_segments:
        remaining_segments = [
            {
                "from": pickup_location,
                "to": dropoff_location,
                "duration_hours": drive_hours,
                "distance_miles": distance_miles,
            }
        ]

    for segment in remaining_segments:
        day, time, cycle_used, duty_start, shift_driving, driving_since_break = schedule_drive(
            events=events,
            day=day,
            time=time,
            drive_hours=segment["duration_hours"],
            cycle_used=cycle_used,
            duty_start=duty_start,
            shift_driving=shift_driving,
            driving_since_break=driving_since_break,
            route_from=segment["from"],
            route_to=segment["to"],
            context=context,
        )

    day, time, cycle_used, duty_start = schedule_on_duty(
        events=events,
        day=day,
        time=time,
        duration=DROPOFF_HOURS,
        remarks="Drop-off / unloading",
        location=dropoff_location,
        cycle_used=cycle_used,
        duty_start=duty_start,
    )

    fill_missing_day_time(events)

    logs = split_events_by_day(events, log_details=log_details)

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
            sum(
                event["duration"]
                for event in events
                if event["status"] in ["driving", "on_duty"]
            ),
            2,
        ),
        "ending_cycle_used": round(cycle_used, 2),
    }