// DetectorModal.jsx
import React, { useState } from "react";
import {
  TextField,
  MenuItem,
  Chip,
  Slider,
  Box,
  Typography,
} from "@mui/material";
import ModalWrapper from "../../components/ModalWrapper/ModalWrapper";

const DetectorModal = ({ open, onClose, onSave }) => {
  const [detector_name, setName] = useState("");
  const [detector_type, setType] = useState("");
  const [regex_pattern, setRegexPattern] = useState("");
  const [regexValid, setRegexValid] = useState(true);
  // Keywords stored as an array
  const [keywords, setKeywords] = useState([]);
  // For capturing the current keyword input
  const [keywordInput, setKeywordInput] = useState("");
  const [description, setDescription] = useState("");

  // Handler for regex pattern change that validates the pattern.
  const handleRegexChange = (e) => {
    const value = e.target.value;
    setRegexPattern(value);
    try {
      new RegExp(value);
      setRegexValid(true);
    } catch (err) {
      setRegexValid(false);
    }
  };

  // When user types in the keyword input
  const handleKeywordInputChange = (e) => {
    setKeywordInput(e.target.value);
  };

  // When user presses a key in the keyword input, check if it's Enter or comma.
  const handleKeywordInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (keywordInput.trim()) {
        setKeywords((prev) => [...prev, keywordInput.trim()]);
        setKeywordInput("");
      }
    }
  };

  // On blur, if any text remains in the input, add it as a keyword.
  const handleKeywordInputBlur = () => {
    if (keywordInput.trim()) {
      setKeywords((prev) => [...prev, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  // For demonstration, show example boxes below each section.
  const renderExampleBox = () => {
    switch (detector_type) {
      case "regex":
        return (
          <Box mt={2} p={1} border="1px solid #ccc" borderRadius="4px" bgcolor="#f9f9f9">
            <Typography variant="caption" color="textSecondary">
              Example: To detect a Social Security Number, try: <code>\b\d{3}-\d{2}-\d{4}\b</code>
            </Typography>
          </Box>
        );
      case "keywords":
        return (
          <Box mt={2} p={1} border="1px solid #ccc" borderRadius="4px" bgcolor="#f9f9f9">
            <Typography variant="caption" color="textSecondary">
              Example: Enter keywords like <code>confidential, secret, sensitive</code>. They will display as chips below.
            </Typography>
          </Box>
        );
      case "ml_based":
        return (
          <Box mt={2} p={1} border="1px solid #ccc" borderRadius="4px" bgcolor="#f9f9f9" display="flex" flexDirection="column">
            <Typography variant="caption" color="textSecondary">
              Example: For training a domain-specific model, describe the use case.
            </Typography>
            <Typography variant="caption" color="textSecondary">
              For instance, "Classify documents into Finance, Healthcare, and Legal categories based on key terminology."
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  // Determine if form is valid based on selected detector_type.
  const isFormValid = () => {
    if (!detector_name.trim() || !detector_type) return false;
    if (detector_type === "regex") return regex_pattern.trim() && regexValid;
    if (detector_type === "keywords") return keywords.length > 0;
    if (detector_type === "ml_based") return description.trim();
    return true;
  };

  const addDetector = () => {
    const payload = {
      detector_name,
      detector_type,
      regex_pattern,
      keywords, // array of keywords
      description,
    };
    console.log(payload);
    onSave(payload);
  };

  return (
    <ModalWrapper
      open={open}
      title="Add New Detector"
      onSave={addDetector}
      onClose={onClose}
      saveDisabled={!isFormValid()} // Disable add/save button if form is invalid
    >
      <TextField
        label="Name"
        value={detector_name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        select
        label="Type"
        value={detector_type}
        onChange={(e) => setType(e.target.value)}
        fullWidth
        margin="normal"
        required
      >
        <MenuItem value="ml_based">ML Based</MenuItem>
        <MenuItem value="regex">Regex</MenuItem>
        <MenuItem value="keywords">Keyword based</MenuItem>
      </TextField>

      {detector_type === "regex" && (
        <>
          <TextField
            label="Regex Pattern"
            value={regex_pattern}
            onChange={handleRegexChange}
            fullWidth
            margin="normal"
            placeholder="e.g., \b\d{3}-\d{2}-\d{4}\b"
            error={!regexValid}
            helperText={!regexValid ? "Invalid regex pattern" : ""}
            required
          />
        </>
      )}

      {detector_type === "keywords" && (
        <>
          <TextField
            label="Keywords (type and press enter or comma)"
            value={keywordInput}
            onChange={handleKeywordInputChange}
            onKeyDown={handleKeywordInputKeyDown}
            onBlur={handleKeywordInputBlur}
            fullWidth
            margin="normal"
            placeholder="e.g., confidential, secret, sensitive"
            required
          />
          <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
            {keywords.map((kw, idx) => (
              <Chip key={idx} label={kw} />
            ))}
          </Box>
        </>
      )}

      {detector_type === "ml_based" && (
        <>
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            placeholder="Describe the domain or specific use case for your ML model"
            required
          />
        </>
      )}
      {renderExampleBox()}
    </ModalWrapper>
  );
};

export default DetectorModal;
