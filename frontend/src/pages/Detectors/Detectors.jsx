import React, { useEffect, useState, useMemo } from "react";
import { Button, Snackbar, Alert } from "@mui/material";
import "./Detectors.css";
import { useSidebar } from "../../context/SidebarContext";
import DetectorModal from "../DetectorModal/DetectorModal";
import { addDetectorAPI } from "../../api/AddDetectorAPI";
import { useAuth } from "../../auth/AuthContext";
import { fetchAllDetectors } from "../../api/FetchAllDetectors";
import { DeleteDetectorAPI } from "../../api/DeleteDetectorAPI";

const Detectors = () => {
  const { isCollapsed } = useSidebar();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("detector_name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [expandedRow, setExpandedRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [detectors, setDetectors] = useState([]);

  // Combined snackbar state for both add and delete notifications.
  const [snackBar, setSnackBar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const userContext = useAuth();

  // Helper function to show snackbar
  const showSnackbar = (message, severity = "success") => {
    setSnackBar({ open: true, message, severity });
  };

  // Close snackbar
  const closeSnackbar = () => {
    setSnackBar({ ...snackBar, open: false });
  };

  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Toggle expanded row
  const handleRowClick = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  // Function to add a new detector via API call
  const handleAddDetector = async (newDetector) => {
    try {
      // Attach the username to the payload
      newDetector.username = username;
      // Call the API to add the detector
      const createdDetector = await addDetectorAPI(newDetector);
      if (createdDetector) {
        setDetectors([...detectors, newDetector]);
        setModalOpen(false);
        showSnackbar("Detector added successfully!", "success");
        console.log("New detector added successfully:", createdDetector);
      }
    } catch (error) {
      console.error("Error adding detector:", error);
      showSnackbar("Error adding detector.", "error");
    }
  };

  // On mount, fetch detectors from backend using username
  useEffect(() => {
    const uname = userContext.username
      ? userContext.username
      : sessionStorage.getItem("username");
    setUsername(uname);
    fetchAllDetectors(uname).then((detectorList) => {
      setDetectors(detectorList || []);
    });
  }, [userContext.username]);

  // Optimized filtering using useMemo
  const filteredDetectors = useMemo(() => {
    return detectors.filter((detector) =>
      (detector.detector_name ? detector.detector_name.toLowerCase() : "")
        .includes(searchTerm.toLowerCase()) ||
      (detector.detector_type ? detector.detector_type.toLowerCase() : "")
        .includes(searchTerm.toLowerCase())
    );
  }, [detectors, searchTerm]);

  // Optimized sorting using useMemo
  const sortedDetectors = useMemo(() => {
    return [...filteredDetectors].sort((a, b) => {
      const fieldA = a[sortField] || "";
      const fieldB = b[sortField] || "";
      if (sortDirection === "asc") {
        return fieldA > fieldB ? 1 : -1;
      } else {
        return fieldA < fieldB ? 1 : -1;
      }
    });
  }, [filteredDetectors, sortField, sortDirection]);

  // Get chip color based on type
  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case "regex":
        return "type-regex";
      case "keywords":
        return "type-keyword";
      case "ml_based":
        return "type-ml";
      default:
        return "";
    }
  };

  // Delete detector handler updated with combined snackbar notifications
  const handleDeleteDetector = async (detectorName, username) => {
    try {
      // Pass policy_name as detectorName to match your API expectation
      const result = await DeleteDetectorAPI({ username, detectorName });
      // Remove the deleted detector from the state.
      setDetectors(detectors.filter(detector => detector.detector_name !== detectorName));
      showSnackbar("Detector deleted successfully.", "success");
      console.log("Detector deleted successfully:", result);
    } catch (error) {
      console.error("Error deleting detector:", error);
      const errorMessage = error.response?.data?.error || "Error deleting detector.";
      showSnackbar(errorMessage, "error");
    }
  };

  return (
    <div className="detectors">
      <div className="detectors-content">
        <div className="detectors-header">
          <h1 className="page-title">Detectors</h1>
          <Button
            variant="contained"
            className="add-detector-btn"
            onClick={() => setModalOpen(true)}
          >
            Add Detector
          </Button>
        </div>

        <div className="detectors-container">
          <div className="detectors-tools">
            <div className="search-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="search-icon"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search detectors..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="results-count">
              {filteredDetectors.length} detector
              {filteredDetectors.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="detectors-table-container">
            <table className="detectors-table">
              <thead>
                <tr>
                  <th
                    className={sortField === "detector_name" ? `sorting ${sortDirection}` : ""}
                    onClick={() => handleSort("detector_name")}
                  >
                    Name{" "}
                    {sortField === "detector_name" && (
                      <span className="sort-icon">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </th>
                  <th
                    className={sortField === "detector_type" ? `sorting ${sortDirection}` : ""}
                    onClick={() => handleSort("detector_type")}
                  >
                    Type{" "}
                    {sortField === "detector_type" && (
                      <span className="sort-icon">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedDetectors.map((detector, index) => (
                  <React.Fragment key={index}>
                    <tr
                      className={expandedRow === index ? "row-expanded" : ""}
                      onClick={() => handleRowClick(index)}
                    >
                      <td>{detector.detector_name || "N/A"}</td>
                      <td>
                        <span className={`type-chip ${getTypeColor(detector.detector_type || "")}`}>
                          {detector.detector_type
                            ? detector.detector_type.toUpperCase()
                            : "N/A"}
                        </span>
                      </td>
                    </tr>
                    {expandedRow === index && (
                      <tr className="expanded-info">
                        <td colSpan="2">
                          <div className="expanded-content">
                            <div className="expanded-details">
                              <div className="detail-group">
                                <span className="detail-label">Username:</span>
                                <span className="detail-value">{detector.username || "N/A"}</span>
                              </div>
                              {detector.detector_type &&
                                detector.detector_type.toLowerCase() === "regex" && (
                                  <div className="detail-code">
                                    <h4>Patterns:</h4>
                                    {detector.regex_patterns && detector.regex_patterns.length > 0 ? (
                                      detector.regex_patterns.map((pattern, idx) => (
                                        <div key={idx} className="code-block">{pattern}</div>
                                      ))
                                    ) : (
                                      <div className="code-block">N/A</div>
                                    )}
                                  </div>
                                )}
                              {detector.detector_type &&
                                detector.detector_type.toLowerCase() === "ml_based" && (
                                  <div className="detail-code">
                                    <h4>Description:</h4>
                                    {detector.description && detector.description.length > 0 ? (
                                      <div className="code-block">{detector.description}</div>
                                    ) : (
                                      <div className="code-block">N/A</div>
                                    )}
                                  </div>
                                )}
                              {detector.detector_type &&
                                detector.detector_type.toLowerCase() === "keywords" && (
                                  <div className="detail-keywords">
                                    <h4>Keywords:</h4>
                                    <div className="keywords-list">
                                      {detector.keywords &&
                                        detector.keywords.map((keyword, index) => (
                                          <span key={index} className="keyword-item">{keyword}</span>
                                        ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                            <div className="expanded-actions">
                              <Button variant="outlined" className="action-edit" size="small">
                                Edit
                              </Button>
                              <Button
                                variant="outlined"
                                className="action-delete"
                                size="small"
                                onClick={(e) => {
                                  // Prevent row click if needed.
                                  e.stopPropagation();
                                  handleDeleteDetector(detector.detector_name, detector.username);
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <DetectorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddDetector}
      />
      <Snackbar
        open={snackBar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={closeSnackbar} severity={snackBar.severity} sx={{ width: "100%" }}>
          {snackBar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Detectors;
