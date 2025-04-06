import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#0047AB" }, // Secure Alley Blue
    secondary: { main: "#4A4A4A" }, // Secure Alley Gray
    background: { default: "#F5F5F5" },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
});

export default theme;
