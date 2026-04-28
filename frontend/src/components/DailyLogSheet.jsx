import { Box, Chip, Divider, Stack, Typography } from "@mui/material";

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
const GRID_TOTAL_WIDTH = 86;
const ROW_HEIGHT = 54;
const HEADER_HEIGHT = 34;

const INK = "#111827";
const GRID_MINOR = "#d7e3f0";
const GRID_MAJOR = "#8ca3bf";
const LOG_LINE_WIDTH = 5;
const LOG_LINE_JOIN_OVERLAP = 3;

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
    } else if (hour > 12) {
      labels.push(String(hour - 12));
    } else {
      labels.push(String(hour));
    }
  }

  return labels;
}

function DailyLogSheet({ log }) {
  const entries = log.entries || [];
  const totals = log.totals || {};
  const logDetails = log.log_details || {};

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
      width: "100%",
      overflowX: { xs: "auto", md: "visible" },
      overflowY: "hidden",
      WebkitOverflowScrolling: "touch",
      pb: { xs: 1, md: 0 },
    }}
  >
    <Box
      sx={{
        mb: 4,
        width: { xs: 820, md: "100%" },
        minWidth: { xs: 820, md: "auto" },
        border: `2px solid ${INK}`,
        borderRadius: 2,
        bgcolor: "#ffffff",
        overflow: "hidden",
        pageBreakInside: "avoid",
        textAlign: "left",
        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
      }}
    >
      {/* Top Paper Log Header */}
      <Box sx={{ p: 2.25 }}>
       <Stack
  direction={{ xs: "column", md: "row" }}
  alignItems={{ xs: "flex-start", md: "flex-start" }}
  sx={{ width: "100%" }}
>
  {/* Left side */}
  <Box sx={{ textAlign: "left" }}>
    <Typography
      variant="h6"
      fontWeight={900}
      sx={{
        lineHeight: 1.1,
        color: INK,
        letterSpacing: "-0.02em",
      }}
    >
      Driver&apos;s Daily Log
    </Typography>

    <Typography
      variant="body2"
      sx={{
        mt: 0.5,
        color: "#374151",
        fontWeight: 700,
      }}
    >
      {log.date || `Day ${log.day}`} — 24 Hours
    </Typography>
  </Box>

  {/* Right side */}
  <Stack
    direction="row"
    spacing={4}
    sx={{
      ml: { md: "auto" },
      mt: { xs: 1.5, md: 0 },
      textAlign: "left",
    }}
  >
    <Box>
      <Typography sx={smallHeaderLabelStyle}>
        Total Miles Driving Today
      </Typography>
      <Typography sx={smallHeaderValueStyle}>
        {formatHours(log.total_miles || 0)} miles
      </Typography>
    </Box>

    <Box>
      <Typography sx={smallHeaderLabelStyle}>
        Total Logged Hours
      </Typography>
      <Typography sx={smallHeaderValueStyle}>
        {formatHours(totalLoggedHours)} hours
      </Typography>
    </Box>
  </Stack>
</Stack>

        <Box
          sx={{
            mt: 2,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1.2,
          }}
        >
          <Box sx={fieldBoxStyle}>
            <Typography sx={fieldLabelStyle}>From</Typography>
            <Typography sx={fieldValueStyle}>
              {entries[0]?.location || "Trip start"}
            </Typography>
          </Box>

          <Box sx={fieldBoxStyle}>
            <Typography sx={fieldLabelStyle}>To</Typography>
            <Typography sx={fieldValueStyle}>
              {entries[entries.length - 1]?.location || "Trip end"}
            </Typography>
          </Box>

          <Box sx={fieldBoxStyle}>
            <Typography sx={fieldLabelStyle}>Carrier</Typography>
            <Typography sx={fieldValueStyle}>
              {logDetails.carrier_name || "FleetRoute Demo Carrier"}
            </Typography>
          </Box>

          <Box sx={fieldBoxStyle}>
            <Typography sx={fieldLabelStyle}>Driver</Typography>
            <Typography sx={fieldValueStyle}>
              {logDetails.driver_name || "N/A"}
            </Typography>
          </Box>

          <Box sx={fieldBoxStyle}>
            <Typography sx={fieldLabelStyle}>Vehicle / Trailer</Typography>
            <Typography sx={fieldValueStyle}>
              {(logDetails.vehicle_number || "N/A") +
                " / " +
                (logDetails.trailer_number || "N/A")}
            </Typography>
          </Box>

          <Box sx={fieldBoxStyle}>
            <Typography sx={fieldLabelStyle}>Shipping / Commodity</Typography>
            <Typography sx={fieldValueStyle}>
              {(logDetails.shipping_document_number || "N/A") +
                " / " +
                (logDetails.commodity || "N/A")}
            </Typography>
          </Box>

          <Box sx={fieldBoxStyle}>
            <Typography sx={fieldLabelStyle}>Shipper</Typography>
            <Typography sx={fieldValueStyle}>
              {logDetails.shipper_name || "N/A"}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Grid Header */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `${GRID_LEFT_LABEL_WIDTH}px 1fr ${GRID_TOTAL_WIDTH}px`,
          bgcolor: INK,
          color: "#ffffff",
          minHeight: HEADER_HEIGHT,
          borderTop: `2px solid ${INK}`,
        }}
      >
        <Box sx={headerCellStyle}>Duty Status</Box>

        <Box
          sx={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "repeat(24, 1fr)",
            borderLeft: "1px solid rgba(255,255,255,0.35)",
            borderRight: "1px solid rgba(255,255,255,0.35)",
          }}
        >
          {hourLabels.slice(0, 24).map((label, index) => (
            <Box
              key={`${label}-${index}`}
              sx={{
                fontSize: index === 0 || index === 12 ? 9 : 10,
                fontWeight: 900,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRight: "1px solid rgba(255,255,255,0.22)",
                letterSpacing: "-0.01em",
              }}
            >
              {label}
            </Box>
          ))}
        </Box>

        <Box sx={headerCellStyle}>Total</Box>
      </Box>

      {/* Graph Grid */}
      <Box sx={{ position: "relative", }}>
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
  height: ROW_HEIGHT,
  boxSizing: "border-box",
  borderBottom: `1.5px solid ${INK}`,
  bgcolor: "#ffffff",
}}
            >
              <Box sx={statusLabelStyle}>
                <Typography
                  fontWeight={900}
                  fontSize={13}
                  sx={{
                    color: INK,
                    lineHeight: 1.25,
                  }}
                >
                  {row.label}
                </Typography>
              </Box>

              <Box sx={gridCellStyle}>
                {rowEntries.map((entry, index) => {
                  const start = getStartDecimal(entry);
                  const end = getEndDecimal(entry);
                  const width = (Math.max(end - start, 0) / 24) * 100;
                  const left = (start / 24) * 100;
                  const endLeft = left + width;

                  return (
                    <Box
                      key={`${row.key}-${index}-${entry.start}-${entry.end}`}
                      title={`${formatStatus(entry.status)} ${entry.start} - ${
                        entry.end
                      }`}
                    >
                      {/* Horizontal duty status line */}
                      <Box
                      sx={{
                        position: "absolute",
                        left: `calc(${left}% - ${LOG_LINE_JOIN_OVERLAP}px)`,
                        width: `calc(${width}% + ${LOG_LINE_JOIN_OVERLAP * 2}px)`,
                        top: "50%",
                        transform: "translateY(-50%)",
                        height: LOG_LINE_WIDTH,
                        borderRadius: 0,
                        bgcolor: INK,
                        zIndex: 4,
                      }}
                      />

                      
                    </Box>
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
        <Box
          sx={{
            position: "absolute",
            left: `${GRID_LEFT_LABEL_WIDTH}px`,
            right: `${GRID_TOTAL_WIDTH}px`,
            top: 0,
            bottom: 0,
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          {connectors.map((connector, index) => {
            const left = (connector.time / 24) * 100;
            const topRow = Math.min(connector.fromRow, connector.toRow);
            const bottomRow = Math.max(connector.fromRow, connector.toRow);

            const top = topRow * ROW_HEIGHT + ROW_HEIGHT / 2;
            const height = (bottomRow - topRow) * ROW_HEIGHT;

            return (
              <Box
                key={`connector-${index}`}
                sx={{
                  position: "absolute",
                  left: `${left}%`,
                  top,
                  width: LOG_LINE_WIDTH,
                  height,
                  bgcolor: INK,
                  transform: `translateX(-${LOG_LINE_WIDTH / 2}px)`,
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Bottom Totals */}
      <Box
        sx={{
          px: 1.5,
          py: 1.25,
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 1,
          bgcolor: "#f8fafc",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Chip
          label={`Off Duty: ${formatHours(totals.off_duty || 0)}h`}
          variant="outlined"
          sx={totalChipStyle}
        />
        <Chip
          label={`Sleeper: ${formatHours(totals.sleeper_berth || 0)}h`}
          variant="outlined"
          sx={totalChipStyle}
        />
        <Chip
          label={`Driving: ${formatHours(totals.driving || 0)}h`}
          variant="outlined"
          sx={totalChipStyle}
        />
        <Chip
          label={`On Duty: ${formatHours(totals.on_duty || 0)}h`}
          variant="outlined"
          sx={totalChipStyle}
        />
        <Chip
          label={`Total: ${formatHours(totalLoggedHours)}h`}
          color={Math.abs(totalLoggedHours - 24) < 0.01 ? "success" : "warning"}
          sx={{
            ...totalChipStyle,
            fontWeight: 900,
            
          }}
        />
      </Box>

      {/* Remarks */}
      <Box sx={{ p: 2 }}>
        <Typography
          fontWeight={900}
          textAlign="center"
          sx={{
            mb: 1.25,
            color: INK,
            letterSpacing: "0.02em",
          }}
        >
          Remarks
        </Typography>

        <Stack spacing={0.75}>
          {sortedEntries.map((entry, index) => (
            <Box
              key={`remark-${index}`}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "130px 115px 1fr" },
                gap: 1,
                px: 1.25,
                py: 0.85,
                borderRadius: 1,
                border: "1px solid #dbe4ee",
                bgcolor: "#f8fafc",
                alignItems: "center",
              }}
            >
              <Typography fontWeight={900} fontSize={13}>
                {entry.start} - {entry.end}
              </Typography>

              <Typography fontWeight={800} fontSize={13}>
                {formatStatus(entry.status)}
              </Typography>

              <Typography fontSize={13} color="#111827">
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
          bgcolor: "#ffffff",
        }}
      >
        <Box textAlign="center">
          <Typography sx={fieldLabelStyle}>Driver Certification</Typography>
          <Typography fontWeight={800} fontSize={13}>
            I certify these entries are true and correct.
          </Typography>
        </Box>

        <Box>
          <Typography sx={fieldLabelStyle}>Signature</Typography>
          <Box
            sx={{
              mt: 1,
              height: 26,
              borderBottom: `2px solid ${INK}`,
            }}
          />
        </Box>
      </Box>
        </Box>
  </Box>
  );
}

const smallHeaderLabelStyle = {
  display: "block",
  fontSize: 11,
  lineHeight: 1.1,
  color: "#374151",
  fontWeight: 600,
};

const smallHeaderValueStyle = {
  mt: 0.3,
  fontSize: 14,
  color: INK,
  fontWeight: 600,
};

const fieldBoxStyle = {
  border: "1px solid #cfd8e3",
  borderRadius: 1,
  p: 1,
  minHeight: 54,
  bgcolor: "#f9fafb",
  textAlign: "center",

  // add these
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const fieldLabelStyle = {
  display: "block",
  fontSize: 10,
  lineHeight: 1.1,
  color: "#374151",
  fontWeight: 600,
};

const fieldValueStyle = {
  mt: 0.45,
  fontSize: 14,
  color: INK,
  fontWeight: 700,
  lineHeight: 1.25,
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
  px: 2,
  py: 1,
  height: "100%",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  textAlign: "left",
  borderRight: `2px solid ${INK}`,
  bgcolor: "#ffffff",
};

const totalCellStyle = {
  height: "100%",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  fontWeight: 900,
  fontSize: 13,
  borderLeft: `2px solid ${INK}`,
  bgcolor: "#ffffff",
  color: INK,
  zIndex: 6,
};

const gridCellStyle = {
  position: "relative",
  height: "100%",
  overflow: "hidden",
  boxSizing: "border-box",
  backgroundImage: `
    repeating-linear-gradient(
      to right,
      ${GRID_MINOR} 0,
      ${GRID_MINOR} 1px,
      transparent 1px,
      transparent calc(100% / 96)
    ),
    repeating-linear-gradient(
      to right,
      ${GRID_MAJOR} 0,
      ${GRID_MAJOR} 1px,
      transparent 1px,
      transparent calc(100% / 24)
    )
  `,
  backgroundSize: "100% 100%",
};

const totalChipStyle = {
  height: 33,
  fontSize: 12,
  fontWeight: 800,
};

export default DailyLogSheet;