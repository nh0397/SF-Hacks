// PolicyModal.jsx
import React, { useState, useEffect } from "react";
import { TextField, MenuItem, Switch, FormControlLabel, Box, Select, FormControl, InputLabel } from "@mui/material";
import ModalWrapper from "../../components/ModalWrapper/ModalWrapper";

const PolicyModal = ({ open, onClose, onSave, detectors, onUpdate, isValid }) => {
  const [policy_name, setName] = useState("");
  const [description, setDescription] = useState("");
  // Using array of detector names for selected detectors
  const [selectedDetectors, setSelectedDetectors] = useState([]);
  // Add threshold state for each detector
  const [thresholds, setThresholds] = useState({});
  // Add action state
  const [action, setAction] = useState("Audit");
  // Add selected users/groups state
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Static user groups
  const userGroups = [
    "securealley@all",
    "securealley@frontend",
    "securealley@backend",
    "securealley@admins",
    "securealley@management"
  ];

  // Compile form data for validation and saving
  const formData = {
    policy_name,
    description,
    detectors: selectedDetectors,
    thresholds,
    action,
    users: selectedUsers
  };

  // Update parent component with form data for validation
  useEffect(() => {
    if (onUpdate) {
      onUpdate(formData);
    }
  }, [policy_name, description, selectedDetectors, thresholds, action, selectedUsers]);

  // Reset form when modal is closed
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

  // Handler for when a detector is chosen from the select dropdown
  const handleDetectorChange = (e) => {
    const { value } = e.target;
    // Since value is an array in multiple mode, we update our state accordingly
    const newSelectedDetectors = typeof value === "string" ? value.split(",") : value;
    setSelectedDetectors(newSelectedDetectors);

    // Initialize thresholds for newly selected detectors
    const newThresholds = { ...thresholds };
    newSelectedDetectors.forEach(detector => {
      if (!newThresholds[detector]) {
        newThresholds[detector] = 1;
      }
    });
    setThresholds(newThresholds);
  };

  // Handler to remove a selected detector
  const handleDeleteDetector = (detectorName) => {
    setSelectedDetectors(selectedDetectors.filter((name) => name !== detectorName));

    // Remove threshold for deleted detector
    const newThresholds = { ...thresholds };
    delete newThresholds[detectorName];
    setThresholds(newThresholds);
  };

  // Handler for threshold changes
  const handleThresholdChange = (detector, value) => {
    setThresholds({
      ...thresholds,
      [detector]: value
    });
  };

  // Handler for user/group selection
  const handleUserGroupChange = (e) => {
    const { value } = e.target;
    setSelectedUsers(typeof value === "string" ? value.split(",") : value);
  };

  // Save handler with console logging
  const handleSave = () => {
    // Log the form data
    console.log("Form data to be saved:", formData);

    // Call the parent's save handler
    onSave(formData);
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
        label="Name"
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
        {detectors.map((detector) => (
          <MenuItem key={detector.id} value={detector.detector_name}>
            {detector.detector_name}
          </MenuItem>
        ))}
      </TextField>

      {/* Threshold input fields for selected detectors */}
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

      {/* Action selection */}
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

      {/* User/User Group selection */}
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
            checked={true} // Dummy default
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