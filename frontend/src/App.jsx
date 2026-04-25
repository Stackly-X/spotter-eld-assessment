// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <section id="center">
//         <div className="hero">
//           <img src={heroImg} className="base" width="170" height="179" alt="" />
//           <img src={reactLogo} className="framework" alt="React logo" />
//           <img src={viteLogo} className="vite" alt="Vite logo" />
//         </div>
//         <div>
//           <h1>Get started</h1>
//           <p>
//             Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
//           </p>
//         </div>
//         <button
//           type="button"
//           className="counter"
//           onClick={() => setCount((count) => count + 1)}
//         >
//           Count is {count}
//         </button>
//       </section>

//       <div className="ticks"></div>

//       <section id="next-steps">
//         <div id="docs">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#documentation-icon"></use>
//           </svg>
//           <h2>Documentation</h2>
//           <p>Your questions, answered</p>
//           <ul>
//             <li>
//               <a href="https://vite.dev/" target="_blank">
//                 <img className="logo" src={viteLogo} alt="" />
//                 Explore Vite
//               </a>
//             </li>
//             <li>
//               <a href="https://react.dev/" target="_blank">
//                 <img className="button-icon" src={reactLogo} alt="" />
//                 Learn more
//               </a>
//             </li>
//           </ul>
//         </div>
//         <div id="social">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#social-icon"></use>
//           </svg>
//           <h2>Connect with us</h2>
//           <p>Join the Vite community</p>
//           <ul>
//             <li>
//               <a href="https://github.com/vitejs/vite" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#github-icon"></use>
//                 </svg>
//                 GitHub
//               </a>
//             </li>
//             <li>
//               <a href="https://chat.vite.dev/" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#discord-icon"></use>
//                 </svg>
//                 Discord
//               </a>
//             </li>
//             <li>
//               <a href="https://x.com/vite_js" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#x-icon"></use>
//                 </svg>
//                 X.com
//               </a>
//             </li>
//             <li>
//               <a href="https://bsky.app/profile/vite.dev" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#bluesky-icon"></use>
//                 </svg>
//                 Bluesky
//               </a>
//             </li>
//           </ul>
//         </div>
//       </section>

//       <div className="ticks"></div>
//       <section id="spacer"></section>
//     </>
//   )
// }

// export default App


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
} from "@mui/material";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [form, setForm] = useState({
    current_location: "",
    pickup_location: "",
    dropoff_location: "",
    current_cycle_used: "",
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      });

      setResult(response.data);
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
          <Typography variant="h3" fontWeight={800}>
            FleetRoute ELD Planner
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Plan compliant truck routes, required stops, and daily driver logs.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
                  Trip Details
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={2.5}>
                    <TextField
                      label="Current Location"
                      name="current_location"
                      value={form.current_location}
                      onChange={handleChange}
                      placeholder="Example: Chicago, IL"
                      required
                      fullWidth
                    />

                    <TextField
                      label="Pickup Location"
                      name="pickup_location"
                      value={form.pickup_location}
                      onChange={handleChange}
                      placeholder="Example: Indianapolis, IN"
                      required
                      fullWidth
                    />

                    <TextField
                      label="Drop-off Location"
                      name="dropoff_location"
                      value={form.dropoff_location}
                      onChange={handleChange}
                      placeholder="Example: Atlanta, GA"
                      required
                      fullWidth
                    />

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
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      sx={{ py: 1.4, borderRadius: 3, fontWeight: 700 }}
                    >
                      {loading ? <CircularProgress size={24} /> : "Plan Trip"}
                    </Button>
                  </Stack>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mt: 3 }}>
                    {error}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                    Route Summary
                  </Typography>

                  {!result ? (
                    <Typography color="text.secondary">
                      Enter trip details and click Plan Trip to generate the
                      route summary, stops, and daily logs.
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {Object.entries(result.summary).map(([key, value]) => (
                        <Grid item xs={12} sm={6} key={key}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              bgcolor: "#f1f5f9",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ textTransform: "uppercase" }}
                            >
                              {key.replaceAll("_", " ")}
                            </Typography>
                            <Typography variant="h6" fontWeight={800}>
                              {value}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>

              {/* {result && (
                <>
                  <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                        Stops Timeline
                      </Typography>

                      <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
  <CardContent sx={{ p: 4 }}>
    <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
      Route Map
    </Typography>

    <RouteMap />
  </CardContent>
</Card>

                      <Stack spacing={1.5}>
                        {result.stops.map((stop, index) => (
                          <Box
                            key={`${stop.type}-${index}`}
                            sx={{
                              display: "flex",
                              gap: 2,
                              alignItems: "center",
                              p: 2,
                              borderRadius: 3,
                              bgcolor: "#f8fafc",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <Chip label={index + 1} color="primary" />
                            <Box>
                              <Typography fontWeight={700}>
                                {stop.label}
                              </Typography>
                              <Typography color="text.secondary">
                                {stop.location}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                        Daily Log Sheets
                      </Typography>

                      {result.logs.map((log) => (
                        <Box
                          key={log.day}
                          sx={{
                            p: 2,
                            mb: 2,
                            borderRadius: 3,
                            border: "1px solid #cbd5e1",
                          }}
                        >
                          <Typography fontWeight={800} sx={{ mb: 2 }}>
                            Day {log.day} — {log.date}
                          </Typography>

                          <Stack spacing={1}>
                            {log.entries.map((entry, index) => (
                              <Box
                                key={index}
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr 2fr",
                                  gap: 2,
                                  p: 1.5,
                                  borderRadius: 2,
                                  bgcolor: "#f1f5f9",
                                }}
                              >
                                <Typography fontWeight={700}>
                                  {entry.status.replaceAll("_", " ")}
                                </Typography>

                                <Typography>
                                  {entry.start} - {entry.end}
                                </Typography>

                                <Typography color="text.secondary">
                                  {entry.remarks}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </>
              )} */}

              {result && (
  <>
    <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          Route Map
        </Typography>

        {/* <RouteMap /> */}
        <RouteMap route={result.route} />
      </CardContent>
    </Card>

    <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
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
                p: 2,
                borderRadius: 3,
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <Chip label={index + 1} color="primary" />
              <Box>
                <Typography fontWeight={700}>{stop.label}</Typography>
                <Typography color="text.secondary">{stop.location}</Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>

    {/* <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          Daily Log Sheets
        </Typography>

        {result.logs.map((log) => (
          <Box
            key={log.day}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 3,
              border: "1px solid #cbd5e1",
            }}
          >
            <Typography fontWeight={800} sx={{ mb: 2 }}>
              Day {log.day} — {log.date}
            </Typography>

            <Stack spacing={1}>
              {log.entries.map((entry, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 2fr",
                    gap: 2,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "#f1f5f9",
                  }}
                >
                  <Typography fontWeight={700}>
                    {entry.status.replaceAll("_", " ")}
                  </Typography>

                  <Typography>
                    {entry.start} - {entry.end}
                  </Typography>

                  <Typography color="text.secondary">
                    {entry.remarks}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        ))}
      </CardContent>
    </Card> */}

    <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
  <CardContent sx={{ p: 4 }}>
    <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
      Daily Log Sheets
    </Typography>

    {result.logs.map((log) => (
      <DailyLogSheet key={log.day} log={log} />
    ))}
  </CardContent>
</Card>
  </>
)}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default App;