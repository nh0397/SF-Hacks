import React from "react";
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

export default function RecentOrders() {
  const orders = [
    { id: "A01BC017", name: "Cameron Williamson", product: "Clip-Product 1203-62", amount: "$3,652.32", status: "Complete" },
    { id: "A01BC081", name: "Darlene Robertson", product: "Clip-Product 1203-62", amount: "$3,652.32", status: "Cancelled" },
  ];

  return (
    <Card sx={{ bgcolor: "white", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)", padding: "20px" }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "10px" }}>Recent Orders</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order, index) => (
                <TableRow key={index}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.name}</TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell>{order.amount}</TableCell>
                  <TableCell>{order.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
