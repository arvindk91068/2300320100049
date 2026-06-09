import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Box,
  TextField,
} from "@mui/material";

const API_URL =
  "http://4.224.186.213/evaluation-service/notifications";

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhcnZpbmQuMjNiMDEwMTIxM0BhYmVzLmFjLmluIiwiZXhwIjoxNzgwOTg2NzQ4LCJpYXQiOjE3ODA5ODU4NDgsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiIzMmI0Nzg3MS00ZDY2LTQ1ZGYtOWI0OC0wYTg2YTkyNTk5MTciLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJhcnZpbmQga3VtYXIiLCJzdWIiOiI1MWFkYzA2Yy1lODZhLTRkMDQtYWViMy0wYzQ4MzU3OWJkM2YifSwiZW1haWwiOiJhcnZpbmQuMjNiMDEwMTIxM0BhYmVzLmFjLmluIiwibmFtZSI6ImFydmluZCBrdW1hciIsInJvbGxObyI6IjIzMDAzMjAxMDAwNDkiLCJhY2Nlc3NDb2RlIjoiY1h1cWh0IiwiY2xpZW50SUQiOiI1MWFkYzA2Yy1lODZhLTRkMDQtYWViMy0wYzQ4MzU3OWJkM2YiLCJjbGllbnRTZWNyZXQiOiJIcFlUQ0hnakRhbUZDZ056In0.GhFKt57U_EIZ5YQ5n7lGe06afxfxbG2WJNTMa1Nt_KE";

function App() {
  const [notifications, setNotifications] = useState([]);
  const [type, setType] = useState("All");
  const [limit, setLimit] = useState(5);
  const [viewedIds, setViewedIds] = useState([]);
  const [page, setPage] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      let url = `${API_URL}?limit=100&page=1`;

      if (type !== "All") {
        url += `&notification_type=${type}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      console.log(data);

      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [type]);

  const markAsViewed = (id) => {
    if (!viewedIds.includes(id)) {
      setViewedIds([...viewedIds, id]);
    }
  };

  const getPriority = (notificationType) => {
    if (notificationType === "Placement") return 1;
    if (notificationType === "Result") return 2;
    if (notificationType === "Event") return 3;
    return 4;
  };

  const priorityNotifications = [...notifications].sort((a, b) => {
    const p1 = getPriority(a.Type);
    const p2 = getPriority(b.Type);

    if (p1 !== p2) return p1 - p2;

    return new Date(b.Timestamp) - new Date(a.Timestamp);
  });

  const displayNotifications =
    page === "priority"
      ? priorityNotifications.slice(0, limit)
      : notifications;

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            Campus Notifications
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 3 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Button
            variant={page === "all" ? "contained" : "outlined"}
            onClick={() => setPage("all")}
          >
            All Notifications
          </Button>

          <Button
            variant={page === "priority" ? "contained" : "outlined"}
            onClick={() => setPage("priority")}
          >
            Priority Notifications
          </Button>

          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Type</InputLabel>

            <Select
              value={type}
              label="Type"
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="Result">Result</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
            </Select>
          </FormControl>

          {page === "priority" && (
            <TextField
              type="number"
              label="Top N"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            />
          )}
        </Stack>

        {loading && <CircularProgress />}

        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        {displayNotifications.map((item) => {
          const viewed = viewedIds.includes(item.ID);

          return (
            <Card
              key={item.ID}
              sx={{
                mb: 2,
                borderLeft: viewed
                  ? "6px solid gray"
                  : "6px solid green",
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Chip label={item.Type} color="primary" />

                  <Chip
                    label={viewed ? "Viewed" : "New"}
                    color={viewed ? "default" : "success"}
                  />
                </Stack>

                <Typography variant="h6">
                  {item.Message}
                </Typography>

                <Typography variant="body2">
                  {item.Timestamp}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => markAsViewed(item.ID)}
                  >
                    Mark as Viewed
                  </Button>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Container>
    </>
  );
}

export default App;