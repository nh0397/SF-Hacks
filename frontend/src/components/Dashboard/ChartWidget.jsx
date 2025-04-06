import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

export default function ChartWidget({ title }) {
  return (
    <Card sx={{ bgcolor: "white", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)", padding: "20px" }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: "gray", textAlign: "center", padding: "40px 0" }}>
          [Chart Will Be Placed Here]
        </Typography>
      </CardContent>
    </Card>
  );
}
