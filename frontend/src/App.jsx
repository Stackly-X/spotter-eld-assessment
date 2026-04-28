// frontend/src/App.jsx
import { useState } from "react";
import axios from "axios";
import RouteMap from "./components/RouteMap";
import DailyLogSheet from "./components/DailyLogSheet";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formCardSx = {
  borderRadius: 5,
  border: "1px solid #e2e8f0",
  boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
  overflow: "hidden",
  bgcolor: "#ffffff",
};

const sectionBoxSx = {
  p: 2.5,
  borderRadius: 4,
  bgcolor: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2.5,
    bgcolor: "#ffffff",
    transition: "0.2s ease",
    "& fieldset": {
      borderColor: "#cbd5e1",
    },
    "&:hover fieldset": {
      borderColor: "#60a5fa",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#2563eb",
      borderWidth: 2,
    },
  },
  "& .MuiInputLabel-root": {
    fontWeight: 400,
    color: "#64748b",
  },
  "& .MuiInputBase-input": {
    fontWeight: 400,
    color: "#0f172a",
  },
};


function App() {
  const [form, setForm] = useState({
    current_location: "",
    pickup_location: "",
    dropoff_location: "",
    current_cycle_used: "",
    // added
    driver_name: "",
    carrier_name: "",
    vehicle_number: "",
    trailer_number: "",
    shipping_document_number: "",
    shipper_name: "",
    commodity: "",
    // trip_start_date: "",
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/trips/plan/`, {
        current_location: form.current_location,
        pickup_location: form.pickup_location,
        dropoff_location: form.dropoff_location,
        current_cycle_used: Number(form.current_cycle_used),

        log_details: {
        driver_name: form.driver_name,
        carrier_name: form.carrier_name,
        vehicle_number: form.vehicle_number,
        trailer_number: form.trailer_number,
        shipping_document_number: form.shipping_document_number,
        shipper_name: form.shipper_name,
        commodity: form.commodity,
        // trip_start_date: form.trip_start_date,
      },
      });

      setResult(response.data);setResult(response.data);
setActiveTab(0);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Something went wrong while planning the trip."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 5 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: "#313131", }} >
           FleetRoute <span sx={{ color: "#315a9d" }}>ELD Planner</span>
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Plan compliant truck routes, required stops, and daily driver logs.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
  <Card sx={formCardSx}>
    <Box
      sx={{
        px: 4,
        py: 3,
        background: "#ffffff44",
        borderBottom: "1px solid #e2e8f0",
        color: "#242424",
        textAlign: "left",
      }}
    >
      <Typography variant="h5" fontWeight={900} sx={{ fontWeight: 700}}>
        Trip Details
      </Typography>

      <Typography
        variant="body2"
        sx={{ mt: 0.5, color: "rgba(48, 48, 48, 0.78)" }}
      >
        Enter route details and optional logbook information.
      </Typography>
    </Box>

    <CardContent sx={{ p: 4 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Box sx={sectionBoxSx}>
            <Typography
              variant="subtitle2"
              fontWeight={900}
              sx={{
                mb: 2,
                color: "#0f172a",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Route Information
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Current Location"
                  name="current_location"
                  value={form.current_location}
                  onChange={handleChange}
                  placeholder="Example: Chicago, IL"
                  required
                  fullWidth
                  sx={inputSx}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Pickup Location"
                  name="pickup_location"
                  value={form.pickup_location}
                  onChange={handleChange}
                  placeholder="Example: Indianapolis, IN"
                  required
                  fullWidth
                  sx={inputSx}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Drop-off Location"
                  name="dropoff_location"
                  value={form.dropoff_location}
                  onChange={handleChange}
                  placeholder="Example: Atlanta, GA"
                  required
                  fullWidth
                  sx={inputSx}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Current Cycle Used (Hours)"
                  name="current_cycle_used"
                  value={form.current_cycle_used}
                  onChange={handleChange}
                  type="number"
                  placeholder="Example: 20"
                  inputProps={{ min: 0, max: 70, step: 0.5 }}
                  required
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={sectionBoxSx}>
            <Typography
              variant="subtitle2"
              fontWeight={900}
              sx={{
                mb: 2,
                color: "#0f172a",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Log Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Driver Name"
                  name="driver_name"
                  value={form.driver_name}
                  onChange={handleChange}
                  placeholder="Example: John Smith"
                  fullWidth
                  sx={inputSx}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Carrier Name"
                  name="carrier_name"
                  value={form.carrier_name}
                  onChange={handleChange}
                  placeholder="Example: FleetRoute Carrier"
                  fullWidth
                  sx={inputSx}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Vehicle / Truck Number"
                  name="vehicle_number"
                  value={form.vehicle_number}
                  onChange={handleChange}
                  placeholder="Example: TRK-102"
                  fullWidth
                  sx={inputSx}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Trailer Number"
                  name="trailer_number"
                  value={form.trailer_number}
                  onChange={handleChange}
                  placeholder="Example: TRL-88"
                  fullWidth
                  sx={inputSx}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Shipping Document Number"
                  name="shipping_document_number"
                  value={form.shipping_document_number}
                  onChange={handleChange}
                  placeholder="Example: BOL-12345"
                  fullWidth
                  sx={inputSx}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Shipper Name"
                  name="shipper_name"
                  value={form.shipper_name}
                  onChange={handleChange}
                  placeholder="Example: Don's Paper Co."
                  fullWidth
                  sx={inputSx}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Commodity"
                  name="commodity"
                  value={form.commodity}
                  onChange={handleChange}
                  placeholder="Example: Paper products"
                  fullWidth
                  sx={inputSx}
                />
              </Grid>
            </Grid>
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              py: 1.6,
              borderRadius: 3,
              fontWeight: 900,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              bgcolor: "#2563eb",
              boxShadow: "0 12px 24px rgba(37, 99, 235, 0.28)",
              "&:hover": {
                bgcolor: "#1d4ed8",
                boxShadow: "0 16px 28px rgba(37, 99, 235, 0.35)",
              },
            }}
          >
            {loading ? <CircularProgress size={24} /> : "Plan Trip"}
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}
    </CardContent>
  </Card>
</Grid>

          <Grid item xs={12} md={7} sx={{width: "100%"}}> 
  <Card
    sx={{
      borderRadius: 4,
      boxShadow: "0 14px 35px rgba(15, 23, 42, 0.08)",
      border: "1px solid #e2e8f0",
      minHeight: 360,
    }}
  >
    <CardContent sx={{ p: 0 }}>
      {!result ? (
        <Box
          sx={{
            p: 5,
            minHeight: 320,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            bgcolor: "#ffffff",
            borderRadius: 4,
          }}
        >
          <Typography variant="h5"  sx={{ fontSize: "32px", color: "#242424", fontWeight: 700 }}>
            Ready to plan your route
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1.6, maxWidth: 420 }}>
            Enter trip details and click Plan Trip to generate the route summary,
            map, stops, and driver daily logs.
          </Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              px: 3,
              pt: 2,
              borderBottom: "1px solid #e2e8f0",
              bgcolor: "#ffffff",
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(event, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                "& .MuiTab-root": {
                  fontWeight: 700,
                  textTransform: "none",
                  minHeight: 52,
                },
              }}
            >
              <Tab label="Overview" />
              <Tab label="Map" />
              <Tab label="Stops" />
              <Tab label="Logs" />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>
            {activeTab === 0 && (
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
                  Route Summary
                </Typography>

                <Grid container spacing={2}>
                  {Object.entries(result.summary).map(([key, value]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          bgcolor: "#f8fafc",
                          
                          border: "1px solid #e2e8f0",
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            textTransform: "uppercase",
                            color: "#64748b",
                            
                            fontWeight: 600,
                          }}
                        >
                          {key.replaceAll("_", " ")}
                        </Typography>

                        <Typography
                          variant="h5"
                          fontWeight={900}
                        
                          sx={{
                            marginTop: "4px",
                            color:
                              key === "remaining_cycle_hours" && Number(value) < 0
                                ? "#dc2626"
                                : "#404142",
                          }}
                        >
                          {value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
                  Route Map
                </Typography>

                <RouteMap route={result.route} mapStops={result.map_stops || []} />
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
                  Stops Timeline
                </Typography>

                <Stack spacing={1.5}>
                  {result.stops.map((stop, index) => (
                    <Box
                      key={`${stop.type}-${index}`}
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                        textAlign: "left",
                        p: 2,
                        borderRadius: 3,
                        bgcolor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <Chip label={index + 1} color="primary" />

                      <Box>
                        <Typography fontWeight={800}>{stop.label}</Typography>
                        <Typography color="text.secondary">
                          {stop.location}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {activeTab === 3 && (
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
                  Daily Log Sheets
                </Typography>

                {result.logs.map((log) => (
                  <DailyLogSheet key={log.day} log={log} />
                ))}
              </Box>
            )}
          </Box>
        </>
      )}
    </CardContent>
  </Card>
</Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default App;