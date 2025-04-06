// src/pages/PolicyModal/PolicyModal.jsx
import React, { useState, useEffect } from "react";
import { TextField, MenuItem, Switch, FormControlLabel, Box, Select, FormControl, InputLabel } from "@mui/material";
import ModalWrapper from "../../components/ModalWrapper/ModalWrapper";

const PolicyModal = ({ open, onClose, onSave, detectors, onUpdate, isValid }) => {
  const [policy_name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDetectors, setSelectedDetectors] = useState([]);
  const [thresholds, setThresholds] = useState({});
  const [action, setAction] = useState("Audit");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const userGroups = [
    "securealley@all",
    "securealley@frontend",
    "securealley@backend",
    "securealley@admins",
    "securealley@management"
  ];

  // Save handler captures the current state
  const handleSave = () => {
    const currentFormData = {
      policy_name,
      description,
      detectors: selectedDetectors,
      thresholds,
      action,
      users: selectedUsers
    };
    console.log("Form data to be saved:", currentFormData);
    onSave(currentFormData);
  };

  useEffect(() => {
    if (onUpdate) {
      const currentFormData = {
        policy_name,
        description,
        detectors: selectedDetectors,
        thresholds,
        action,
        users: selectedUsers
      };
      onUpdate(currentFormData);
    }
  }, [policy_name, description, selectedDetectors, thresholds, action, selectedUsers]);

  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setSelectedDetectors([]);
      setThresholds({});
      setAction("Audit");
      setSelectedUsers([]);
    }
  }, [open]);

  const handleDetectorChange = (e) => {
    const { value } = e.target;
    const newSelectedDetectors = typeof value === "string" ? value.split(",") : value;
    setSelectedDetectors(newSelectedDetectors);
    const newThresholds = { ...thresholds };
    newSelectedDetectors.forEach(detector => {
      if (!newThresholds[detector]) {
        newThresholds[detector] = 1;
      }
    });
    setThresholds(newThresholds);
  };

  const handleThresholdChange = (detector, value) => {
    setThresholds({
      ...thresholds,
      [detector]: value
    });
  };

  const handleUserGroupChange = (e) => {
    const { value } = e.target;
    setSelectedUsers(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <ModalWrapper
      open={open}
      title="Add New Policy"
      onSave={handleSave}
      onClose={onClose}
      saveDisabled={!isValid}
    >
      <TextField
        label="Policy Name"
        value={policy_name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        margin="normal"
        multiline
        rows={3}
        required
      />
      <TextField
        select
        label="Select Detectors"
        value={selectedDetectors}
        onChange={handleDetectorChange}
        fullWidth
        margin="normal"
        required
        SelectProps={{
          multiple: true,
          renderValue: (selected) => selected.join(", "),
        }}
      >
        {detectors.map((detector, index) => (
          <MenuItem key={detector.id || detector.detector_name || index} value={detector.detector_name}>
            {detector.detector_name}
          </MenuItem>
        ))}
      </TextField>
      {selectedDetectors.length > 0 && (
        <Box
          sx={{
            mt: 3,
            maxHeight: "100px",
            overflowY: "auto",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            p: 2
          }}
        >
          <strong>Detector Thresholds:</strong>
          {selectedDetectors.map((detector) => (
            <Box key={detector} sx={{ mt: 2 }}>
              <TextField
                label={`${detector} Threshold`}
                type="number"
                value={thresholds[detector] || 1}
                onChange={(e) => handleThresholdChange(detector, Math.max(1, parseInt(e.target.value) || 1))}
                fullWidth
                size="small"
                required
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Box>
          ))}
        </Box>
      )}
      <FormControl fullWidth margin="normal" required>
        <InputLabel>Policy Action</InputLabel>
        <Select
          value={action}
          label="Policy Action"
          onChange={(e) => setAction(e.target.value)}
        >
          <MenuItem value="Audit">Audit</MenuItem>
          <MenuItem value="Block">Block</MenuItem>
          <MenuItem value="Mask">Mask</MenuItem>
        </Select>
      </FormControl>
      <TextField
        select
        label="Select Users/Groups"
        value={selectedUsers}
        onChange={handleUserGroupChange}
        fullWidth
        margin="normal"
        required
        SelectProps={{
          multiple: true,
          renderValue: (selected) => selected.join(", "),
        }}
      >
        {userGroups.map((group) => (
          <MenuItem key={group} value={group}>
            {group}
          </MenuItem>
        ))}
      </TextField>
      <FormControlLabel
        control={
          <Switch
            checked={true}
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