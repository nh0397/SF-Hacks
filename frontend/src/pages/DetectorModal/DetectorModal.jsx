// DetectorModal.jsx
import React, { useState } from "react";
import { TextField, MenuItem, Chip, Slider } from "@mui/material";
import ModalWrapper from "../../components/ModalWrapper/ModalWrapper";

const DetectorModal = ({ open, onClose, onSave }) => {

  const [name, setName] = useState("");
  const [type, setType] = useState("");
 
  return (
    <ModalWrapper open={open} title="Add New Detector" onSave={() => onSave({ name, type })} onClose={onClose}>
      <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth margin="normal" />
      <TextField
        select
        label="Type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        fullWidth
        margin="normal"
      >
        <MenuItem value="ML">ML Based</MenuItem>
        <MenuItem value="Regex">Regex</MenuItem>
        <MenuItem value="Keyword">Keyword based</MenuItem>
      </TextField>
      {type === "Regex" && (
        <>
          <TextField 
            label="Regex Pattern" 
            // ... add validation logic here
            fullWidth margin="normal"
          />
          {/* Additional helper text */}
        </>
      )}
      {type === "Keyword" && (
        <>
          <TextField 
            label="Keywords (comma separated)" 
            fullWidth margin="normal"
          />
          {/* Render keywords as chips */}
        </>
      )}
      {type === "ML" && (
        <>
          <TextField label="Description" fullWidth margin="normal" multiline rows={3} />
          <Slider min={0} max={100} valueLabelDisplay="auto" />
        </>
      )}
    </ModalWrapper>
  );
};

export default DetectorModal;
