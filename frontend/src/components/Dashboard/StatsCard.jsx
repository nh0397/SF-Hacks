import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

export default function StatsCard({ title, value, percentage }) {
  return (
    <Card sx={{ bgcolor: "white", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)", padding: "20px" }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ color: "gray" }}>{title}</Typography>
        <Typography variant="h5" sx={{ fontWeight: "bold", margin: "10px 0" }}>{value}</Typography>
        <Typography variant="body2" sx={{ color: percentage.includes("+") ? "green" : "red" }}>
          {percentage}
        </Typography>
      </CardContent>
    </Card>
  );
}
