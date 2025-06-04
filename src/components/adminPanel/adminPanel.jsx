"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Users,
  User,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  FileText,
  LogOut,
  Briefcase,
  Eye,
  EyeOff,
  Plus,
  Building,
  CheckCircle,
  X,
} from "lucide-react";
import "./AdminPanel.css";

// Mock data
const mockData = [
  {
    id: "1",
    type: "client",
    firstName: "Jonas",
    lastName: "Petraitis",
    personalCode: "38901234567",
    email: "jonas.petraitis@email.com",
    phone: "037654321",
    documentType: "ID Card",
    documentNumber: "AB123456",
    documentExpiry: "2028-05-15",
    dateOfBirth: "1989-01-23",
    registrationAddress: "Lithuania, Vilnius, Gedimino pr. 1-1, LT-01103",
    correspondenceAddress: "Lithuania, Vilnius, Gedimino pr. 1-1, LT-01103",
    marketingConsent: true,
    accounts: [
      {
        id: "acc1",
        iban: "LT123456789012345678",
        currency: "EUR",
        balance: 2500.5,
        cardType: "Debeto",
        servicePlan: "Gold",
        openingDate: "2024-01-15",
      },
    ],
    crmEntries: [
      {
        id: "crm1",
        date: "2024-12-01",
        contactType: "Phone",
        content:
          "Client called regarding account balance inquiry. Provided current balance information and explained recent transactions.",
        employeeName: "Marija Kazlauskienė",
      },
      {
        id: "crm2",
        date: "2024-11-28",
        contactType: "Email",
        content:
          "Sent welcome package and account setup instructions. Client confirmed receipt and expressed satisfaction with service.",
        employeeName: "Marija Kazlauskienė",
      },
    ],
  },
  {
    id: "2",
    type: "employee",
    firstName: "Marija",
    lastName: "Kazlauskienė",
    email: "marija.kazlauskiene@company.com",
    username: "mkazlauskiene",
    password: "SecurePass12sdgsfdgs",
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    type: "client",
    firstName: "Petras",
    lastName: "Jonaitis",
    personalCode: "37805123456",
    email: "petras.jonaitis@email.com",
    phone: "037987654",
    documentType: "Passport",
    documentNumber: "AB987654",
    documentExpiry: "2027-03-20",
    dateOfBirth: "1978-05-12",
    registrationAddress: "Lithuania, Kaunas, Laisvės al. 10-5, LT-44240",
    correspondenceAddress: "Lithuania, Kaunas, Laisvės al. 10-5, LT-44240",
    marketingConsent: false,
    accounts: [
      {
        id: "acc2",
        iban: "LT987654321098765432",
        currency: "EUR",
        balance: 1200.0,
        cardType: "Kredito",
        servicePlan: "Standard",
        openingDate: "2024-02-01",
      },
    ],
    crmEntries: [
      {
        id: "crm3",
        date: "2024-11-30",
        contactType: "Visit",
        content:
          "Client visited branch to discuss loan options. Provided information about available products and requirements.",
        employeeName: "Marija Kazlauskienė",
      },
    ],
  },
  {
    id: "4",
    type: "employee",
    firstName: "Tomas",
    lastName: "Petrauskas",
    email: "tomas.petrauskas@company.com",
    username: "tpetrauskas",
    password: "MyPassword456",
    createdAt: "2024-02-15",
  },
];

export default function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [data, setData] = useState(mockData);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  // Show success message with auto-dismiss
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply type filter
    if (activeFilter === "employees") {
      filtered = filtered.filter((person) => person.type === "employee");
    } else if (activeFilter === "clients") {
      filtered = filtered.filter((person) => person.type === "client");
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (person) =>
          person.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (person.type === "client" &&
            person.personalCode &&
            person.personalCode.includes(searchTerm))
      );
    }

    return filtered;
  }, [searchTerm, activeFilter, data]);

  const handlePersonClick = (person) => {
    setSelectedPerson(person);
  };

  const togglePasswordVisibility = (id, visible) => {
    setShowPassword((prev) => ({
      ...prev,
      [id]: visible,
    }));
  };

  const handleLogout = () => {
    document.cookie =
      "sessionCokie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  // Validation functions
  const validateName = (name, fieldName) => {
    if (!name.trim()) {
      return `${fieldName} is required`;
    }
    if (name.length < 3) {
      return `${fieldName} must be at least 3 characters`;
    }
    if (name.length > 50) {
      return `${fieldName} must not exceed 50 characters`;
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return `${fieldName} must contain only alphabetic characters and spaces`;
    }
    return "";
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email format";
    }
    // Check for duplicate email
    const existingEmail = data.find(
      (person) => person.type === "employee" && person.email === email
    );
    if (existingEmail) {
      return "Email already exists";
    }
    return "";
  };

  const validateUsername = (username) => {
    if (!username.trim()) {
      return "Username is required";
    }
    if (username.length < 4) {
      return "Username must be at least 4 characters";
    }
    if (username.length > 20) {
      return "Username must not exceed 20 characters";
    }
    // Check for duplicate username
    const existingUsername = data.find(
      (person) => person.type === "employee" && person.username === username
    );
    if (existingUsername) {
      return "Username already exists";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password.trim()) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password too weak - minimum 8 characters required";
    }
    if (/\s/.test(password)) {
      return "Password cannot contain whitespace";
    }
    return "";
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    newErrors.firstName = validateName(formData.firstName, "First name");
    newErrors.lastName = validateName(formData.lastName, "Last name");
    newErrors.email = validateEmail(formData.email);
    newErrors.username = validateUsername(formData.username);
    newErrors.password = validatePassword(formData.password);

    setErrors(newErrors);

    // Return true if no errors
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Create new employee
    const newEmployee = {
      id: (data.length + 1).toString(),
      type: "employee",
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      username: formData.username.trim(),
      password: formData.password,
      createdAt: new Date().toISOString().split("T")[0],
    };

    // Add to data
    setData((prev) => [...prev, newEmployee]);

    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
    });
    setErrors({});
    setIsAddEmployeeOpen(false);
    setShowNewPassword(false);

    // Show success message
    showSuccess("Employee created successfully!");
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
    });
    setErrors({});
    setShowNewPassword(false);
  };

  const renderPersonList = () => {
    return filteredData.map((person) => (
      <div
        key={person.id}
        className="user-card"
        onClick={() => handlePersonClick(person)}
      >
        <div className="user-card-content">
          <div className={`user-icon ${person.type}`}>
            {person.type === "employee" ? (
              <Briefcase size={20} />
            ) : (
              <User size={20} />
            )}
          </div>
          <div className="user-info">
            <div className="user-header">
              <h3 className="user-name">
                {person.firstName} {person.lastName}
              </h3>
              <span className={`user-badge ${person.type}`}>{person.type}</span>
            </div>
            {person.type === "client" &&
              person.crmEntries &&
              person.crmEntries.length > 0 && (
                <p className="user-preview">
                  {person.crmEntries[0].content.substring(0, 80)}...
                </p>
              )}
            {person.type === "employee" && (
              <p className="user-preview">{person.email}</p>
            )}
          </div>
        </div>
      </div>
    ));
  };

  const renderPersonalInfo = () => {
    if (!selectedPerson) {
      return (
        <div className="empty-state">
          <div className="empty-content">
            <User className="empty-icon" />
            <h3 className="empty-title">Personal Information</h3>
            <p className="empty-description">
              Select a person to view their details
            </p>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="profile-header">
          <div className="profile-avatar">
            {selectedPerson.type === "employee" ? (
              <Briefcase size={24} color="white" />
            ) : (
              <User size={24} color="white" />
            )}
          </div>
          <div className="profile-info">
            <h2>
              {selectedPerson.firstName} {selectedPerson.lastName}
            </h2>
            <p>{selectedPerson.type}</p>
          </div>
        </div>

        {/* Additional Information for Clients */}
        {selectedPerson.type === "client" && (
          <div className="info-card">
            <div className="card-header">
              <h3 className="card-title">
                <Calendar size={16} />
                Additional Information
              </h3>
            </div>
            <div className="card-content">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "16px",
                }}
              >
                <div className="info-item">
                  <div className="info-label">Document Expiry</div>
                  <div className="info-value">
                    {selectedPerson.documentExpiry}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Marketing Consent</div>
                  <div className="info-value">
                    {selectedPerson.marketingConsent ? "Yes" : "No"}
                  </div>
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">Correspondence Address</div>
                <div className="info-value">
                  {selectedPerson.correspondenceAddress}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="info-card">
          <div className="card-header">
            <h3 className="card-title">
              <User size={16} />
              Basic Information
            </h3>
          </div>
          <div className="card-content">
            {selectedPerson.type === "client" ? (
              <>
                <div className="info-item">
                  <div className="info-label">Personal Code</div>
                  <div className="info-value">
                    {selectedPerson.personalCode}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Date of Birth</div>
                  <div className="info-value">{selectedPerson.dateOfBirth}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Document Type</div>
                  <div className="info-value">
                    {selectedPerson.documentType}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Document Number</div>
                  <div className="info-value">
                    {selectedPerson.documentNumber}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="info-item">
                  <div className="info-label">Username</div>
                  <div className="info-value">{selectedPerson.username}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Password</div>
                  <div className="password-container">
                    <span className="password-value">
                      {showPassword[selectedPerson.id]
                        ? selectedPerson.password
                        : "*".repeat(selectedPerson.password.length)}
                    </span>
                    <button
                      className="password-toggle2"
                      onMouseDown={() =>
                        togglePasswordVisibility(selectedPerson.id, true)
                      }
                      onMouseUp={() =>
                        togglePasswordVisibility(selectedPerson.id, false)
                      }
                      onMouseLeave={() =>
                        togglePasswordVisibility(selectedPerson.id, false)
                      }
                    >
                      {showPassword[selectedPerson.id] ? (
                        <EyeOff size={16} className="password-icon" />
                      ) : (
                        <Eye size={16} className="password-icon" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Created</div>
                  <div className="info-value">{selectedPerson.createdAt}</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="info-card">
          <div className="card-header">
            <h3 className="card-title">
              <Mail size={16} />
              Contact
            </h3>
          </div>
          <div className="card-content">
            <div className="contact-item">
              <Mail className="contact-icon" />
              <span>{selectedPerson.email}</span>
            </div>
            {/* Only show phone for clients */}
            {selectedPerson.type === "client" && (
              <div className="contact-item">
                <User size={16} className="contact-icon" />
                <span>{selectedPerson.phone}</span>
              </div>
            )}
            {selectedPerson.type === "client" && (
              <div className="address-item">
                <MapPin size={16} className="address-icon" />
                <div className="address-content">
                  <div className="info-label">Registration Address</div>
                  <div className="info-value">
                    {selectedPerson.registrationAddress}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bank Accounts for Clients */}
        {selectedPerson.type === "client" && selectedPerson.accounts && (
          <div className="info-card">
            <div className="card-header">
              <h3 className="card-title">
                <CreditCard size={16} />
                Bank Accounts
              </h3>
            </div>
            <div className="card-content">
              {selectedPerson.accounts.map((account) => (
                <div key={account.id} className="account-item">
                  <div className="account-header">
                    <span className="account-iban">{account.iban}</span>
                    <span className="account-badge">{account.currency}</span>
                  </div>
                  <div className="account-details">
                    <div className="account-detail">
                      <div className="info-label">Balance</div>
                      <div className="info-value">
                        {account.balance.toFixed(2)} {account.currency}
                      </div>
                    </div>
                    <div className="account-detail">
                      <div className="info-label">Plan</div>
                      <div className="info-value">{account.servicePlan}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCRMRequests = () => {
    if (!selectedPerson) {
      return (
        <div className="empty-state">
          <div className="empty-content">
            <FileText className="empty-icon" />
            <h2 className="empty-title">Customer Relations Management</h2>
            <p className="empty-description">
              Select a client to view CRM requests
            </p>
          </div>
        </div>
      );
    }

    if (selectedPerson.type === "employee") {
      return (
        <div className="empty-state">
          <div className="empty-content">
            <Briefcase className="empty-icon" />
            <h2 className="empty-title">Employee Profile</h2>
            <p className="empty-description">Employees do not have CRM data</p>
            <p className="empty-description">
              Personal information is shown in the left panel
            </p>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="crm-header">
          <div className="crm-info">
            <div className="crm-avatar">
              <FileText size={24} color="white" />
            </div>
            <div className="crm-title">
              <h2>CRM History</h2>
              <p>
                {selectedPerson.firstName} {selectedPerson.lastName}
              </p>
            </div>
          </div>
        </div>

        {/* CRM Entries */}
        <div className="crm-entries">
          {selectedPerson.crmEntries && selectedPerson.crmEntries.length > 0 ? (
            selectedPerson.crmEntries.map((entry) => (
              <div key={entry.id} className="crm-entry">
                <div className="crm-entry-header">
                  <span className="crm-entry-badge">{entry.contactType}</span>
                  <span className="crm-entry-meta">{entry.date}</span>
                  <span className="crm-entry-meta">
                    by {entry.employeeName}
                  </span>
                </div>
                <p className="crm-entry-content">{entry.content}</p>
              </div>
            ))
          ) : (
            <div className="no-data">
              <FileText className="no-data-icon" />
              <p className="no-data-text">
                No CRM entries found for this client
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-panel">
      {/* Success message toast */}
      {successMessage && (
        <div className="success-toast">
          <CheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Left Sidebar */}
      <div className="sidebar">
        {/* Header */}
        <div className="header">
          <div className="logo-section">
            <div className="logo-icon">
              <Building size={24} color="white" />
            </div>
            <div className="logo-text">
              <h1>SimBank</h1>
              <p>Admin Panel</p>
            </div>
          </div>
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-buttons">
            <button
              className={`filter-button ${
                activeFilter === "all" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("all")}
            >
              <Users size={16} style={{ marginRight: "8px" }} />
              All
            </button>
            <button
              className={`filter-button ${
                activeFilter === "employees" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("employees")}
            >
              <Briefcase size={16} style={{ marginRight: "8px" }} />
              Employees
            </button>
            <button
              className={`filter-button ${
                activeFilter === "clients" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("clients")}
            >
              <User size={16} style={{ marginRight: "8px" }} />
              Clients
            </button>
          </div>
        </div>

        {/* User List */}
        <div className="user-list">
          <h3>Users (alphabetical order):</h3>
          {renderPersonList()}
        </div>

        {/* Bottom Section */}
        <div className="bottom-section">
          <div className="bottom-buttons">
            <button
              className="primary-button"
              onClick={() => {
                resetForm();
                setIsAddEmployeeOpen(true);
              }}
            >
              <Plus size={16} style={{ marginRight: "8px" }} />
              Add Employee
            </button>
            <button className="icon-button" onClick={handleLogout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Middle Panel */}
      <div className="middle-panel">
        <div className="middle-content">
          <h2 className="panel-title">Personal Data</h2>
          {renderPersonalInfo()}
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel">{renderCRMRequests()}</div>

      {/* Add Employee Modal */}
      {isAddEmployeeOpen && (
        <div
          className="modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && setIsAddEmployeeOpen(false)
          }
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <Briefcase size={20} color="#8b5cf6" />
                Add New Employee
              </h3>
              <button
                className="modal-close"
                onClick={() => setIsAddEmployeeOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    className={`form-input ${errors.firstName ? "error" : ""}`}
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="error-message">{errors.firstName}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    className={`form-input ${errors.lastName ? "error" : ""}`}
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="error-message">{errors.lastName}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className={`form-input ${errors.email ? "error" : ""}`}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="user@example.com"
                  />
                  {errors.email && (
                    <p className="error-message">{errors.email}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input
                    className={`form-input ${errors.username ? "error" : ""}`}
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    placeholder="Enter username (4-20 characters)"
                  />
                  {errors.username && (
                    <p className="error-message">{errors.username}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className={`form-input ${errors.password ? "error" : ""}`}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Enter password (min 8 characters)"
                      style={{ paddingRight: "40px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#6b7280",
                        cursor: "pointer",
                      }}
                    >
                      {showNewPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="error-message">{errors.password}</p>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => setIsAddEmployeeOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="button-primary">
                    Create Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
