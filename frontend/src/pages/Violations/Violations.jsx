import React, { useState } from "react";
import { Switch } from "@mui/material";
import "./Violations.css";
import { useSidebar } from "../../context/SidebarContext";

const Violations = () => {
  const { isCollapsed } = useSidebar();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("incidentId");
  const [sortDirection, setSortDirection] = useState("desc"); // Default sorting newest first
  const [expandedRow, setExpandedRow] = useState(null);

  // Sample violations data (in a real app, fetched from an API)
  const [violations, setViolations] = useState([
    {
      id: "INC-24578",
      source: "john.smith@company.com",
      destination: "ChatGPT",
      severity: "high",
      action: "blocked",
      timestamp: "2025-02-28T14:32:45",
      content: "Here's my credit card number: 4111 1111 1111 1111, expiry date: 05/27, CVV: 123",
      policiesViolated: ["Payment Information Security", "Comprehensive Security"],
      detector: "Credit Card Number",
      ipAddress: "192.168.1.45",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/110.0.0.0"
    },
    {
      id: "INC-24577",
      source: "sarah.johnson@company.com",
      destination: "Claude",
      severity: "medium",
      action: "masked",
      timestamp: "2025-02-28T13:15:22",
      content: "My SSN is 123-45-6789. Can you help me fill out this tax form?",
      policiesViolated: ["Personal Data Protection", "Comprehensive Security"],
      detector: "Social Security Number",
      ipAddress: "192.168.2.89",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15"
    },
    {
      id: "INC-24576",
      source: "alex.wong@company.com",
      destination: "Microsoft Copilot",
      severity: "low",
      action: "audited",
      timestamp: "2025-02-28T10:42:18",
      content: "// This code contains company-specific authentication logic\nfunction authenticateUser(username, password) {\n  // First check if user exists in database\n  const user = findUserByName(username);\n  if (user && user.password === hashPassword(password)) {\n    return generateToken(user);\n  }\n  return null;\n}",
      policiesViolated: ["Code Security"],
      detector: "PII Detector",
      ipAddress: "192.168.3.21",
      userAgent: "Mozilla/5.0 (X11; Linux x86_64) Firefox/98.0"
    },
    {
      id: "INC-24575",
      source: "emily.davis@company.com",
      destination: "ChatGPT",
      severity: "high",
      action: "blocked",
      timestamp: "2025-02-27T16:08:34",
      content: "Can you help me extract customer data from this database? SELECT * FROM customers WHERE signup_date > '2024-01-01'",
      policiesViolated: ["Data Access Control", "Comprehensive Security"],
      detector: "PII Detector",
      ipAddress: "192.168.1.78",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/110.0.1587.57"
    },
    {
      id: "INC-24574",
      source: "michael.brown@company.com",
      destination: "Claude",
      severity: "medium",
      action: "masked",
      timestamp: "2025-02-27T14:22:09",
      content: "Here's our new product roadmap for Q3. The login credentials for the shared drive are username: admin, password: Company2025!",
      policiesViolated: ["Security Credentials Protection"],
      detector: "PII Detector",
      ipAddress: "192.168.4.32",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3 like Mac OS X) AppleWebKit/605.1.15 Version/16.3 Mobile/15E148"
    },
    {
      id: "INC-24573",
      source: "lisa.zhang@company.com",
      destination: "Microsoft Copilot",
      severity: "low",
      action: "audited",
      timestamp: "2025-02-27T11:34:56",
      content: "// Add API key for testing\nconst API_KEY = 'test_sk_123456789abcdef';\n\nfunction fetchData() {\n  return fetch('https://api.example.com/data', {\n    headers: {\n      'Authorization': `Bearer ${API_KEY}`\n    }\n  });\n}",
      policiesViolated: ["API Security"],
      detector: "PII Detector",
      ipAddress: "192.168.2.15",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/110.0.0.0"
    },
  ]);

  // Format timestamp function
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
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
      setSortDirection("desc"); // Default to descending for new sort fields
    }
  };

  // Handle row click to expand
  const handleRowClick = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Filter and sort violations
  const filteredViolations = violations.filter(violation => 
    violation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    violation.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    violation.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    violation.severity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    violation.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    violation.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedViolations = [...filteredViolations].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Special case for timestamp sorting
    if (sortField === "timestamp") {
      aValue = new Date(a.timestamp);
      bValue = new Date(b.timestamp);
    }
    
    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="violations">
      <div className="violations-content">
        <div className="violations-header">
          <h1 className="page-title">DLP Violations</h1>
        </div>
        
        <div className="violations-container">
          <div className="violations-tools">
            <div className="search-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search violations..." 
                value={searchTerm} 
                onChange={handleSearch}
              />
            </div>
            <div className="results-count">
              {filteredViolations.length} violation{filteredViolations.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="violations-table-container">
            <table className="violations-table">
              <thead>
                <tr>
                  <th 
                    className={sortField === "id" ? `sorting ${sortDirection}` : ""}
                    onClick={() => handleSort("id")}
                  >
                    Incident ID
                    {sortField === "id" && (
                      <span className="sort-icon">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th 
                    className={sortField === "source" ? `sorting ${sortDirection}` : ""}
                    onClick={() => handleSort("source")}
                  >
                    Source
                    {sortField === "source" && (
                      <span className="sort-icon">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th 
                    className={sortField === "destination" ? `sorting ${sortDirection}` : ""}
                    onClick={() => handleSort("destination")}
                  >
                    Destination
                    {sortField === "destination" && (
                      <span className="sort-icon">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th 
                    className={sortField === "severity" ? `sorting ${sortDirection}` : ""}
                    onClick={() => handleSort("severity")}
                  >
                    Severity
                    {sortField === "severity" && (
                      <span className="sort-icon">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th 
                    className={sortField === "action" ? `sorting ${sortDirection}` : ""}
                    onClick={() => handleSort("action")}
                  >
                    Action
                    {sortField === "action" && (
                      <span className="sort-icon">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th 
                    className={sortField === "timestamp" ? `sorting ${sortDirection}` : ""}
                    onClick={() => handleSort("timestamp")}
                  >
                    Timestamp
                    {sortField === "timestamp" && (
                      <span className="sort-icon">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedViolations.map((violation) => (
                  <React.Fragment key={violation.id}>
                    <tr 
                      className={expandedRow === violation.id ? "row-expanded" : ""}
                      onClick={() => handleRowClick(violation.id)}
                    >
                      <td>{violation.id}</td>
                      <td>{violation.source}</td>
                      <td>{violation.destination}</td>
                      <td>
                        <span className={`severity-indicator ${violation.severity}`}>
                          {violation.severity.charAt(0).toUpperCase() + violation.severity.slice(1)}
                        </span>
                      </td>
                      <td>
                        <span className={`action-indicator ${violation.action}`}>
                          {violation.action.charAt(0).toUpperCase() + violation.action.slice(1)}
                        </span>
                      </td>
                      <td>
                        <span className="timestamp">{formatTimestamp(violation.timestamp)}</span>
                      </td>
                    </tr>
                    {expandedRow === violation.id && (
                      <tr className="expanded-info">
                        <td colSpan="6">
                          <div className="expanded-content">
                            <div className="expanded-details">
                              <div className="detail-group">
                                <span className="detail-label">Source:</span>
                                <span className="detail-value">{violation.source}</span>
                              </div>
                              <div className="detail-group">
                                <span className="detail-label">Destination:</span>
                                <span className="detail-value">{violation.destination}</span>
                              </div>
                              <div className="detail-group">
                                <span className="detail-label">Detector:</span>
                                <span className="detail-value">{violation.detector}</span>
                              </div>
                              <div className="detail-group">
                                <span className="detail-label">IP Address:</span>
                                <span className="detail-value">{violation.ipAddress}</span>
                              </div>
                              <div className="detail-group">
                                <span className="detail-label">User Agent:</span>
                                <span className="detail-value">{violation.userAgent}</span>
                              </div>
                              <div className="detail-group">
                                <span className="detail-label">Timestamp:</span>
                                <span className="detail-value">{formatTimestamp(violation.timestamp)}</span>
                              </div>
                            </div>
                            
                            <div className="policies-violated">
                              <h4>Policies Violated:</h4>
                              <div>
                                {violation.policiesViolated.map((policy, index) => (
                                  <span key={index} className="policy-chip">{policy}</span>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4>Content:</h4>
                              <pre className="incident-content">{violation.content}</pre>
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
    </div>
  );
};

export default Violations;