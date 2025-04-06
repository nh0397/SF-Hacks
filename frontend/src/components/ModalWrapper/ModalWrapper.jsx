// ModalWrapper.jsx
import React from "react";
import { Modal, Button } from "@mui/material";
import "./ModalWrapper.css"; // shared styling for modals

const ModalWrapper = ({ open, title, children, onSave, onClose, saveDisabled = false }) => {
  return (
    <Modal open={open} onClose={onClose} className="modal-overlay">
      <div className="modal-container">
        <h2>{title}</h2>
        <div className="modal-content">
          {children}
        </div>
        <div className="modal-actions">
          <Button
            disabled={saveDisabled}
            variant="contained"
            onClick={onSave}
          >
            Add
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            style={{ marginLeft: "8px" }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalWrapper;