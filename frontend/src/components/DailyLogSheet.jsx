// import { Box, Stack, Typography } from "@mui/material";

// const STATUS_ROWS = [
//   {
//     key: "off_duty",
//     label: "1. Off Duty",
//   },
//   {
//     key: "sleeper_berth",
//     label: "2. Sleeper Berth",
//   },
//   {
//     key: "driving",
//     label: "3. Driving",
//   },
//   {
//     key: "on_duty",
//     label: "4. On Duty (not driving)",
//   },
// ];

// const HOURS = Array.from({ length: 25 }, (_, index) => index);

// function getLeftPercent(hourDecimal) {
//   return (hourDecimal / 24) * 100;
// }

// function getWidthPercent(startDecimal, endDecimal) {
//   return ((endDecimal - startDecimal) / 24) * 100;
// }

// function formatStatus(status) {
//   return status.replaceAll("_", " ");
// }

// function DailyLogSheet({ log }) {
//   return (
//     <Box
//       sx={{
//         border: "1px solid #111827",
//         borderRadius: 2,
//         bgcolor: "#ffffff",
//         overflow: "hidden",
//         mb: 4,
//       }}
//     >
//       {/* Header */}
//       <Box
//         sx={{
//           p: 2,
//           borderBottom: "1px solid #111827",
//           display: "grid",
//           gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
//           gap: 2,
//         }}
//       >
//         <Box>
//           <Typography variant="h6" fontWeight={800}>
//             Driver&apos;s Daily Log
//           </Typography>
//           <Typography variant="body2" color="text.secondary">
//             Day {log.day} — {log.date}
//           </Typography>
//         </Box>

//         <Box>
//           <Typography variant="caption" color="text.secondary">
//             Total Miles Driving Today
//           </Typography>
//           <Typography fontWeight={700}>{log.total_miles || 0} miles</Typography>
//         </Box>

//         <Box>
//           <Typography variant="caption" color="text.secondary">
//             Total Logged Hours
//           </Typography>
//           <Typography fontWeight={700}>
//             {log.total_logged_hours || 24} hours
//           </Typography>
//         </Box>
//       </Box>

//       {/* Time header */}
//       <Box sx={{ display: "grid", gridTemplateColumns: "170px 1fr 70px" }}>
//         <Box
//           sx={{
//             bgcolor: "#111827",
//             color: "white",
//             p: 1,
//             fontSize: 12,
//             fontWeight: 700,
//           }}
//         >
//           Duty Status
//         </Box>

//         <Box
//           sx={{
//             bgcolor: "#111827",
//             color: "white",
//             position: "relative",
//             height: 38,
//             borderLeft: "1px solid #374151",
//             borderRight: "1px solid #374151",
//           }}
//         >
//           {HOURS.map((hour) => (
//             <Box
//               key={hour}
//               sx={{
//                 position: "absolute",
//                 left: `${(hour / 24) * 100}%`,
//                 transform: "translateX(-50%)",
//                 top: 5,
//                 fontSize: 10,
//                 fontWeight: 700,
//                 whiteSpace: "nowrap",
//               }}
//             >
//               {hour === 0
//                 ? "Mid"
//                 : hour === 12
//                 ? "Noon"
//                 : hour === 24
//                 ? "Mid"
//                 : hour}
//             </Box>
//           ))}
//         </Box>

//         <Box
//           sx={{
//             bgcolor: "#111827",
//             color: "white",
//             p: 1,
//             fontSize: 12,
//             fontWeight: 700,
//             textAlign: "center",
//           }}
//         >
//           Total
//         </Box>
//       </Box>

//       {/* Grid rows */}
//       <Box>
//         {STATUS_ROWS.map((row) => {
//           const rowEntries = log.entries.filter(
//             (entry) => entry.status === row.key
//           );

//           return (
//             <Box
//               key={row.key}
//               sx={{
//                 display: "grid",
//                 gridTemplateColumns: "170px 1fr 70px",
//                 minHeight: 54,
//                 borderTop: "1px solid #111827",
//               }}
//             >
//               {/* Status label */}
//               <Box
//                 sx={{
//                   p: 1,
//                   borderRight: "1px solid #111827",
//                   display: "flex",
//                   alignItems: "center",
//                   fontSize: 13,
//                   fontWeight: 700,
//                 }}
//               >
//                 {row.label}
//               </Box>

//               {/* 24-hour grid */}
//               <Box
//                 sx={{
//                   position: "relative",
//                   minHeight: 54,
//                   backgroundImage:
//                     "linear-gradient(to right, #d1d5db 1px, transparent 1px), linear-gradient(to right, #f3f4f6 1px, transparent 1px)",
//                   backgroundSize: "4.1667% 100%, 1.0417% 100%",
//                   borderRight: "1px solid #111827",
//                 }}
//               >
//                 {rowEntries.map((entry, index) => {
//                   const left = getLeftPercent(entry.start_decimal);
//                   const width = getWidthPercent(
//                     entry.start_decimal,
//                     entry.end_decimal
//                   );

//                   return (
//                     <Box
//                       key={`${row.key}-${index}`}
//                       title={`${formatStatus(entry.status)}: ${entry.start} - ${
//                         entry.end
//                       }`}
//                       sx={{
//                         position: "absolute",
//                         left: `${left}%`,
//                         top: "50%",
//                         transform: "translateY(-50%)",
//                         width: `${width}%`,
//                         height: 8,
//                         bgcolor: "#111827",
//                         borderRadius: 1,
//                       }}
//                     />
//                   );
//                 })}
//               </Box>

//               {/* Total hours */}
//               <Box
//                 sx={{
//                   p: 1,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   fontSize: 13,
//                   fontWeight: 700,
//                 }}
//               >
//                 {log.totals?.[row.key] || 0}
//               </Box>
//             </Box>
//           );
//         })}
//       </Box>

//       {/* Remarks */}
//       <Box
//         sx={{
//           borderTop: "1px solid #111827",
//           p: 2,
//         }}
//       >
//         <Typography fontWeight={800} sx={{ mb: 1 }}>
//           Remarks
//         </Typography>

//         <Stack spacing={1}>
//           {log.entries.map((entry, index) => (
//             <Box
//               key={index}
//               sx={{
//                 display: "grid",
//                 gridTemplateColumns: { xs: "1fr", md: "120px 160px 1fr" },
//                 gap: 1,
//                 p: 1,
//                 borderRadius: 1,
//                 bgcolor: "#f8fafc",
//                 border: "1px solid #e2e8f0",
//               }}
//             >
//               <Typography fontWeight={700}>
//                 {entry.start} - {entry.end}
//               </Typography>

//               <Typography sx={{ textTransform: "capitalize" }}>
//                 {formatStatus(entry.status)}
//               </Typography>

//               <Typography color="text.secondary">
//                 {entry.remarks}
//                 {entry.location ? ` — ${entry.location}` : ""}
//               </Typography>
//             </Box>
//           ))}
//         </Stack>
//       </Box>
//     </Box>
//   );
// }

// export default DailyLogSheet;















//components/DailyLogSheet.jsx
import {
  Box,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

const STATUS_ROWS = [
  {
    key: "off_duty",
    label: "1. Off Duty",
    shortLabel: "Off Duty",
  },
  {
    key: "sleeper_berth",
    label: "2. Sleeper Berth",
    shortLabel: "Sleeper",
  },
  {
    key: "driving",
    label: "3. Driving",
    shortLabel: "Driving",
  },
  {
    key: "on_duty",
    label: "4. On Duty (not driving)",
    shortLabel: "On Duty",
  },
];

const STATUS_ROW_INDEX = {
  off_duty: 0,
  sleeper_berth: 1,
  driving: 2,
  on_duty: 3,
};

const GRID_LEFT_LABEL_WIDTH = 150;
const GRID_TOTAL_WIDTH = 80;
const ROW_HEIGHT = 52;
const HEADER_HEIGHT = 34;

function parseTimeToDecimal(time) {
  if (!time) return 0;

  const [hours, minutes] = time.split(":").map(Number);
  return hours + minutes / 60;
}

function getStartDecimal(entry) {
  return typeof entry.start_decimal === "number"
    ? entry.start_decimal
    : parseTimeToDecimal(entry.start);
}

function getEndDecimal(entry) {
  return typeof entry.end_decimal === "number"
    ? entry.end_decimal
    : parseTimeToDecimal(entry.end);
}

function formatStatus(status) {
  const found = STATUS_ROWS.find((row) => row.key === status);
  return found ? found.shortLabel : status.replaceAll("_", " ");
}

function formatHours(value = 0) {
  const rounded = Math.round(value * 100) / 100;

  if (Number.isInteger(rounded)) {
    return `${rounded}`;
  }

  return `${rounded}`;
}

function buildHourLabels() {
  const labels = [];

  for (let hour = 0; hour <= 24; hour += 1) {
    if (hour === 0 || hour === 24) {
      labels.push("Mid");
    } else if (hour === 12) {
      labels.push("Noon");
    } else {
      labels.push(String(hour));
    }
  }

  return labels;
}

function DailyLogSheet({ log }) {
  const entries = log.entries || [];
  const totals = log.totals || {};

  const totalLoggedHours =
    log.total_logged_hours ||
    Object.values(totals).reduce((sum, value) => sum + Number(value || 0), 0);

  const hourLabels = buildHourLabels();

  const sortedEntries = [...entries].sort(
    (a, b) => getStartDecimal(a) - getStartDecimal(b)
  );

  const connectors = sortedEntries
    .map((entry, index) => {
      const nextEntry = sortedEntries[index + 1];

      if (!nextEntry) return null;

      const currentRow = STATUS_ROW_INDEX[entry.status];
      const nextRow = STATUS_ROW_INDEX[nextEntry.status];

      if (currentRow === undefined || nextRow === undefined) return null;
      if (currentRow === nextRow) return null;

      const end = getEndDecimal(entry);
      const nextStart = getStartDecimal(nextEntry);

      if (Math.abs(end - nextStart) > 0.05) return null;

      return {
        time: end,
        fromRow: currentRow,
        toRow: nextRow,
      };
    })
    .filter(Boolean);

  return (
    <Box
      sx={{
        mb: 4,
        border: "1px solid #111827",
        borderRadius: 2,
        bgcolor: "#ffffff",
        overflow: "hidden",
        pageBreakInside: "avoid",
      }}
    >
      {/* Top Paper Log Header */}
      <Box sx={{ p: 2.5 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Driver&apos;s Daily Log
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {log.date || `Day ${log.day}`} — 24 Hours
            </Typography>
          </Box>

          <Box textAlign={{ xs: "left", md: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Total Miles Driving Today
            </Typography>
            <Typography fontWeight={800}>
              {formatHours(log.total_miles || 0)} miles
            </Typography>
          </Box>

          <Box textAlign={{ xs: "left", md: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Total Logged Hours
            </Typography>
            <Typography fontWeight={800}>
              {formatHours(totalLoggedHours)} hours
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            mt: 2,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            gap: 1.5,
          }}
        >
          <Box sx={fieldBoxStyle}>
            <Typography variant="caption">From</Typography>
            <Typography fontWeight={700}>
              {entries[0]?.location || "Trip start"}
            </Typography>
          </Box>

          <Box sx={fieldBoxStyle}>
            <Typography variant="caption">To</Typography>
            <Typography fontWeight={700}>
              {entries[entries.length - 1]?.location || "Trip end"}
            </Typography>
          </Box>

          <Box sx={fieldBoxStyle}>
            <Typography variant="caption">Carrier / Vehicle</Typography>
            <Typography fontWeight={700}>FleetRoute Demo Carrier</Typography>
          </Box>
        </Box>
      </Box>

      {/* Grid Header */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `${GRID_LEFT_LABEL_WIDTH}px 1fr ${GRID_TOTAL_WIDTH}px`,
          bgcolor: "#111827",
          color: "#ffffff",
          minHeight: HEADER_HEIGHT,
        }}
      >
        <Box sx={headerCellStyle}>Duty Status</Box>

        <Box
          sx={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "repeat(24, 1fr)",
            borderLeft: "1px solid #374151",
            borderRight: "1px solid #374151",
          }}
        >
          {hourLabels.slice(0, 24).map((label, index) => (
            <Box
              key={`${label}-${index}`}
              sx={{
                fontSize: index === 12 ? 9 : 10,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRight: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              {label}
            </Box>
          ))}
        </Box>

        <Box sx={headerCellStyle}>Total</Box>
      </Box>

      {/* Graph Grid */}
      <Box sx={{ position: "relative" }}>
        {STATUS_ROWS.map((row) => {
          const rowEntries = sortedEntries.filter(
            (entry) => entry.status === row.key
          );

          return (
            <Box
              key={row.key}
              sx={{
                display: "grid",
                gridTemplateColumns: `${GRID_LEFT_LABEL_WIDTH}px 1fr ${GRID_TOTAL_WIDTH}px`,
                minHeight: ROW_HEIGHT,
                borderBottom: "1px solid #111827",
              }}
            >
              <Box sx={statusLabelStyle}>
                <Typography fontWeight={800} fontSize={12}>
                  {row.label}
                </Typography>
              </Box>

              <Box sx={gridCellStyle}>
                {rowEntries.map((entry, index) => {
                  const start = getStartDecimal(entry);
                  const end = getEndDecimal(entry);
                  const width = Math.max(end - start, 0) / 24 * 100;
                  const left = start / 24 * 100;

                  return (
                    <Box
                      key={`${row.key}-${index}-${entry.start}-${entry.end}`}
                      title={`${formatStatus(entry.status)} ${entry.start} - ${
                        entry.end
                      }`}
                      sx={{
                        position: "absolute",
                        left: `${left}%`,
                        width: `${width}%`,
                        top: "50%",
                        transform: "translateY(-50%)",
                        height: 6,
                        borderRadius: 10,
                        bgcolor: "#111827",
                        zIndex: 3,
                      }}
                    />
                  );
                })}
              </Box>

              <Box sx={totalCellStyle}>
                {formatHours(totals[row.key] || 0)}
              </Box>
            </Box>
          );
        })}

        {/* Vertical connectors between duty status changes */}
        {connectors.map((connector, index) => {
          const left = connector.time / 24 * 100;
          const topRow = Math.min(connector.fromRow, connector.toRow);
          const bottomRow = Math.max(connector.fromRow, connector.toRow);

          const top =
            topRow * ROW_HEIGHT + ROW_HEIGHT / 2;
          const height =
            (bottomRow - topRow) * ROW_HEIGHT;

          return (
            <Box
              key={`connector-${index}`}
              sx={{
                position: "absolute",
                left: `calc(${GRID_LEFT_LABEL_WIDTH}px + ${left}% - 1px)`,
                top,
                width: 2,
                height,
                bgcolor: "#111827",
                zIndex: 2,
              }}
            />
          );
        })}
      </Box>

      {/* Bottom Totals */}
      <Box
        sx={{
          p: 2,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(5, 1fr)" },
          gap: 1,
          bgcolor: "#f8fafc",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Chip
          label={`Off Duty: ${formatHours(totals.off_duty || 0)}h`}
          variant="outlined"
        />
        <Chip
          label={`Sleeper: ${formatHours(totals.sleeper_berth || 0)}h`}
          variant="outlined"
        />
        <Chip
          label={`Driving: ${formatHours(totals.driving || 0)}h`}
          variant="outlined"
        />
        <Chip
          label={`On Duty: ${formatHours(totals.on_duty || 0)}h`}
          variant="outlined"
        />
        <Chip
          label={`Total: ${formatHours(totalLoggedHours)}h`}
          color={Math.abs(totalLoggedHours - 24) < 0.01 ? "success" : "warning"}
        />
      </Box>

      {/* Remarks */}
      <Box sx={{ p: 2.5 }}>
        <Typography fontWeight={800} textAlign="center" sx={{ mb: 1.5 }}>
          Remarks
        </Typography>

        <Stack spacing={1}>
          {sortedEntries.map((entry, index) => (
            <Box
              key={`remark-${index}`}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "140px 140px 1fr" },
                gap: 1,
                p: 1.2,
                borderRadius: 1,
                border: "1px solid #dbe4ee",
                bgcolor: "#f8fafc",
              }}
            >
              <Typography fontWeight={700}>
                {entry.start} - {entry.end}
              </Typography>

              <Typography>{formatStatus(entry.status)}</Typography>

              <Typography>
                {entry.remarks}
                {entry.location ? ` — ${entry.location}` : ""}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      <Divider />

      {/* Certification line */}
      <Box
        sx={{
          p: 2,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            Driver Certification
          </Typography>
          <Typography fontWeight={700}>
            I certify these entries are true and correct.
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Signature
          </Typography>
          <Box
            sx={{
              mt: 1,
              height: 28,
              borderBottom: "1px solid #111827",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

const fieldBoxStyle = {
  border: "1px solid #d1d5db",
  borderRadius: 1,
  p: 1,
  minHeight: 56,
  bgcolor: "#f9fafb",
};

const headerCellStyle = {
  fontSize: 11,
  fontWeight: 900,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  px: 1,
};

const statusLabelStyle = {
  p: 1,
  display: "flex",
  alignItems: "center",
  borderRight: "1px solid #111827",
};

const totalCellStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  fontSize: 13,
  borderLeft: "1px solid #111827",
};

const gridCellStyle = {
  position: "relative",
  minHeight: ROW_HEIGHT,
  backgroundImage: `
    repeating-linear-gradient(
      to right,
      #cbd5e1 0,
      #cbd5e1 1px,
      transparent 1px,
      transparent calc(100% / 96)
    ),
    repeating-linear-gradient(
      to right,
      #64748b 0,
      #64748b 1px,
      transparent 1px,
      transparent calc(100% / 24)
    )
  `,
  backgroundSize: "100% 100%",
};

export default DailyLogSheet;