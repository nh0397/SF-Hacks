// PolicyModal.jsx
import React, { useState } from "react";
import { TextField, MenuItem, Switch, FormControlLabel, Chip, Box } from "@mui/material";
import ModalWrapper from "../../components/ModalWrapper/ModalWrapper";

const PolicyModal = ({ open, onClose, onSave, detectors }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  // Using array of detector names for selected detectors
  const [selectedDetectors, setSelectedDetectors] = useState([]);

  // Handler for when a detector is chosen from the select dropdown
  const handleDetectorChange = (e) => {
    const { value } = e.target;
    // Since value is an array in multiple mode, we update our state accordingly
    setSelectedDetectors(typeof value === "string" ? value.split(",") : value);
  };

  // Handler to remove a selected detector chip
  const handleDeleteDetector = (detectorName) => {
    setSelectedDetectors(selectedDetectors.filter((name) => name !== detectorName));
  };

  return (
    <ModalWrapper
      open={open}
      title="Add New Policy"
      onSave={() => onSave({ name, description, detectors: selectedDetectors })}
      onClose={onClose}
    >
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        margin="normal"
        multiline
        rows={3}
      />
      <TextField
        select
        label="Select Detectors"
        value={selectedDetectors}
        onChange={handleDetectorChange}
        fullWidth
        margin="normal"
        SelectProps={{
          multiple: true,
          renderValue: (selected) => selected.join(", "),
        }}
      >
        {detectors.map((detector) => (
          <MenuItem key={detector.id} value={detector.name}>
            {detector.name}
          </MenuItem>
        ))}
      </TextField>
      
      {/* Render selected detectors as chips with a delete (cross) icon */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
        {selectedDetectors.map((detector, index) => (
          <Chip
            key={index}
            label={detector}
            onDelete={() => handleDeleteDetector(detector)}
          />
        ))}
      </Box>
      
      {/* Additional dummy sections to represent other steps from the Microsoft Purview pipeline */}
      
      {/* 1. Detector Information Details */}
      <Box sx={{ mt: 3 }}>
        <strong>Detector Information:</strong>
        <Box sx={{ fontSize: 14, color: "#6b7280", mt: 1 }}>
          {/* Dummy text – replace with actual detector details if needed */}
          Selected detectors will be used to monitor sensitive data and are critical for DLP policy execution.
        </Box>
      </Box>
      
      {/* 2. Distribution List Data */}
      <Box sx={{ mt: 3 }}>
        <strong>Distribution List:</strong>
        <Box sx={{ fontSize: 14, color: "#6b7280", mt: 1 }}>
          {/* Dummy placeholder – later you can implement a dropdown or multi-select for distribution lists */}
          [Distribution list functionality coming soon...]
        </Box>
      </Box>
      
      {/* 3. Additional Steps (e.g., Testing Mode, Enforcement Mode, etc.) */}
      <Box sx={{ mt: 3 }}>
        <strong>Policy Configuration:</strong>
        <Box sx={{ fontSize: 14, color: "#6b7280", mt: 1 }}>
          {/* You can add additional inputs here like a toggle for "Test Mode" vs "Enforce Mode", thresholds, notifications, etc. */}
          Additional policy configuration options will be available in future updates.
        </Box>
      </Box>
      
      <FormControlLabel
        control={
          <Switch 
            checked={true} // Dummy default
            // Add an onChange handler if you wish to capture active/inactive state
            color="primary"
          />
        }
        label="Active"
        style={{ marginTop: '16px' }}
      />
    </ModalWrapper>
  );
};

export default PolicyModal;
