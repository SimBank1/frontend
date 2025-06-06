"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import {
  User,
  Briefcase,
  Search,
  LogOut,
  UserPlus,
  X,
  Copy,
  CheckCircle,
  CreditCard,
  Mail,
  Phone,
  FileText,
  Trash2,
  ChevronDown,
  ChevronRight,
  Plus,
} from "lucide-react"
import "./AdminPanel.css"
import { getServerLink } from "@/server_link"

export default function AdminPanel({ data: initialData, currentUser }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [showPassword, setShowPassword] = useState({})

  // Search input ref for focus management
  const searchInputRef = useRef(null)

  const merged = [...(initialData?.clients || []), ...(initialData?.employees || [])]
  const [data, setData] = useState(merged)
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [isDeleteClientOpen, setIsDeleteClientOpen] = useState(false)
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [expandedCrmEntries, setExpandedCrmEntries] = useState({})

  // Modal closing states
  const [modalClosing, setModalClosing] = useState({
    addEmployee: false,
    addClient: false,
    addAccount: false,
    deleteClient: false,
    logout: false,
  })

  // Employee form state with auto-generation
  const [employeeFormData, setEmployeeFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
  })

  // Client form state
  const [clientFormData, setClientFormData] = useState({
    firstName: "",
    lastName: "",
    personalCode: "",
    email: "",
    phone: "",
    phoneCountryCode: "+370",
    secondPhone: "",
    secondPhoneCountryCode: "+370",
    documentType: "ID Card",
    documentNumber: "",
    documentExpiry: "",
    dateOfBirth: "",
    registrationCountry: "",
    registrationRegion: "",
    registrationCity: "",
    registrationStreet: "",
    registrationHouse: "",
    registrationApartment: "",
    registrationPostalCode: "",
    correspondenceCountry: "",
    correspondenceRegion: "",
    correspondenceCity: "",
    correspondenceStreet: "",
    correspondenceHouse: "",
    correspondenceApartment: "",
    correspondencePostalCode: "",
    marketingConsent: false,
  })

  // Account form state
  const [accountFormData, setAccountFormData] = useState({
    iban: "",
    currency: "EUR",
    balance: "",
    cardType: "none",
    servicePlan: "Standard",
    openingDate: new Date().toISOString().split("T")[0],
  })

  const [errors, setErrors] = useState({})
  const [sameAsRegistration, setSameAsRegistration] = useState(true)

  // Auto-generate username and password when name changes
  useEffect(() => {
    if (employeeFormData.firstName && employeeFormData.lastName) {
      const username = generateUsername(employeeFormData.firstName, employeeFormData.lastName)
      const password = generatePassword()

      setEmployeeFormData((prev) => ({
        ...prev,
        username,
        password,
      }))
    }
  }, [employeeFormData.firstName, employeeFormData.lastName])

  // Generate username from first and last name
  const generateUsername = (firstName, lastName) => {
    const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, "")
    const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, "")
    const baseUsername = cleanFirst + cleanLast

    // Check if username exists and add number if needed
    let username = baseUsername
    let counter = 1
    while (data.some((person) => person.username === username)) {
      username = baseUsername + counter
      counter++
    }

    return username
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let password = ""
    for (let i = 0; i < 6; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  // Copy username and password together
  const copyCredentials = () => {
    const credentials = `Username: ${employeeFormData.username}\nPassword: ${employeeFormData.password}`
    navigator.clipboard.writeText(credentials).then(() => {
      showSuccess("Credentials copied to clipboard!")
    })
  }

  // Enhanced escape key handling
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (document.activeElement === searchInputRef.current) {
          if (searchTerm) {
            setSearchTerm("")
          } else {
            searchInputRef.current.blur()
          }
          return
        }

        // Handle modal escapes
        if (isAddEmployeeOpen) closeModal("addEmployee")
        if (isAddClientOpen) closeModal("addClient")
        if (isAddAccountOpen) closeModal("addAccount")
        if (isDeleteClientOpen) closeModal("deleteClient")
        if (isLogoutOpen) closeModal("logout")
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isAddEmployeeOpen, isAddClientOpen, isAddAccountOpen, isDeleteClientOpen, isLogoutOpen, searchTerm])

  const closeModal = (modalType) => {
    setModalClosing((prev) => ({ ...prev, [modalType]: true }))

    setTimeout(() => {
      switch (modalType) {
        case "addEmployee":
          setIsAddEmployeeOpen(false)
          break
        case "addClient":
          setIsAddClientOpen(false)
          break
        case "addAccount":
          setIsAddAccountOpen(false)
          break
        case "deleteClient":
          setIsDeleteClientOpen(false)
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

  // Generate IBAN starting with LT817044
  const generateIBAN = () => {
    const prefix = "LT817044"
    const randomDigits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("")
    return prefix + randomDigits
  }

  // Get date of birth from personal code
  const getDateOfBirthFromPersonalCode = (personalCode) => {
    if (personalCode.length !== 11) return ""
    const century = personalCode[0]
    const year = personalCode.substring(1, 3)
    const month = personalCode.substring(3, 5)
    const day = personalCode.substring(5, 7)
    let fullYear

    if (century === "1" || century === "2") fullYear = "18" + year
    else if (century === "3" || century === "4") fullYear = "19" + year
    else if (century === "5" || century === "6") fullYear = "20" + year
    else return ""

    return `${fullYear}-${month}-${day}`
  }

  // Filter and search logic with phone number search
  const filteredData = useMemo(() => {
    let filtered = data

    if (activeFilter === "clients") {
      filtered = filtered.filter((person) => person?.marketingConsent !== undefined)
    } else if (activeFilter === "employees") {
      filtered = filtered.filter((person) => person?.marketingConsent === undefined)
    }

    // Apply search filter including phone numbers
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()

      filtered = filtered.filter((person) => {
        const nameMatch =
          (person.firstName?.toLowerCase() ?? "").includes(lowerSearch) ||
          (person.lastName?.toLowerCase() ?? "").includes(lowerSearch)
        const codeMatch = (person.personalCode?.toLowerCase() ?? "").includes(lowerSearch)
        const docMatch = (person.docNumber?.toLowerCase() ?? "").includes(lowerSearch)
        const phoneMatch = (person.phoneNumber?.replace(/\s+/g, "") ?? "").includes(searchTerm.replace(/\s+/g, ""))

        return nameMatch || codeMatch || docMatch || phoneMatch
      })
    }

    return filtered
  }, [searchTerm, activeFilter, data])

  // Highlight search terms in text
  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !text) return text

    const regex = new RegExp(`(${searchTerm})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="highlight-search">
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  const handlePersonClick = (person) => {
    setSelectedPerson(person)
  }

  const togglePasswordVisibility = (id, visible) => {
    setShowPassword((prev) => ({
      ...prev,
      [id]: visible,
    }))
  }

  const toggleCrmExpansion = (entryId) => {
    setExpandedCrmEntries((prev) => ({
      ...prev,
      [entryId]: !prev[entryId],
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
      })

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
  const validateEmployeeForm = () => {
    const newErrors = {}

    if (!employeeFormData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!employeeFormData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!employeeFormData.email.trim()) newErrors.email = "Email is required"
    if (!employeeFormData.username.trim()) newErrors.username = "Username is required"
    if (!employeeFormData.password.trim()) newErrors.password = "Password is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateClientForm = () => {
    const newErrors = {}

    if (!clientFormData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!clientFormData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!clientFormData.personalCode.trim()) newErrors.personalCode = "Personal code is required"
    if (!clientFormData.email.trim()) newErrors.email = "Email is required"
    if (!clientFormData.phone.trim()) newErrors.phone = "Phone is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateAccountForm = () => {
    const newErrors = {}

    if (!accountFormData.iban.trim()) newErrors.iban = "IBAN is required"
    if (!accountFormData.balance.trim()) newErrors.balance = "Balance is required"

    // Check currency limits
    if (selectedPerson && accountFormData.currency !== "EUR") {
      const existingCurrencyAccounts =
        selectedPerson.accounts?.filter((acc) => acc.currency === accountFormData.currency) || []
      if (existingCurrencyAccounts.length >= 1) {
        newErrors.currency = `Only one ${accountFormData.currency} account allowed per client`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEmployeeSubmit = (e) => {
    e.preventDefault()
    if (!validateEmployeeForm()) return

    const newEmployee = {
      id: (data.length + 1).toString(),
      type: "employee",
      ...employeeFormData,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setData((prev) => [...prev, newEmployee])
    setEmployeeFormData({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
    })
    setErrors({})
    closeModal("addEmployee")
    setTimeout(() => {
      showSuccess("Employee created successfully!")
    }, 200)
  }

  const handleClientSubmit = (e) => {
    e.preventDefault()
    if (!validateClientForm()) return

    const newClient = {
      id: (data.length + 1).toString(),
      type: "client",
      ...clientFormData,
      dateOfBirth: getDateOfBirthFromPersonalCode(clientFormData.personalCode),
      accounts: [],
      crmEntries: [],
      marketingConsent: clientFormData.marketingConsent,
    }

    setData((prev) => [...prev, newClient])
    setClientFormData({
      firstName: "",
      lastName: "",
      personalCode: "",
      email: "",
      phone: "",
      phoneCountryCode: "+370",
      secondPhone: "",
      secondPhoneCountryCode: "+370",
      documentType: "ID Card",
      documentNumber: "",
      documentExpiry: "",
      dateOfBirth: "",
      registrationCountry: "",
      registrationRegion: "",
      registrationCity: "",
      registrationStreet: "",
      registrationHouse: "",
      registrationApartment: "",
      registrationPostalCode: "",
      correspondenceCountry: "",
      correspondenceRegion: "",
      correspondenceCity: "",
      correspondenceStreet: "",
      correspondenceHouse: "",
      correspondenceApartment: "",
      correspondencePostalCode: "",
      marketingConsent: false,
    })
    setErrors({})
    closeModal("addClient")
    setTimeout(() => {
      setSelectedPerson(newClient)
      showSuccess("Client created successfully!")
    }, 200)
  }

  const handleAccountSubmit = (e) => {
    e.preventDefault()
    if (!validateAccountForm()) return

    const newAccount = {
      id: `acc${selectedPerson.accounts ? selectedPerson.accounts.length + 1 : 1}`,
      ...accountFormData,
      balance: Number.parseFloat(accountFormData.balance),
    }

    const updatedPerson = {
      ...selectedPerson,
      accounts: [...(selectedPerson.accounts || []), newAccount],
    }

    setData((prev) => prev.map((person) => (person.id === selectedPerson.id ? updatedPerson : person)))
    setSelectedPerson(updatedPerson)
    setAccountFormData({
      iban: "",
      currency: "EUR",
      balance: "",
      cardType: "none",
      servicePlan: "Standard",
      openingDate: new Date().toISOString().split("T")[0],
    })
    setErrors({})
    closeModal("addAccount")
    setTimeout(() => {
      showSuccess("Account created successfully!")
    }, 200)
  }

  const handleDeleteClient = () => {
    if (!selectedPerson) return

    setData((prev) => prev.filter((person) => person.id !== selectedPerson.id))
    setSelectedPerson(null)
    closeModal("deleteClient")
    setTimeout(() => {
      showSuccess("Client deleted successfully!")
    }, 200)
  }

  const deleteCrmEntry = (entryId) => {
    if (!selectedPerson) return

    const updatedPerson = {
      ...selectedPerson,
      crmEntries: selectedPerson.crmEntries?.filter((entry) => entry.id !== entryId) || [],
    }

    setData((prev) => prev.map((person) => (person.id === selectedPerson.id ? updatedPerson : person)))
    setSelectedPerson(updatedPerson)
    showSuccess("CRM entry deleted successfully!")
  }

  const canDeleteCrmEntry = (entry) => {
    return entry.employeeName === currentUser?.username
  }

  const renderPersonList = () => {
    return filteredData.map((person) => (
      <div
        key={person.id}
        className={`user-card ${selectedPerson?.id === person.id ? "selected" : ""}`}
        onClick={() => handlePersonClick(person)}
      >
        <div className="user-card-content">
          <div className={`user-icon ${person.marketingConsent !== undefined ? "client" : "employee"}`}>
            {person.marketingConsent !== undefined ? <User size={20} /> : <Briefcase size={20} />}
          </div>
          <div className="user-info">
            <div className="user-header">
              <h3 className="user-name">{highlightText(`${person.firstName} ${person.lastName}`, searchTerm)}</h3>
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
          {selectedPerson.type === "client" && (
            <button className="delete-client-button" onClick={() => setIsDeleteClientOpen(true)} title="Delete Client">
              <Trash2 size={16} />
            </button>
          )}
        </div>

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
                </div>
                <div className="info-item">
                  <div className="info-label">Email</div>
                  <div className="info-value">{selectedPerson.email}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Password</div>
                  <div className="password-container">
                    <span className="password-value">{selectedPerson.password}</span>
                    <button
                      className="copy-button"
                      onClick={() => {
                        const credentials = `Username: ${selectedPerson.username}\nPassword: ${selectedPerson.password}`
                        navigator.clipboard.writeText(credentials)
                        showSuccess("Credentials copied!")
                      }}
                      title="Copy credentials"
                    >
                      <Copy size={16} />
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
            {selectedPerson.type === "client" && (
              <div className="contact-item">
                <Phone className="contact-icon" />
                <span>{selectedPerson.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bank Accounts for clients - moved to top */}
        {selectedPerson.marketingConsent !== undefined && (
          <div className="info-card">
            <div className="card-header">
              <h3 className="card-title">
                <CreditCard size={16} />
                Bank Accounts
              </h3>
              <button className="add-account-button" onClick={() => setIsAddAccountOpen(true)}>
                <Plus size={14} />
                Add Account
              </button>
            </div>
            <div className="card-content">
              {selectedPerson.accounts && selectedPerson.accounts.length > 0 ? (
                selectedPerson.accounts.map((account) => (
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
                      <div className="account-detail">
                        <div className="info-label">Card Type</div>
                        <div className="info-value">
                          {account.cardType === "none"
                            ? "No Card"
                            : account.cardType === "Debeto"
                              ? "Debit Card"
                              : "Credit Card"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <CreditCard className="no-data-icon" />
                  <p className="no-data-text">No accounts found</p>
                </div>
              )}
            </div>
          </div>
        )}
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

        <div className="crm-entries">
          {selectedPerson.crmEntries && selectedPerson.crmEntries.length > 0 ? (
            selectedPerson.crmEntries.map((entry) => (
              <div key={entry.id} className="crm-entry">
                <div className="crm-entry-header">
                  <div className="crm-entry-title" onClick={() => toggleCrmExpansion(entry.id)}>
                    {expandedCrmEntries[entry.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span className="crm-entry-badge">{entry.contactType}</span>
                    <span className="crm-entry-meta">{entry.date}</span>
                    <span className="crm-entry-meta">by {entry.employeeName}</span>
                  </div>
                  {canDeleteCrmEntry(entry) && (
                    <button
                      className="delete-crm-button"
                      onClick={() => deleteCrmEntry(entry.id)}
                      title="Delete CRM entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                {expandedCrmEntries[entry.id] && <p className="crm-entry-content">{entry.content}</p>}
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
          <CheckCircle size={20} />
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
              placeholder="Search users, phone numbers..."
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

      {/* Middle Panel */}
      <div className="middle-panel">
        <div className="middle-content">
          <h2 className="panel-title">Personal Information</h2>
          {renderPersonalInfo()}
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel">{renderCRMRequests()}</div>

      {/* All Modals */}

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
              <form onSubmit={handleEmployeeSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      className={`form-input ${errors.firstName ? "error" : ""}`}
                      value={employeeFormData.firstName}
                      onChange={(e) => setEmployeeFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      className={`form-input ${errors.lastName ? "error" : ""}`}
                      value={employeeFormData.lastName}
                      onChange={(e) => setEmployeeFormData((prev) => ({ ...prev, lastName: e.target.value }))}
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
                    value={employeeFormData.email}
                    onChange={(e) => setEmployeeFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email"
                  />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>
                <div className="form-group">
                <label className="form-label">Username (Auto-generated)</label>
                <div className="username-container">
                  <input
                    className="form-input"
                    value={employeeFormData.username}
                    disabled 
                  />
                </div>
              </div>

                <div className="form-group">
                  <label className="form-label">Password (Auto-generated)</label>
                  <div className="password-container">
                    <input
                      type="text"
                      className="form-input"
                      value={employeeFormData.password}
                      onChange={(e) => setEmployeeFormData((prev) => ({ ...prev, password: e.target.value }))}
                      disabled
                    />
                    <button
                      type="button"
                      className="copy-button"
                      onClick={copyCredentials}
                      title="Copy username and password"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
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

      {/* Add Client Modal */}
      {isAddClientOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal("addClient")}>
          <div
            className={`modal-content large-modal ${modalClosing.addClient ? "closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                <User size={20} color="#8b5cf6" />
                Create New Client
              </h3>
              <button className="modal-close" onClick={() => closeModal("addClient")}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleClientSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      className={`form-input ${errors.firstName ? "error" : ""}`}
                      value={clientFormData.firstName}
                      onChange={(e) => setClientFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      className={`form-input ${errors.lastName ? "error" : ""}`}
                      value={clientFormData.lastName}
                      onChange={(e) => setClientFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Personal Code *</label>
                    <input
                      className={`form-input ${errors.personalCode ? "error" : ""}`}
                      value={clientFormData.personalCode}
                      onChange={(e) => {
                        const value = e.target.value
                        setClientFormData((prev) => ({
                          ...prev,
                          personalCode: value,
                          dateOfBirth: getDateOfBirthFromPersonalCode(value),
                        }))
                      }}
                      placeholder="Enter 11-digit personal code"
                    />
                    {errors.personalCode && <div className="error-message">{errors.personalCode}</div>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className={`form-input ${errors.email ? "error" : ""}`}
                    value={clientFormData.email}
                    onChange={(e) => setClientFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email"
                  />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <div className="phone-input-group">
                      <select
                        className="country-code-select"
                        value={clientFormData.phoneCountryCode}
                        onChange={(e) => setClientFormData((prev) => ({ ...prev, phoneCountryCode: e.target.value }))}
                      >
                        <option value="+370">+370 (LT)</option>
                        <option value="+1">+1 (US)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+49">+49 (DE)</option>
                        <option value="+33">+33 (FR)</option>
                        <option value="+39">+39 (IT)</option>
                        <option value="+34">+34 (ES)</option>
                        <option value="+48">+48 (PL)</option>
                      </select>
                      <input
                        className={`form-input ${errors.phone ? "error" : ""}`}
                        value={clientFormData.phone}
                        onChange={(e) => setClientFormData((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="Phone number"
                      />
                    </div>
                    {errors.phone && <div className="error-message">{errors.phone}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Second Phone (Optional)</label>
                    <div className="phone-input-group">
                      <select
                        className="country-code-select"
                        value={clientFormData.secondPhoneCountryCode}
                        onChange={(e) =>
                          setClientFormData((prev) => ({ ...prev, secondPhoneCountryCode: e.target.value }))
                        }
                      >
                        <option value="+370">+370 (LT)</option>
                        <option value="+1">+1 (US)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+49">+49 (DE)</option>
                        <option value="+33">+33 (FR)</option>
                        <option value="+39">+39 (IT)</option>
                        <option value="+34">+34 (ES)</option>
                        <option value="+48">+48 (PL)</option>
                      </select>
                      <input
                        className="form-input"
                        value={clientFormData.secondPhone}
                        onChange={(e) => setClientFormData((prev) => ({ ...prev, secondPhone: e.target.value }))}
                        placeholder="Second phone number"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth (Auto-filled from Personal Code)</label>
                  <input type="date" className="form-input readonly" value={clientFormData.dateOfBirth} readOnly />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Document Type *</label>
                    <select
                      className={`form-input ${errors.documentType ? "error" : ""}`}
                      value={clientFormData.documentType}
                      onChange={(e) => setClientFormData((prev) => ({ ...prev, documentType: e.target.value }))}
                    >
                      <option value="ID Card">ID Card</option>
                      <option value="passport">Passport</option>
                      <option value="driver_license">Driver's License</option>
                    </select>
                    {errors.documentType && <div className="error-message">{errors.documentType}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Document Number *</label>
                    <input
                      className={`form-input ${errors.documentNumber ? "error" : ""}`}
                      value={clientFormData.documentNumber}
                      onChange={(e) => setClientFormData((prev) => ({ ...prev, documentNumber: e.target.value }))}
                      placeholder="Enter document number"
                    />
                    {errors.documentNumber && <div className="error-message">{errors.documentNumber}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Document Expiry *</label>
                    <input
                      type="date"
                      className={`form-input ${errors.documentExpiry ? "error" : ""}`}
                      value={clientFormData.documentExpiry}
                      onChange={(e) => setClientFormData((prev) => ({ ...prev, documentExpiry: e.target.value }))}
                    />
                    {errors.documentExpiry && <div className="error-message">{errors.documentExpiry}</div>}
                  </div>
                </div>

                <h4 style={{ margin: "24px 0 16px 0", color: "#374151", fontSize: "16px", fontWeight: "600" }}>
                  Registration Address
                </h4>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Country *</label>
                    <input
                      className={`form-input ${errors.registrationCountry ? "error" : ""}`}
                      value={clientFormData.registrationCountry}
                      onChange={(e) => setClientFormData((prev) => ({ ...prev, registrationCountry: e.target.value }))}
                      placeholder="Enter country"
                    />
                    {errors.registrationCountry && <div className="error-message">{errors.registrationCountry}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Region *</label>
                    <input
                      className={`form-input ${errors.registrationRegion ? "error" : ""}`}
                      value={clientFormData.registrationRegion}
                      onChange={(e) => setClientFormData((prev) => ({ ...prev, registrationRegion: e.target.value }))}
                      placeholder="Enter region"
                    />
                    {errors.registrationRegion && <div className="error-message">{errors.registrationRegion}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      className={`form-input ${errors.registrationCity ? "error" : ""}`}
                      value={clientFormData.registrationCity}
                      onChange={(e) => setClientFormData((prev) => ({ ...prev, registrationCity: e.target.value }))}
                      placeholder="Enter city"
                    />
                    {errors.registrationCity && <div className="error-message">{errors.registrationCity}</div>}
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Street *</label>
                    <input
                      className={`form-input ${errors.registrationStreet ? "error" : ""}`}
                      value={clientFormData.registrationStreet}
                      onChange={(e) => setClientFormData((prev) => ({ ...prev, registrationStreet: e.target.value }))}
                      placeholder="Enter street"
                    />
                    {errors.registrationStreet && <div className="error-message">{errors.registrationStreet}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">House Number *</label>
                    <input
                      className={`form-input ${errors.registrationHouse ? "error" : ""}`}
                      value={clientFormData.registrationHouse}
                      onChange={(e) => setClientFormData((prev) => ({ ...prev, registrationHouse: e.target.value }))}
                      placeholder="Enter house number"
                    />
                    {errors.registrationHouse && <div className="error-message">{errors.registrationHouse}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Apartment</label>
                    <input
                      className="form-input"
                      value={clientFormData.registrationApartment}
                      onChange={(e) =>
                        setClientFormData((prev) => ({ ...prev, registrationApartment: e.target.value }))
                      }
                      placeholder="Enter apartment number"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Postal Code *</label>
                  <input
                    className={`form-input ${errors.registrationPostalCode ? "error" : ""}`}
                    value={clientFormData.registrationPostalCode}
                    onChange={(e) => setClientFormData((prev) => ({ ...prev, registrationPostalCode: e.target.value }))}
                    placeholder="Enter postal code"
                  />
                  {errors.registrationPostalCode && (
                    <div className="error-message">{errors.registrationPostalCode}</div>
                  )}
                </div>

                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    id="sameAsRegistration"
                    checked={sameAsRegistration}
                    onChange={(e) => setSameAsRegistration(e.target.checked)}
                  />
                  <label htmlFor="sameAsRegistration">Correspondence address same as registration</label>
                </div>

                {!sameAsRegistration && (
                  <>
                    <h4 style={{ margin: "24px 0 16px 0", color: "#374151", fontSize: "16px", fontWeight: "600" }}>
                      Correspondence Address
                    </h4>

                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Country *</label>
                        <input
                          className={`form-input ${errors.correspondenceCountry ? "error" : ""}`}
                          value={clientFormData.correspondenceCountry}
                          onChange={(e) =>
                            setClientFormData((prev) => ({ ...prev, correspondenceCountry: e.target.value }))
                          }
                          placeholder="Enter country"
                        />
                        {errors.correspondenceCountry && (
                          <div className="error-message">{errors.correspondenceCountry}</div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Region *</label>
                        <input
                          className={`form-input ${errors.correspondenceRegion ? "error" : ""}`}
                          value={clientFormData.correspondenceRegion}
                          onChange={(e) =>
                            setClientFormData((prev) => ({ ...prev, correspondenceRegion: e.target.value }))
                          }
                          placeholder="Enter region"
                        />
                        {errors.correspondenceRegion && (
                          <div className="error-message">{errors.correspondenceRegion}</div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">City *</label>
                        <input
                          className={`form-input ${errors.correspondenceCity ? "error" : ""}`}
                          value={clientFormData.correspondenceCity}
                          onChange={(e) =>
                            setClientFormData((prev) => ({ ...prev, correspondenceCity: e.target.value }))
                          }
                          placeholder="Enter city"
                        />
                        {errors.correspondenceCity && <div className="error-message">{errors.correspondenceCity}</div>}
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Street *</label>
                        <input
                          className={`form-input ${errors.correspondenceStreet ? "error" : ""}`}
                          value={clientFormData.correspondenceStreet}
                          onChange={(e) =>
                            setClientFormData((prev) => ({ ...prev, correspondenceStreet: e.target.value }))
                          }
                          placeholder="Enter street"
                        />
                        {errors.correspondenceStreet && (
                          <div className="error-message">{errors.correspondenceStreet}</div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">House Number *</label>
                        <input
                          className={`form-input ${errors.correspondenceHouse ? "error" : ""}`}
                          value={clientFormData.correspondenceHouse}
                          onChange={(e) =>
                            setClientFormData((prev) => ({ ...prev, correspondenceHouse: e.target.value }))
                          }
                          placeholder="Enter house number"
                        />
                        {errors.correspondenceHouse && (
                          <div className="error-message">{errors.correspondenceHouse}</div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Apartment</label>
                        <input
                          className="form-input"
                          value={clientFormData.correspondenceApartment}
                          onChange={(e) =>
                            setClientFormData((prev) => ({ ...prev, correspondenceApartment: e.target.value }))
                          }
                          placeholder="Enter apartment number"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Postal Code *</label>
                      <input
                        className={`form-input ${errors.correspondencePostalCode ? "error" : ""}`}
                        value={clientFormData.correspondencePostalCode}
                        onChange={(e) =>
                          setClientFormData((prev) => ({ ...prev, correspondencePostalCode: e.target.value }))
                        }
                        placeholder="Enter postal code"
                      />
                      {errors.correspondencePostalCode && (
                        <div className="error-message">{errors.correspondencePostalCode}</div>
                      )}
                    </div>
                  </>
                )}

                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    id="marketingConsent"
                    checked={clientFormData.marketingConsent}
                    onChange={(e) => setClientFormData((prev) => ({ ...prev, marketingConsent: e.target.checked }))}
                  />
                  <label htmlFor="marketingConsent">Marketing consent</label>
                </div>

                <div className="form-actions">
                  <button type="button" className="button-secondary" onClick={() => closeModal("addClient")}>
                    Cancel
                  </button>
                  <button type="submit" className="button-primary">
                    Create Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {isAddAccountOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal("addAccount")}>
          <div
            className={`modal-content ${modalClosing.addAccount ? "closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                <CreditCard size={20} color="#8b5cf6" />
                Create New Account
              </h3>
              <button className="modal-close" onClick={() => closeModal("addAccount")}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAccountSubmit}>
                <div className="form-group">
                  <label className="form-label">IBAN *</label>
                  <div className="iban-input-group">
                    <input
                      className={`form-input ${errors.iban ? "error" : ""}`}
                      value={accountFormData.iban}
                      onChange={(e) => setAccountFormData((prev) => ({ ...prev, iban: e.target.value }))}
                      placeholder="LT817044..."
                    />
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => setAccountFormData((prev) => ({ ...prev, iban: generateIBAN() }))}
                    >
                      Generate
                    </button>
                  </div>
                  {errors.iban && <div className="error-message">{errors.iban}</div>}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Currency *</label>
                    <select
                      className={`form-input ${errors.currency ? "error" : ""}`}
                      value={accountFormData.currency}
                      onChange={(e) => setAccountFormData((prev) => ({ ...prev, currency: e.target.value }))}
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                      <option value="PLN">PLN</option>
                    </select>
                    {errors.currency && <div className="error-message">{errors.currency}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Balance *</label>
                    <input
                      type="number"
                      step="0.01"
                      className={`form-input ${errors.balance ? "error" : ""}`}
                      value={accountFormData.balance}
                      onChange={(e) => setAccountFormData((prev) => ({ ...prev, balance: e.target.value }))}
                      placeholder="0.00"
                    />
                    {errors.balance && <div className="error-message">{errors.balance}</div>}
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Service Plan *</label>
                    <select
                      className="form-input"
                      value={accountFormData.servicePlan}
                      onChange={(e) => setAccountFormData((prev) => ({ ...prev, servicePlan: e.target.value }))}
                    >
                      <option value="Jaunimo">Jaunimo</option>
                      <option value="Standard">Standard</option>
                      <option value="Gold">Gold</option>
                      <option value="Investment">Investment</option>
                      <option value="Loan">Loan</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Card Type</label>
                    <select
                      className="form-input"
                      value={accountFormData.cardType}
                      onChange={(e) => setAccountFormData((prev) => ({ ...prev, cardType: e.target.value }))}
                      disabled={!["Jaunimo", "Standard", "Gold"].includes(accountFormData.servicePlan)}
                    >
                      <option value="none">No Card</option>
                      {["Jaunimo", "Standard", "Gold"].includes(accountFormData.servicePlan) && (
                        <>
                          <option value="Debeto">Debit Card</option>
                          <option value="Kredito">Credit Card</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Opening Date</label>
                  <input type="date" className="form-input readonly" value={accountFormData.openingDate} readOnly />
                </div>

                <div className="form-actions">
                  <button type="button" className="button-secondary" onClick={() => closeModal("addAccount")}>
                    Cancel
                  </button>
                  <button type="submit" className="button-primary">
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Client Modal */}
      {isDeleteClientOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal("deleteClient")}>
          <div
            className={`modal-content ${modalClosing.deleteClient ? "closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                <Trash2 size={20} color="#ef4444" />
                Delete Client
              </h3>
              <button className="modal-close" onClick={() => closeModal("deleteClient")}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p className="delete-warning">
                Are you sure you want to delete {selectedPerson?.firstName} {selectedPerson?.lastName}? This action
                cannot be undone and will remove all associated accounts and CRM data.
              </p>
              <div className="form-actions">
                <button type="button" className="button-secondary" onClick={() => closeModal("deleteClient")}>
                  Cancel
                </button>
                <button type="button" className="button-danger" onClick={handleDeleteClient}>
                  <Trash2 size={16} style={{ marginRight: "8px" }} />
                  Delete Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
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
    </div>
  )
}
