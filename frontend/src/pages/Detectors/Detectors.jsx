import React, { useState } from "react";
import { Box, Grid, TextField, IconButton, Button, Chip, MenuItem, Slider } from "@mui/material";
import "./Detectors.css";
import { useSidebar } from "../../context/SidebarContext";
import DetectorModal from "../DetectorModal/DetectorModal"; // Import the DetectorModal component

const Detectors = () => {
  const { isCollapsed } = useSidebar();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [expandedRow, setExpandedRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false); // Modal state

  const [detectors, setDetectors] = useState([
    { 
      id: 1, 
      name: "Credit Card Number", 
      description: "Identifies credit card numbers in text", 
      type: "Regex", 
      pattern: "\\b(?:\\d{4}[- ]?){3}\\d{4}\\b", 
      createdBy: "John Smith",
      dateCreated: "2025-01-15",
      lastModified: "2025-02-20",
      caseSensitive: false
    },
    { 
      id: 2, 
      name: "Social Security Number", 
      description: "Detects SSN formats in content", 
      type: "Regex", 
      pattern: "\\b\\d{3}-\\d{2}-\\d{4}\\b", 
      createdBy: "Sarah Johnson",
      dateCreated: "2025-01-10",
      lastModified: "2025-02-18",
      caseSensitive: false
    },
    { 
      id: 3, 
      name: "Profanity Filter", 
      description: "Blocks common profanity", 
      type: "Keyword", 
      keywords: ["profanity1", "profanity2", "profanity3"],
      createdBy: "Mike Davis",
      dateCreated: "2024-12-05",
      lastModified: "2025-02-10",
      caseSensitive: true
    },
    { 
      id: 4, 
      name: "PII Detector", 
      description: "Identifies personally identifiable information", 
      type: "ML", 
      confidence: "High (95%)",
      model: "PII-Detect v2.3",
      createdBy: "Lisa Chen",
      dateCreated: "2025-01-22",
      lastModified: "2025-02-22",
      caseSensitive: true
    },
    // ... other detectors
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

  // Function to add new detector from modal data
  const handleAddDetector = (newDetector) => {
    // In a real app, the id would be returned from the backend
    newDetector.id = detectors.length + 1;
    setDetectors([...detectors, newDetector]);
  };

  // Filter and sort detectors
  const filteredDetectors = detectors.filter(detector => 
    detector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detector.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detector.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedDetectors = [...filteredDetectors].sort((a, b) => {
    if (sortDirection === "asc") {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });

  // Get type chip color
  const getTypeColor = (type) => {
    switch(type) {
      case 'Regex': return 'type-regex';
      case 'Keyword': return 'type-keyword';
      case 'ML': return 'type-ml';
      default: return '';
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
            onClick={() => setModalOpen(true)} // Open the modal when clicked
          >
            Add Detector
          </Button>
        </div>
        
        <div className="detectors-container">
          <div className="detectors-tools">
            <div className="search-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
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
              {filteredDetectors.length} detector{filteredDetectors.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="detectors-table-container">
            <table className="detectors-table">
              <thead>
                <tr>
                  <th 
                    className={sortField === "name" ? `sorting ${sortDirection}` : ""}
                    onClick={() => handleSort("name")}
                  >
                    Name
                    {sortField === "name" && (
                      <span className="sort-icon">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th 
                    className={sortField === "type" ? `sorting ${sortDirection}` : ""}
                    onClick={() => handleSort("type")}
                  >
                    Type
                    {sortField === "type" && (
                      <span className="sort-icon">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedDetectors.map((detector) => (
                  <React.Fragment key={detector.id}>
                    <tr 
                      className={expandedRow === detector.id ? "row-expanded" : ""}
                      onClick={() => handleRowClick(detector.id)}
                    >
                      <td>{detector.name}</td>
                      <td>
                        <span className={`type-chip ${getTypeColor(detector.type)}`}>
                          {detector.type}
                        </span>
                      </td>
                    </tr>
                    {expandedRow === detector.id && (
                      <tr className="expanded-info">
                        <td colSpan="2">
                          <div className="expanded-content">
                            <div className="expanded-details">
                              <div className="detail-group">
                                <span className="detail-label">Created By:</span>
                                <span className="detail-value">{detector.createdBy}</span>
                              </div>
                              <div className="detail-group">
                                <span className="detail-label">Date Created:</span>
                                <span className="detail-value">{detector.dateCreated}</span>
                              </div>
                              <div className="detail-group">
                                <span className="detail-label">Last Modified:</span>
                                <span className="detail-value">{detector.lastModified}</span>
                              </div>
                              <div className="detail-group">
                                <span className="detail-label">Case Sensitive:</span>
                                <span className="detail-value">{detector.caseSensitive ? "Yes" : "No"}</span>
                              </div>
                            </div>
                            
                            {detector.type === "Regex" && (
                              <div className="detail-code">
                                <h4>Pattern:</h4>
                                <div className="code-block">{detector.pattern}</div>
                              </div>
                            )}
                            
                            {detector.type === "Keyword" && (
                              <div className="detail-keywords">
                                <h4>Keywords:</h4>
                                <div className="keywords-list">
                                  {detector.keywords && detector.keywords.map((keyword, index) => (
                                    <span key={index} className="keyword-item">{keyword}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {detector.type === "ML" && (
                              <div className="detail-ml">
                                <h4>ML Model Details:</h4>
                                <div className="ml-details">
                                  <div className="detail-group">
                                    <span className="detail-label">Model:</span>
                                    <span className="detail-value">{detector.model}</span>
                                  </div>
                                  <div className="detail-group">
                                    <span className="detail-label">Confidence:</span>
                                    <span className="detail-value">{detector.confidence}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            
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
      {/* Render the DetectorModal when modalOpen is true */}
      <DetectorModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleAddDetector} 
      />
    </div>
  );
};

export default Detectors;
