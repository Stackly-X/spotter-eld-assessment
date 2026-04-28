import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { Box, Chip, Stack, Typography } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import FlagIcon from "@mui/icons-material/Flag";

const markerIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function RouteMap({ route, mapStops = [] }) {
  if (!route?.geometry?.length) {
    return (
      <Typography color="text.secondary">
        Route map will appear after planning a trip.
      </Typography>
    );
  }

  const current = route.locations.current;
  const pickup = route.locations.pickup;
  const dropoff = route.locations.dropoff;

  const markers = [
    {
      type: "start",
      label: "Start",
      location: current.label,
      position: current.leaflet_coordinates,
    },
    {
      type: "pickup",
      label: "Pickup",
      location: pickup.label,
      position: pickup.leaflet_coordinates,
    },
    {
      type: "dropoff",
      label: "Drop-off",
      location: dropoff.label,
      position: dropoff.leaflet_coordinates,
    },
  ];

  const generatedStopMarkers = mapStops.filter(
    (stop) => Array.isArray(stop.coordinates) && stop.coordinates.length === 2
  );

  const hasBreakStops = generatedStopMarkers.some(
    (stop) => stop.type === "break"
  );
  const hasFuelStops = generatedStopMarkers.some(
    (stop) => stop.type === "fuel"
  );
  const hasRestStops = generatedStopMarkers.some(
    (stop) => stop.type === "rest"
  );

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Chip icon={<LocationOnIcon />} label="Start" color="primary" />
        <Chip icon={<LocalShippingIcon />} label="Pickup" color="warning" />
        <Chip icon={<FlagIcon />} label="Drop-off" color="success" />

        {hasBreakStops && <Chip label="Break" color="info" />}
        {hasFuelStops && <Chip label="Fuel" color="secondary" />}
        {hasRestStops && <Chip label="Rest" color="default" />}
      </Stack>

      <Box
        sx={{
          height: 420,
          width: "100%",
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid #dbe4ee",
        }}
      >
        <MapContainer
          center={current.leaflet_coordinates}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Polyline positions={route.geometry} weight={5} />

          {markers.map((marker) => (
            <Marker
              key={marker.type}
              position={marker.position}
              icon={markerIcon}
            >
              <Popup>
                <Typography fontWeight={700}>{marker.label}</Typography>
                <Typography variant="body2">{marker.location}</Typography>
              </Popup>
            </Marker>
          ))}

          {generatedStopMarkers.map((stop, index) => (
            <Marker
              key={`${stop.type}-${index}`}
              position={stop.coordinates}
              icon={markerIcon}
            >
              <Popup>
                <Typography fontWeight={700}>{stop.label}</Typography>
                <Typography variant="body2">{stop.time}</Typography>
                <Typography variant="body2">{stop.location}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {stop.remarks}
                </Typography>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Box>
  );
}

export default RouteMap;