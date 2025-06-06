"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { User, Briefcase, Search, LogOut, UserPlus, Eye, EyeOff, X } from "lucide-react"
import "./AdminPanel.css"
import { getServerLink } from "@/server_link";

export default function AdminPanel({ data: initialData }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [showPassword, setShowPassword] = useState({})

  // Search input ref for focus management
  const searchInputRef = useRef(null)

  const merged = [...initialData.clients, ...initialData.employees]
  const [data, setData] = useState(merged || [])
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Modal closing states
  const [modalClosing, setModalClosing] = useState({
    addEmployee: false,
    logout: false,
  })

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
  })
  const [errors, setErrors] = useState({})

  // Enhanced escape key handling for search functionality
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        // Handle search bar escape functionality
        if (document.activeElement === searchInputRef.current) {
          if (searchTerm) {
            // First escape: clear search
            setSearchTerm("")
          } else {
            // Second escape: deselect search bar
            searchInputRef.current.blur()
          }
          return
        }

        // Handle modal escapes
        if (isAddEmployeeOpen) closeModal("addEmployee")
        if (isLogoutOpen) closeModal("logout")
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isAddEmployeeOpen, isLogoutOpen, searchTerm])

  const closeModal = (modalType) => {
    setModalClosing((prev) => ({ ...prev, [modalType]: true }))

    setTimeout(() => {
      switch (modalType) {
        case "addEmployee":
          setIsAddEmployeeOpen(false)
          break
        case "logout":
          setIsLogoutOpen(false)
          break
      }
      setModalClosing((prev) => ({ ...prev, [modalType]: false }))
    }, 200)
  }

  // Show success message with auto-dismiss
  const showSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => {
      setSuccessMessage("")
    }, 3000)
  }

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = data

    if (activeFilter === "clients") {
      filtered = filtered.filter((person) => person?.marketingConsent !== undefined)
    } else if (activeFilter === "employees") {
      filtered = filtered.filter((person) => person?.marketingConsent === undefined)
    }

    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();

      filtered = filtered.filter((person) =>
        (person.firstName?.toLowerCase() ?? '').includes(lowerSearch) ||
        (person.personalCode?.toLowerCase() ?? '').includes(lowerSearch) ||
        (person.docNumber?.toLowerCase() ?? '').includes(lowerSearch) ||
        (person.lastName?.toLowerCase() ?? '').includes(lowerSearch) ||
        (person.type === "client" && person.personalCode && person.personalCode.includes(searchTerm))
      );
    }

    return filtered
  }, [searchTerm, activeFilter, data])

  const handlePersonClick = (person) => {
    setSelectedPerson(person)
  }

  const togglePasswordVisibility = (id, visible) => {
    setShowPassword((prev) => ({
      ...prev,
      [id]: visible,
    }))
  }

  const handleLogout = async () => {
    try {
      const response = await fetch(getServerLink() + "/logout", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });



      if (response.ok) {
        window.location.href = "/login"

      }

    } catch (error) {
      console.error(error.message)
    }

  }

  const confirmLogout = () => {
    closeModal("logout")
    setTimeout(() => {
      handleLogout()
    }, 200)
  }

  // Validation functions
  const validateName = (name, fieldName) => {
    if (!name.trim()) {
      return `${fieldName} is required`
    }
    if (name.length < 3) {
      return `${fieldName} must be at least 3 characters`
    }
    if (name.length > 50) {
      return `${fieldName} must not exceed 50 characters`
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return `${fieldName} must contain only alphabetic characters and spaces`
    }
    return ""
  }

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required"
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return "Please enter a valid email format"
    }
    // Check for duplicate email
    const existingEmail = data.find((person) => person.type === "employee" && person.email === email)
    if (existingEmail) {
      return "Email already exists"
    }
    return ""
  }

  const validateUsername = (username) => {
    if (!username.trim()) {
      return "Username is required"
    }
    if (username.length < 4) {
      return "Username must be at least 4 characters"
    }
    if (username.length > 20) {
      return "Username must not exceed 20 characters"
    }
    // Check for duplicate username
    const existingUsername = data.find((person) => person.type === "employee" && person.username === username)
    if (existingUsername) {
      return "Username already exists"
    }
    return ""
  }

  const validatePassword = (password) => {
    if (!password.trim()) {
      return "Password is required"
    }
    if (password.length < 8) {
      return "Password too weak - minimum 8 characters required"
    }
    if (/\s/.test(password)) {
      return "Password cannot contain whitespace"
    }
    return ""
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    newErrors.firstName = validateName(formData.firstName, "First name")
    newErrors.lastName = validateName(formData.lastName, "Last name")
    newErrors.email = validateEmail(formData.email)
    newErrors.username = validateUsername(formData.username)
    newErrors.password = validatePassword(formData.password)

    setErrors(newErrors)

    // Return true if no errors
    return !Object.values(newErrors).some((error) => error !== "")
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
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
    }

    // Add to data
    setData((prev) => [...prev, newEmployee])

    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
    })
    setErrors({})
    closeModal("addEmployee")
    setShowNewPassword(false)

    // Show success message
    setTimeout(() => {
      showSuccess("Employee created successfully!")
    }, 200)
  }

  const renderPersonList = () => {
    return filteredData.map((person) => (
      <div key={person.id} className="user-card" onClick={() => handlePersonClick(person)}>
        <div className="user-card-content">
          <div className={`user-icon ${person.marketingConsent !== undefined ? "client" : "employee"}`}>
            {person.marketingConsent !== undefined ? <User size={20} /> : <Briefcase size={20} />}
          </div>
          <div className="user-info">
            <div className="user-header">
              <h3 className="user-name">
                {person.firstName} {person.lastName}
              </h3>
              <span className={`user-badge ${person.marketingConsent !== undefined ? "client" : "employee"}`}>
                {person.marketingConsent !== undefined ? "client" : "employee"}
              </span>
            </div>
            {person.marketingConsent !== undefined && person.crmEntries && person.crmEntries.length > 0 ? (
              <p className="user-preview">Last interaction: {person.crmEntries[0].date}</p>
            ) : person.marketingConsent !== undefined ? (
              <p className="user-preview no-recent-activities">No recent activities</p>
            ) : null}
            {person.marketingConsent === undefined && <p className="user-preview">{person.email}</p>}
          </div>
        </div>
      </div>
    ))
  }

  const renderPersonalInfo = () => {
    if (!selectedPerson) {
      return (
        <div className="empty-state">
          <div className="empty-content">
            <User className="empty-icon" />
            <h3 className="empty-title">Personal Information</h3>
            <p className="empty-description">Select a person to view their details</p>
          </div>
        </div>
      )
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
                  <div className="info-value">{selectedPerson.documentExpiry}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Marketing Consent</div>
                  <div className="info-value">{selectedPerson.marketingConsent ? "Yes" : "No"}</div>
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">Correspondence Address</div>
                <div className="info-value">{selectedPerson.correspondenceAddress}</div>
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
            {selectedPerson.marketingConsent !== undefined ? (
              <>
                <div className="info-item">
                  <div className="info-label">Personal Code</div>
                  <div className="info-value">{selectedPerson.personalCode}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Date of Birth</div>
                  <div className="info-value">{selectedPerson.dateOfBirth}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Document Type</div>
                  <div className="info-value">{selectedPerson.docType}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Document Number</div>
                  <div className="info-value">{selectedPerson.docNumber}</div>
                </div>
              </>
            ) : (
              <>
                <div className="info-item">
                  <div className="info-label">Username</div>
                  <div className="info-value">{selectedPerson.username}</div>
                  <div className="info-label">email</div>
                  <div className="info-value">{selectedPerson.email}</div>

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
                      onMouseDown={() => togglePasswordVisibility(selectedPerson.id, true)}
                      onMouseUp={() => togglePasswordVisibility(selectedPerson.id, false)}
                      onMouseLeave={() => togglePasswordVisibility(selectedPerson.id, false)}
                    >
                      {showPassword[selectedPerson.id] ? (
                        <EyeOff size={16} className="password-icon" />
                      ) : (
                        <Eye size={16} className="password-icon" />
                      )}
                    </button>
                  </div>
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
                  <div className="info-value">{selectedPerson.registrationAddress}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedPerson.marketingConsent !== undefined && selectedPerson.accounts?.length > 0 ? (
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
        ) : null}

      </div>
    )
  }

  const renderCRMRequests = () => {
    if (!selectedPerson) {
      return (
        <div className="empty-state">
          <div className="empty-content">
            <FileText className="empty-icon" />
            <h2 className="empty-title">Customer Relations Management</h2>
            <p className="empty-description">Select a client to view CRM requests</p>
          </div>
        </div>
      )
    }

    if (selectedPerson.type === "employee") {
      return (
        <div className="empty-state">
          <div className="empty-content">
            <Briefcase className="empty-icon" />
            <h2 className="empty-title">Employee Profile</h2>
            <p className="empty-description">Employees do not have CRM data</p>
            <p className="empty-description">Personal information is shown in the left panel</p>
          </div>
        </div>
      )
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
                  <span className="crm-entry-meta">by {entry.employeeName}</span>
                </div>
                <p className="crm-entry-content">{entry.content}</p>
              </div>
            ))
          ) : (
            <div className="no-data">
              <FileText className="no-data-icon" />
              <p className="no-data-text">No CRM entries found for this client</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-panel dashboard-fade-in">
      {successMessage && (
        <div className="success-toast">
          <span>{successMessage}</span>
        </div>
      )}

      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="header">
          <div className="logo-section">
            <div className="logo-icon">
              <Briefcase size={24} color="white" />
            </div>
            <div className="logo-text">
              <h1>SimBank</h1>
              <p>Admin Portal</p>
            </div>
          </div>
          <div className="search-container">
            <Search className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-buttons">
            <button
              className={`filter-button ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              All Users
            </button>
            <button
              className={`filter-button ${activeFilter === "employees" ? "active" : ""}`}
              onClick={() => setActiveFilter("employees")}
            >
              Employees
            </button>
            <button
              className={`filter-button ${activeFilter === "clients" ? "active" : ""}`}
              onClick={() => setActiveFilter("clients")}
            >
              Clients
            </button>
          </div>
        </div>

        <div className="user-list">
          <h3>Users ({filteredData.length})</h3>
          {renderPersonList()}
        </div>

        <div className="bottom-section">
          <div className="bottom-buttons">
            <button className="primary-button" onClick={() => setIsAddEmployeeOpen(true)}>
              <UserPlus size={16} style={{ marginRight: "8px" }} />
              New Employee
            </button>
            <button className="icon-button" onClick={() => setIsLogoutOpen(true)}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal("logout")}>
          <div
            className={`modal-content logout-modal ${modalClosing.logout ? "closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                <LogOut size={20} color="#8b5cf6" />
                Confirm Logout
              </h3>
              <button className="modal-close" onClick={() => closeModal("logout")}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p className="logout-message">
                Are you sure you want to logout? You will be redirected to the login page.
              </p>
              <div className="form-actions">
                <button type="button" className="button-secondary" onClick={() => closeModal("logout")}>
                  Cancel
                </button>
                <button type="button" className="button-primary logout-confirm" onClick={confirmLogout}>
                  <LogOut size={16} style={{ marginRight: "8px" }} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddEmployeeOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal("addEmployee")}>
          <div
            className={`modal-content ${modalClosing.addEmployee ? "closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                <UserPlus size={20} color="#8b5cf6" />
                Create New Employee
              </h3>
              <button className="modal-close" onClick={() => closeModal("addEmployee")}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      className={`form-input ${errors.firstName ? "error" : ""}`}
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      className={`form-input ${errors.lastName ? "error" : ""}`}
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className={`form-input ${errors.email ? "error" : ""}`}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email"
                  />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input
                    className={`form-input ${errors.username ? "error" : ""}`}
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    placeholder="Enter username"
                  />
                  {errors.username && <div className="error-message">{errors.username}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <div className="password-container">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className={`form-input ${errors.password ? "error" : ""}`}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <div className="error-message">{errors.password}</div>}
                </div>
                <div className="form-actions">
                  <button type="button" className="button-secondary" onClick={() => closeModal("addEmployee")}>
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
  )
}
