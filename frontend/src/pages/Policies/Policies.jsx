import React, { useState, useEffect } from "react";
import { Button, Switch, Snackbar, Alert } from "@mui/material";
import "./Policies.css";
import { useSidebar } from "../../context/SidebarContext";
import PolicyModal from "../PolicyModal/PolicyModal"; // Import the PolicyModal component
import { addPolicyAPI } from "../../api/AddPoliciesAPI"
import { fetchAllPolicies } from "../../api/FetchAllPolicies";
import { useAuth } from "../../auth/AuthContext";
import { fetchAllDetectors } from "../../api/FetchAllDetectors";



const Policies = () => {
  const { isCollapsed } = useSidebar();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [expandedRow, setExpandedRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false); // Modal state
  const [formData, setFormData] = useState(null); // To store form data for validation
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [detectors, setDetectors] = useState([])

  const userContext = useAuth();
  // Sample detectors data (in a real app, fetched from an API)
  // const detectors = [
  //   { id: 1, name: "Credit Card Number" },
  //   { id: 2, name: "Social Security Number" },
  //   { id: 3, name: "Profanity Filter" },
  //   { id: 4, name: "PII Detector" },
  // ];

  // Sample policies
  const [policies, setPolicies] = useState([
    // {
    //   id: 1,
    //   policy_name: "Payment Information Security",
    //   description: "Protect customer payment information",
    //   detectors: ["Credit Card Number", "PII Detector"],
    //   status: true,
    //   createdBy: "John Smith",
    //   dateCreated: "2025-01-15",
    //   lastModified: "2025-02-20"
    // },
    // {
    //   id: 2,
    //   policy_name: "Personal Data Protection",
    //   description: "Safeguard all personal identifiable information",
    //   detectors: ["Social Security Number", "PII Detector"],
    //   status: true,
    //   createdBy: "Sarah Johnson",
    //   dateCreated: "2025-01-10",
    //   lastModified: "2025-02-18"
    // },
    // {
    //   id: 3,
    //   policy_name: "Content Moderation",
    //   description: "Filter inappropriate content",
    //   detectors: ["Profanity Filter"],
    //   status: false,
    //   createdBy: "Mike Davis",
    //   dateCreated: "2024-12-05",
    //   lastModified: "2025-02-10"
    // },
    // {
    //   id: 4,
    //   policy_name: "Comprehensive Security",
    //   description: "Apply all security measures",
    //   detectors: ["Credit Card Number", "Social Security Number", "PII Detector"],
    //   status: true,
    //   createdBy: "Lisa Chen",
    //   dateCreated: "2025-01-22",
    //   lastModified: "2025-02-22"
    // },
  ]);

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
    setPolicies(policies.map(policy =>
      policy.id === id ? { ...policy, status: newStatus } : policy
    ));
  };

  // Function to validate form data
  const isFormValid = (data) => {
    // Check if name and description are not empty
    if (!data.policy_name || !data.policy_name.trim()) return false;
    if (!data.description || !data.description.trim()) return false;

    // Check if at least one detector is selected
    if (!data.detectors || data.detectors.length === 0) return false;

    // Validate thresholds for each detector
    for (const detector of data.detectors) {
      if (!data.thresholds || !data.thresholds[detector]) return false;
    }

    // Check if action is selected
    if (!data.action) return false;

    // Check if at least one user/group is selected
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
    // Console log the data
    console.log("Adding new policy:", newPolicy);


    // Add creation and modification dates
    const now = new Date().toISOString().split("T")[0];
    newPolicy.username = sessionStorage.getItem('username');
    newPolicy.id = policies.length + 1;
    newPolicy.createdBy = sessionStorage.getItem('username');
    newPolicy.dateCreated = now;
    newPolicy.lastModified = now;
    newPolicy.status = true;
    const createdPolicy = await addPolicyAPI(newPolicy);
    if (createdPolicy) {
      setPolicies([...policies, newPolicy]);
      setModalOpen(false);
      setFormData(null); // Reset form data
      setModalOpen(false);
      setSnackBarOpen(true);
      console.log("New Policy added successfully:", createdPolicy);
    }

  };

  const closeSnackbar = () => {
    setSnackBarOpen(false);
  };

  // Filter and sort policies
  const filteredPolicies = policies.filter(policy =>
    policy.policy_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.detectors.some(detector => detector.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedPolicies = [...filteredPolicies].sort((a, b) => {
    if (sortDirection === "asc") {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });

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
  }, []);

  return (
    <div className="policies">
      <div className="policies-content">
        <div className="policies-header">
          <h1 className="page-title">Policies</h1>
          <Button
            variant="contained"
            className="add-policy-btn"
            onClick={() => setModalOpen(true)} // Open the modal when clicked
          >
            Add Policy
          </Button>
        </div>

        <div className="policies-container">
          <div className="policies-tools">
            <div className="search-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
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
              {filteredPolicies.length} policy{filteredPolicies.length !== 1 ? 'ies' : 'y'}
            </div>
          </div>

          <div className="policies-table-container">
            <table className="policies-table">
              <thead>
                <tr>
                  <th
                    className={sortField === "policy_name" ? `sorting ${sortDirection}` : ""}
                    onClick={() => handleSort("policy_name")}
                  >
                    Name
                    {sortField === "policy_name" && (
                      <span className="sort-icon">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th
                    className={sortField === "description" ? `sorting ${sortDirection}` : ""}
                    onClick={() => handleSort("description")}
                  >
                    Description
                    {sortField === "description" && (
                      <span className="sort-icon">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th>
                    Detectors
                  </th>
                  <th>
                    Status
                  </th>
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
                          e.stopPropagation(); // Prevent row expansion when toggling status
                        }}
                      >
                        <Switch
                          checked={policy.status}
                          onChange={(e) => handleStatusToggle(policy.id, e.target.checked)}
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
                                <span className="detail-value">{policy.createdBy}</span>
                              </div>
                              <div className="detail-group">
                                <span className="detail-label">Date Created:</span>
                                <span className="detail-value">{policy.dateCreated}</span>
                              </div>
                              <div className="detail-group">
                                <span className="detail-label">Last Modified:</span>
                                <span className="detail-value">{policy.lastModified}</span>
                              </div>
                              <div className="detail-group">
                                <span className="detail-label">Status:</span>
                                <span className="detail-value">
                                  <span className={`status-indicator ${policy.status ? 'active' : 'inactive'}`}></span>
                                  {policy.status ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>

                            <div className="detail-detectors">
                              <h4>Detectors:</h4>
                              <div className="detectors-chips-list">
                                {policy.detectors.map((detector, index) => (
                                  <span key={index} className="detector-chip">{detector}</span>
                                ))}
                              </div>
                            </div>

                            <div className="expanded-actions">
                              <Button variant="outlined" className="action-edit" size="small">
                                Edit
                              </Button>
                              <Button variant="outlined" className="action-delete" size="small">
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
      {/* Render the PolicyModal when modalOpen is true */}
      <PolicyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddPolicy}
        detectors={detectors}
        onUpdate={handleFormUpdate}
        isValid={formData ? isFormValid(formData) : false}
      />
      <Snackbar open={snackBarOpen} autoHideDuration={6000} onClose={closeSnackbar} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={closeSnackbar} severity="success" sx={{ width: "100%" }}>
          Policy Added Successfully!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Policies;