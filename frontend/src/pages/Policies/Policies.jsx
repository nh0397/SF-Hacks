import React, { useState, useEffect } from "react";
import { Button, Switch, Snackbar, Alert } from "@mui/material";
import "./Policies.css";
import { useSidebar } from "../../context/SidebarContext";
import PolicyModal from "../PolicyModal/PolicyModal"; // Import the PolicyModal component
import { addPolicyAPI } from "../../api/AddPoliciesAPI";
import { fetchAllPolicies } from "../../api/FetchAllPolicies";
import { fetchAllDetectors } from "../../api/FetchAllDetectors";
import { useAuth } from "../../auth/AuthContext";
import { DeletePolicyAPI } from "../../api/DeletePolicyAPI";

const Policies = () => {
  const { isCollapsed } = useSidebar();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("policy_name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [expandedRow, setExpandedRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false); // Modal state
  const [formData, setFormData] = useState(null); // To store form data for validation
  const [username, setUsername] = useState("");
  const [detectors, setDetectors] = useState([]);
  const [policies, setPolicies] = useState([]);

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

  // Handle search
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

  // Handle row click to expand
  const handleRowClick = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Handle status toggle
  const handleStatusToggle = (id, newStatus) => {
    setPolicies(
      policies.map((policy) =>
        policy.id === id ? { ...policy, status: newStatus } : policy
      )
    );
  };

  // Function to validate form data
  const isFormValid = (data) => {
    if (!data.policy_name || !data.policy_name.trim()) return false;
    if (!data.description || !data.description.trim()) return false;
    if (!data.detectors || data.detectors.length === 0) return false;
    for (const detector of data.detectors) {
      if (!data.thresholds || !data.thresholds[detector]) return false;
    }
    if (!data.action) return false;
    if (!data.users || data.users.length === 0) return false;
    return true;
  };

  // Function to update form data for validation
  const handleFormUpdate = (data) => {
    setFormData(data);
    console.log("Form data updated:", data);
  };

  // Function to add new policy from modal data
  const handleAddPolicy = async (newPolicy) => {
    console.log("Adding new policy:", newPolicy);
    const now = new Date().toISOString().split("T")[0];
    newPolicy.username = sessionStorage.getItem("username");
    newPolicy.id = policies.length + 1;
    newPolicy.createdBy = sessionStorage.getItem("username");
    newPolicy.dateCreated = now;
    newPolicy.lastModified = now;
    newPolicy.status = true;
    const createdPolicy = await addPolicyAPI(newPolicy);
    if (createdPolicy) {
      setPolicies([...policies, newPolicy]);
      setModalOpen(false);
      setFormData(null);
      showSnackbar("Policy Added Successfully!", "success");
      console.log("New Policy added successfully:", createdPolicy);
    }
  };

  // Function to delete a policy using the DeletePolicyAPI.
  // The click event is passed to stop propagation so that the row doesn't toggle.
  const handleDeletePolicy = async (username, policyName, e) => {
    if (e) e.stopPropagation();
    try {
      const result = await DeletePolicyAPI({ username, policy_name: policyName });
      setPolicies(policies.filter((policy) => policy.policy_name !== policyName));
      showSnackbar("Policy deleted successfully.", "success");
      console.log("Policy deleted successfully:", result);
    } catch (error) {
      console.error("Error deleting policy:", error);
      const errorMessage =
        error.response?.data?.message || "Error deleting policy.";
      showSnackbar(errorMessage, "error");
    }
  };

  useEffect(() => {
    const uname = userContext.username
      ? userContext.username
      : sessionStorage.getItem("username");
    setUsername(uname);
    fetchAllPolicies(uname).then((policyList) => {
      setPolicies(policyList || []);
    });
    fetchAllDetectors(uname).then((detectorList) => {
      setDetectors(detectorList || []);
    });
  }, [userContext.username]);

  const filteredPolicies = policies.filter(
    (policy) =>
      policy.policy_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.detectors.some((detector) =>
        detector.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const sortedPolicies = [...filteredPolicies].sort((a, b) => {
    if (sortDirection === "asc") {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });

  return (
    <div className="policies">
      <div className="policies-content">
        <div className="policies-header">
          <h1 className="page-title">Policies</h1>
          <Button
            variant="contained"
            className="add-policy-btn"
            onClick={() => setModalOpen(true)}
          >
            Add Policy
          </Button>
        </div>

        <div className="policies-container">
          <div className="policies-tools">
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
                placeholder="Search policies..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="results-count">
              {filteredPolicies.length} policy
              {filteredPolicies.length !== 1 ? "ies" : "y"}
            </div>
          </div>

          <div className="policies-table-container">
            <table className="policies-table">
              <thead>
                <tr>
                  <th
                    className={
                      sortField === "policy_name" ? `sorting ${sortDirection}` : ""
                    }
                    onClick={() => handleSort("policy_name")}
                  >
                    Name{" "}
                    {sortField === "policy_name" && (
                      <span className="sort-icon">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th
                    className={
                      sortField === "description" ? `sorting ${sortDirection}` : ""
                    }
                    onClick={() => handleSort("description")}
                  >
                    Description{" "}
                    {sortField === "description" && (
                      <span className="sort-icon">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th>Detectors</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedPolicies.map((policy) => (
                  <React.Fragment key={policy.id}>
                    <tr
                      className={expandedRow === policy.id ? "row-expanded" : ""}
                      onClick={() => handleRowClick(policy.id)}
                    >
                      <td>{policy.policy_name}</td>
                      <td>{policy.description}</td>
                      <td>
                        <div className="detectors-list">
                          {policy.detectors.join(", ")}
                        </div>
                      </td>
                      <td
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Switch
                          checked={policy.status}
                          onChange={(e) =>
                            handleStatusToggle(policy.id, e.target.checked)
                          }
                          color="primary"
                          size="small"
                        />
                      </td>
                    </tr>
                    {expandedRow === policy.id && (
                      <tr className="expanded-info">
                        <td colSpan="4">
                          <div className="expanded-content">
                            <div className="expanded-details">
                              <div className="detail-group">
                                <span className="detail-label">Created By:</span>
                                <span className="detail-value">
                                  {policy.createdBy}
                                </span>
                              </div>
                              <div className="detail-group">
                                <span className="detail-label">Date Created:</span>
                                <span className="detail-value">
                                  {policy.dateCreated}
                                </span>
                              </div>
                              <div className="detail-group">
                                <span className="detail-label">
                                  Last Modified:
                                </span>
                                <span className="detail-value">
                                  {policy.lastModified}
                                </span>
                              </div>
                              <div className="detail-group">
                                <span className="detail-label">Status:</span>
                                <span className="detail-value">
                                  <span
                                    className={`status-indicator ${policy.status ? "active" : "inactive"
                                      }`}
                                  ></span>
                                  {policy.status ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>
                            <div className="detail-detectors">
                              <h4>Detectors:</h4>
                              <div className="detectors-chips-list">
                                {policy.detectors.map((detector, index) => (
                                  <span key={index} className="detector-chip">
                                    {detector}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="expanded-actions">
                              <Button
                                variant="outlined"
                                className="action-edit"
                                size="small"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outlined"
                                className="action-delete"
                                size="small"
                                onClick={(e) =>
                                  handleDeletePolicy(
                                    policy.username,
                                    policy.policy_name,
                                    e
                                  )
                                }
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
      <PolicyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddPolicy}
        detectors={detectors}
        onUpdate={handleFormUpdate}
        isValid={formData ? isFormValid(formData) : false}
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

export default Policies;
