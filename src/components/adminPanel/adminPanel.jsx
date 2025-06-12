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
  Plus,
  Phone,
  FileText,
  Trash2,
  ChevronDown,
  ChevronRight,
  MapPin,
  Shield,
  Building,
  Clock,
  UserCheck,
  AlertCircle,
} from "lucide-react"
import "./adminPanel.css"
import { getServerLink } from "@/server_link"
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export default function AdminPanel({ data: initialData, currentUser }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("")
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [isDeleteEmployeeOpen, setIsDeleteEmployeeOpen] = useState(false)
  const [deletingEmployee, setDeletingEmployee] = useState(null)



  // Track mouse down position to distinguish clicks from drags
  const [mouseDownTarget, setMouseDownTarget] = useState(null)

  // Handle mouse down on modal overlay
  const handleModalMouseDown = (e) => {
    if (e.target === e.currentTarget) {
      setMouseDownTarget(e.target)
    } else {
      setMouseDownTarget(null)
    }
  }


   function formatPhoneNumber(input, defaultCountry = 'LT') {
    if (!input) return '';

  const phoneNumber = parsePhoneNumberFromString(input, defaultCountry);

  if (!phoneNumber || !phoneNumber.isValid()) return input; // fallback to raw input

  return phoneNumber.formatInternational(); // always returns in +XXX format
}


  // Handle mouse up on modal overlay - only close if it's the same target as mouse down
  const handleModalMouseUp = (e, modalType) => {
    if (e.target === e.currentTarget && e.target === mouseDownTarget) {
      closeModal(modalType)
    }
    setMouseDownTarget(null)
  }

  // Search input ref for focus management
  const searchInputRef = useRef(null)

  const selectedClientRef = useRef(null)

  const merged = [...(initialData?.clients || []), ...(initialData?.employees || [])]
  const [data, setData] = useState(merged)
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [isDeleteClientOpen, setIsDeleteClientOpen] = useState(false)
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [successClosing, setSuccessClosing] = useState(false)
  const [expandedCrmEntries, setExpandedCrmEntries] = useState({})
  const [closingCrmEntry, setClosingCrmEntry] = useState(null)


// In AdminPanel.jsx
useEffect(() => {
  if (selectedPerson) {
    const type = selectedPerson.marketingConsent !== undefined ? "clients" : "employees";
    localStorage.setItem(
      "lastSelectedPerson",
      JSON.stringify({ id: selectedPerson.id, type: type })
    );
  } 
}, [selectedPerson]);

useEffect(() => {
  const storedPerson = localStorage.getItem("lastSelectedPerson");
  if (storedPerson && data.length > 0) {
    try {
      const { id, type } = JSON.parse(storedPerson);
      setActiveFilter(type);
      console.log(type)
      setSelectedPerson(null);
      const foundPerson = data.find(
        (person) =>
          String(person.id) === String(id) &&
          ((person.marketingConsent !== undefined) ||
            (person.marketingConsent === undefined))
      );
      if (foundPerson) {
        setSelectedPerson(foundPerson);
      }
    } catch (error) {
      console.error("Failed to parse lastSelectedPerson from localStorage", error);
      localStorage.removeItem("lastSelectedPerson"); // Clear invalid data
    }
  }
}, [data]);


  // Automatically scroll the client list to the selected client
  useEffect(() => {
    if (selectedClientRef.current) {
      selectedClientRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, [selectedPerson]);



  useEffect(() => {
    if (closingCrmEntry) {
      const timer = setTimeout(() => setClosingCrmEntry(null), 400)
      return () => clearTimeout(timer)
    }
  }, [closingCrmEntry])

  // Modal closing states
  const [modalClosing, setModalClosing] = useState({
    addEmployee: false,
    addClient: false,
    addAccount: false,
    deleteClient: false,
    logout: false,
    deleteEmployee: false,
  })

  // Employee form state with auto-generation
  const [employeeFormData, setEmployeeFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
  })


  const [errors, setErrors] = useState({})

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
      triggerSuccess("Credentials copied to clipboard!")
    })
  }

  // Enhanced escape key handling
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        // Always clear search text first if it exists, regardless of focus
        if (searchTerm) {
          setSearchTerm("")
          return
        }

        // If search is empty and search input is focused, blur it
        if (document.activeElement === searchInputRef.current) {
          searchInputRef.current.blur()
          return
        }

        // Handle modal escapes
        if (isAddEmployeeOpen) closeModal("addEmployee")
        if (isAddClientOpen) closeModal("addClient")
        if (isAddAccountOpen) closeModal("addAccount")
        if (isDeleteClientOpen) closeModal("deleteClient")
        if (isLogoutOpen) closeModal("logout")
        if (isDeleteEmployeeOpen) closeModal("deleteEmployee")
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [
    isAddEmployeeOpen,
    isAddClientOpen,
    isAddAccountOpen,
    isDeleteClientOpen,
    isLogoutOpen,
    searchTerm,
    isDeleteEmployeeOpen,
  ])

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
        case "deleteEmployee":
          setIsDeleteEmployeeOpen(false)
          setDeletingEmployee(null)
          break
      }
      setModalClosing((prev) => ({ ...prev, [modalType]: false }))
    }, 200)
  }

  // Show success message with auto-dismiss
  const triggerSuccess = (message) => {
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
          ((person.firstName || person.first_name)?.toString().toLowerCase() ?? "").includes(lowerSearch) ||
          ((person.lastName || person.last_name)?.toString().toLowerCase() ?? "").includes(lowerSearch)
        const codeMatch = (person.personalCode?.toString().toLowerCase() ?? "").includes(lowerSearch)
        const docMatch = (person.docNumber?.toString().toLowerCase() ?? "").includes(lowerSearch)
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

  const toggleCrmExpansion = (entryId) => {
    setExpandedCrmEntries((prev) => {
      const isOpen = prev[entryId]
      const openId = Object.keys(prev)[0]
      const newState = {}
      if (isOpen) {
        setClosingCrmEntry(entryId)
        return newState
      }
      if (openId && openId !== entryId) {
        setClosingCrmEntry(openId)
      }
      newState[entryId] = true
      return newState
    })
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

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault()
    if (!validateEmployeeForm()) return

    const employeeDataForBody = {
      first_name: employeeFormData.firstName,
      last_name: employeeFormData.lastName,
      username: employeeFormData.username,
      password: employeeFormData.password,
      email: employeeFormData.email,
    }

    try {
      const response = await fetch(`${getServerLink()}/createEmployee`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeDataForBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      if (response.ok) {
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
          triggerSuccess("Employee created successfully!")
        }, 200)
      }
    } catch (error) {
      console.error("Error creating employee:", error)
      setTimeout(() => {
        triggerSuccess(`Error creating employee: ${error.message}`)
      }, 200)
    }
  }

  const handleDeleteClient = async () => {
    if (!selectedPerson) return

    try {
      const response = await fetch(`${getServerLink()}/deleteClient`, {
        method: "POST", // Changed method to POST
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ personal_code: selectedPerson.personalCode }), // Added request body
      })

      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      // You might want to check `result` to see if the employee was actually created on the server
      // For example, if the server returns a success field or the created employee data.
      if (response.ok) {
        setTimeout(() => {
          triggerSuccess("Client deleted successfully!")
        }, 200)
        setData((prev) => {
          const updated = prev.filter((person) => person.id !== selectedPerson.id)
          if (updated.length > 0) {
            setSelectedPerson(updated[0])
            localStorage.setItem("lastSelectedPersonId", updated[0].id)
          } else {
            setSelectedPerson(null)
            localStorage.removeItem("lastSelectedPersonId")
          }
          return updated
        })

      } else {
        // Handle cases where the server indicates a failure even with a 200 OK status
        const result = await response.json()
        throw new Error(result.message || "Failed to create employee on server.")
      }
    } catch (error) {
      console.error("Error deleting client:", error)
      // You might want to show an error message to the user
      setTimeout(() => {
        console.error(`Error deleting client: ${error.message}`)
      }, 200)
    }

    setData((prev) => prev.filter((person) => person.id !== selectedPerson.id))

    // Clear the selected person
    setSelectedPerson(null)

    // Close the modal
    closeModal("deleteClient")

  }

  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return
    try {
      const response = await fetch(`${getServerLink()}/deleteEmployee`, {
        method: "POST", // Changed method to POST
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: deletingEmployee.username }), // Added request body
      })
      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      // You might want to check `result` to see if the employee was actually created on the server
      // For example, if the server returns a success field or the created employee data.
      if (response.ok) {
        setTimeout(() => {
          triggerSuccess("Employee deleted successfully!")
        }, 200)

      } else {
        // Handle cases where the server indicates a failure even with a 200 OK status
        const result = await response.json()
        throw new Error(result.message || "Failed to create employee on server.")
      }
    } catch (error) {
      console.error("Error deleting employee:", error)
      // You might want to show an error message to the user
      setTimeout(() => {
        console.error(`Error deleting employee: ${error.message}`)
      }, 200)
    }

    setData((prev) => prev.filter((person) => person.id !== deletingEmployee.id))
    if (selectedPerson && selectedPerson.id === deletingEmployee.id) {
      setSelectedPerson(null)
    }
    closeModal("deleteEmployee")
  }

  const deleteCrmEntry = (entryId) => {
    if (!selectedPerson) return

    const updatedPerson = {
      ...selectedPerson,
      crmEntries: selectedPerson.crmEntries?.filter((entry) => entry.id !== entryId) || [],
    }

    setData((prev) => prev.map((person) => (person.id === selectedPerson.id ? updatedPerson : person)))
    setSelectedPerson(updatedPerson)
    triggerSuccess("CRM entry deleted successfully!")
  }

  const canDeleteCrmEntry = (entry) => {
    return (entry.employeeName|| entry.username) === currentUser?.username
  }

  const renderPersonList = () => {
    return filteredData.map((person) => (
      <div
        key={`${person.username}-${person.id}`}
        className={`user-card ${selectedPerson?.id === person.id ? "selected" : ""}`}
        onClick={() => handlePersonClick(person)}
        ref={selectedPerson?.id === person.id ? selectedClientRef : null}
      >
        <div className="user-card-content">
          <div className={`user-icon ${person.marketingConsent !== undefined ? "client" : "employee"}`}>
            {person.marketingConsent !== undefined ? <User size={20} /> : <Briefcase size={20} />}
          </div>
          <div className="user-info">
            <div className="user-header">
              <h3 className="user-name">
                {highlightText(
                  `${person.firstName || person.first_name || ""} ${person.lastName || person.last_name || ""}`,
                  searchTerm,
                )}
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

    const isClient = selectedPerson.marketingConsent !== undefined
    const isEmployee = selectedPerson.marketingConsent === undefined

    return (
      <div>
        <div className="profile-header">
          <div className="profile-avatar">
            {isEmployee ? <Briefcase size={24} color="white" /> : <User size={24} color="white" />}
          </div>
          <div className="profile-info">
            <h2>
              {selectedPerson.firstName || selectedPerson.first_name || ""}{" "}
              {selectedPerson.lastName || selectedPerson.last_name || ""}
            </h2>
            <p>{isClient ? "client" : "employee"}</p>
          </div>
          {isClient && (
            <button className="delete-client-button" onClick={() => setIsDeleteClientOpen(true)} title="Delete Client">
              <Trash2 size={16} />
            </button>
          )}
          {isEmployee && (
            <button
              className="delete-client-button"
              onClick={() => {
                setDeletingEmployee(selectedPerson)
                setIsDeleteEmployeeOpen(true)
              }}
              title="Delete Employee"
            >
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
            {isEmployee ? (
              <>
                <div className="info-item">
                  <div className="info-label">Username</div>
                  <div className="info-value">{selectedPerson.username || "N/A"}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Email</div>
                  <div className="info-value">{selectedPerson.email || "N/A"}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Password</div>
                  <div className="password-container">
                    <span className="password-value">{selectedPerson.password || "N/A"}</span>
                    <button
                      className="copy-button"
                      onClick={() => {
                        const credentials = `Username: ${selectedPerson.username || "N/A"}\nPassword: ${selectedPerson.password || "N/A"}`
                        navigator.clipboard.writeText(credentials)
                        triggerSuccess("Credentials copied!")
                      }}
                      title="Copy credentials"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
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
            )}
          </div>
        </div>

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
          <span>{selectedPerson.email || "N/A"}</span>
        </div>
        {(selectedPerson.phoneNumber || selectedPerson.phone) && (
        <div className="contact-item">
          <Phone className="contact-icon" />
          <div className="contact-text">
            <div className="info-label">Primary Phone</div> {/* Simplified label */}
            <div className="info-value"> {formatPhoneNumber(selectedPerson.phoneNumber || selectedPerson.phone)}</div>
          </div>
        </div>
        )}
        {selectedPerson.otherPhoneNumber && (
          <div className="contact-item">
            <Phone className="contact-icon" />
            <div className="contact-text">
              <div className="info-label">Secondary Phone</div>
              <div className="info-value"> {formatPhoneNumber(selectedPerson.otherPhoneNumber)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
        {/* Bank Accounts for clients */}
        {isClient && (
          <div className="info-card">
            <div className="card-header bank-accounts-header">
              <h3 className="card-title">
                <CreditCard size={16} style={{ marginRight: "6px" }} />
                Bank Accounts
              </h3>
            </div>
            <div className="card-content">
              {selectedPerson.bank_accs && selectedPerson.bank_accs.length > 0 ? (
                selectedPerson.bank_accs.map((account, index) => ( // Add 'index' as a second argument to map
                  <div key={`${account.id}-${index}`} className="account-item">
                    <div className="account-header">
                      <span className="account-iban">{account.iban}</span>
                      <span className="account-badge">{account.currency}</span>
                    </div>
                    <div className="account-details">
                      <div className="account-detail">
                        <div className="info-label">Balance</div>
                        <div className="info-value">
                          {Number(account.balance).toFixed(2)} {account.currency}
                        </div>
                      </div>
                      <div className="account-detail">
                        <div className="info-label">Plan</div>
                        <div className="info-value">{account.plan}</div>
                      </div>
                      <div className="account-detail">
                        <div className="info-label">Card Type</div>
                        <div className="info-value">
                          {account.type === "none"
                            ? "No Card"
                            : account.type === "Debeto"
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



        {/* Additional Client Information */}
        {isClient && (
          <>
            {/* Document Information */}
            <div className="info-card">
              <div className="card-header">
                <h3 className="card-title">
                  <Shield size={16} />
                  Document Information
                </h3>
              </div>
              <div className="card-content">
                <div className="info-item">
                  <div className="info-label">Document Type</div>
                  <div className="info-value">{selectedPerson.docType || selectedPerson.documentType || "N/A"}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Document Number</div>
                  <div className="info-value">{selectedPerson.docNumber || selectedPerson.documentNumber || "N/A"}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Document Expiry</div>
                  <div className="info-value">
                    {selectedPerson.docExpiryDate || selectedPerson.documentExpiry || "N/A"}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Status</div>
                  <div className="info-value" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {(() => {
                      const expiryDate = selectedPerson.docExpiryDate || selectedPerson.documentExpiry
                      if (!expiryDate) return "Unknown"

                      const expiry = new Date(expiryDate)
                      const today = new Date()
                      const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))

                      if (daysUntilExpiry < 0) {
                        return (
                          <>
                            <AlertCircle size={16} color="#ef4444" />
                            <span style={{ color: "#ef4444" }}>Expired</span>
                          </>
                        )
                      } else if (daysUntilExpiry <= 30) {
                        return (
                          <>
                            <AlertCircle size={16} color="#f59e0b" />
                            <span style={{ color: "#f59e0b" }}>Expires in {daysUntilExpiry} days</span>
                          </>
                        )
                      } else {
                        return (
                          <>
                            <CheckCircle size={16} color="#10b981" />
                            <span style={{ color: "#10b981" }}>Valid</span>
                          </>
                        )
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="info-card">
              <div className="card-header">
                <h3 className="card-title">
                  <MapPin size={16} />
                  Address Information
                </h3>
              </div>
              <div className="card-content">
                <div className="address-item">
                  <MapPin className="address-icon" />
                  <div className="address-content">
                    <div className="info-label">Registration Address</div>
                    <div className="info-value">
                      {selectedPerson.regAddress ? (
                        <>
                          <div>
                            {selectedPerson.regAddress.street || "N/A"} {selectedPerson.regAddress.house || "N/A"}
                            {selectedPerson.regAddress.apartment && `, Apt ${selectedPerson.regAddress.apartment}`}
                          </div>
                          <div>
                            {selectedPerson.regAddress.postalCode || "N/A"}{" "}
                            {selectedPerson.regAddress.cityOrVillage || "N/A"}
                          </div>
                          <div>
                            {selectedPerson.regAddress.region || "N/A"}, {selectedPerson.regAddress.country || "N/A"}
                          </div>
                        </>
                      ) : (
                        <div>No registration address</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="address-item">
                  <Building className="address-icon" />
                  <div className="address-content">
                    <div className="info-label">Correspondence Address</div>
                    <div className="info-value">
                      {selectedPerson.corAddress ? (
                        <>
                          <div>
                            {selectedPerson.corAddress.street || "N/A"} {selectedPerson.corAddress.house || "N/A"}
                            {selectedPerson.corAddress.apartment && `, Apt ${selectedPerson.corAddress.apartment}`}
                          </div>
                          <div>
                            {selectedPerson.corAddress.postalCode || "N/A"}{" "}
                            {selectedPerson.corAddress.cityOrVillage || "N/A"}
                          </div>
                          <div>
                            {selectedPerson.corAddress.region || "N/A"}, {selectedPerson.corAddress.country || "N/A"}
                          </div>
                        </>
                      ) : (
                        <div>Same as registration address</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>



            {/* Account Status & Preferences */}
            <div className="info-card">
              <div className="card-header">
                <h3 className="card-title">
                  <UserCheck size={16} />
                  Account Status & Preferences
                </h3>
              </div>
              <div className="card-content">
                <div className="info-item">
                  <div className="info-label">Marketing Consent</div>
                  <div className="info-value" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {selectedPerson.marketingConsent ? (
                      <>
                        <CheckCircle size={16} color="#10b981" />
                        <span style={{ color: "#10b981" }}>Granted</span>
                      </>
                    ) : (
                      <>
                        <X size={16} color="#ef4444" />
                        <span style={{ color: "#ef4444" }}>Not granted</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Account Created</div>
                  <div className="info-value">{selectedPerson.createdAt || selectedPerson.dateOfBirth || "N/A"}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Total Accounts</div>
                  <div className="info-value">{selectedPerson.accounts ? selectedPerson.accounts.length : 0}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Total Balance</div>
                  <div className="info-value">
                    {selectedPerson.accounts && selectedPerson.accounts.length > 0
                      ? `€${selectedPerson.accounts.reduce((total, acc) => total + (acc.balance || 0), 0).toFixed(2)}`
                      : "€0.00"}
                  </div>
                </div>
              </div>
            </div>

            {/* CRM Activity Summary */}
            <div className="info-card">
              <div className="card-header">
                <h3 className="card-title">
                  <Clock size={16} />
                  Recent Activity Summary
                </h3>
              </div>
              <div className="card-content">
                <div className="info-item">
                  <div className="info-label">Total CRM Entries</div>
                  <div className="info-value">{selectedPerson.crmEntries ? selectedPerson.crmEntries.length : 0}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Last Contact</div>
                  <div className="info-value">
                    {selectedPerson.crmEntries && selectedPerson.crmEntries.length > 0
                      ? selectedPerson.crmEntries[0].date
                      : "No contact recorded"}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Last Contact Type</div>
                  <div className="info-value">
                    {selectedPerson.crmEntries && selectedPerson.crmEntries.length > 0
                      ? selectedPerson.crmEntries[0].contactType
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </>
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
      <div className="crm-container">
        <div className="crm-header">
          <div className="crm-info">
            <div className="crm-avatar">
              <FileText size={24} color="white" />
            </div>
            <div className="crm-title">
              <h2>CRM History</h2>
              <p>
                {selectedPerson.first_name || selectedPerson.firstName} {selectedPerson.last_name|| selectedPerson.last_name}
              </p>
            </div>
          </div>
        </div>

        <div className="crm-entries">
          {selectedPerson.crm && selectedPerson.crm.length > 0 ? (
            selectedPerson.crm.map((entry, i) => (
              <div key={entry.id || `crm-${i}`} className="crm-entry">
                <div className="crm-entry-header">
                  <div
                    className="crm-entry-title"
                    onClick={() => toggleCrmExpansion(entry.id || `crm-${i}`)}
                  >
                    {expandedCrmEntries[entry.id || `crm-${i}`] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                    <span
                      style={{ fontWeight: 600, marginLeft: "8px", overflowWrap: "break-word" }}
                    >
                      {entry.title
                        ? entry.title.length > 75
                          ? entry.title.substring(0, 50)
                          : entry.title
                        : "Untitled Entry"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="crm-entry-badge">{entry.contactType || entry.contact_type}</span>
                    <span className="crm-entry-date">{entry.date_of_contact || entry.date}</span>
                    <span className="crm-entry-employee">by {entry.username}</span>
                  </div>
                </div>
                {(expandedCrmEntries[entry.id || `crm-${i}`] ||
                  closingCrmEntry === (entry.id || `crm-${i}`)) && (
                  <div
                    style={{ whiteSpace: "pre-wrap", overflowWrap: "break-word" }}
                    className={`crm-entry-content ${
                      closingCrmEntry === (entry.id || `crm-${i}`) ? "closing" : "opening"
                    }`}
                  >
                    {entry.content}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-data">
              <FileText className="no-data-icon" />
              <p className="no-data-text">No recent activities</p>
              <p className="no-data-subtext">Create a new entry to start tracking client interactions</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-panel dashboard-fade-in">
      {/* Apple-style Success Toast */}
      {showSuccess && (
        <div
          className={`success-toast ${closing ? "closing" : "showing"}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
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
            <div className="vegova-logo-sidebar">
              <img src="/vegova-logo.png" alt="Vegova Ljubljana" className="vegova-logo-sidebar-img" />
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

      {/* All existing modals remain the same... */}
      {/* Add Employee Modal */}
      {isAddEmployeeOpen && (
        <div
          className="modal-overlay"
          onMouseDown={handleModalMouseDown}
          onMouseUp={(e) => handleModalMouseUp(e, "addEmployee")}
        >
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
                    <input className="form-input auto-generated" value={employeeFormData.username} disabled />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password (Auto-generated)</label>
                  <div className="password-container">
                    <input
                      type="text"
                      className="form-input auto-generated"
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

      {/* Logout Modal */}
      {isLogoutOpen && (
        <div
          className="modal-overlay"
          onMouseDown={handleModalMouseDown}
          onMouseUp={(e) => handleModalMouseUp(e, "logout")}
        >
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

      {/* Delete Employee Modal */}
      {isDeleteEmployeeOpen && (
        <div
          className="modal-overlay"
          onMouseDown={handleModalMouseDown}
          onMouseUp={(e) => handleModalMouseUp(e, "deleteEmployee")}
        >
          <div
            className={`modal-content ${modalClosing.deleteEmployee ? "closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                <Trash2 size={20} color="#ef4444" />
                Delete Employee
              </h3>
              <button className="modal-close" onClick={() => closeModal("deleteEmployee")}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p className="delete-warning">
                Are you sure you want to delete employee {deletingEmployee?.firstName} {deletingEmployee?.lastName}?
                This action cannot be undone.
              </p>
              <div className="form-actions">
                <button type="button" className="button-secondary" onClick={() => closeModal("deleteEmployee")}>
                  Cancel
                </button>
                <button type="button" className="button-danger" onClick={handleDeleteEmployee}>
                  <Trash2 size={16} style={{ marginRight: "8px" }} />
                  Delete Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Client Modal */}
      {isDeleteClientOpen && (
        <div
          className="modal-overlay"
          onMouseDown={handleModalMouseDown}
          onMouseUp={(e) => handleModalMouseUp(e, "deleteClient")}
        >
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
                Are you sure you want to delete{" "}
                <strong>
                  {selectedPerson?.firstName} {selectedPerson?.lastName}
                </strong>
                ?
              </p>
              <p className="delete-warning" style={{ marginTop: "12px", fontSize: "14px", color: "#6b7280" }}>
                This action cannot be undone and will permanently remove:
              </p>
              <ul style={{ marginTop: "8px", marginLeft: "20px", color: "#6b7280", fontSize: "14px" }}>
                <li>All personal information</li>
                <li>All bank accounts ({selectedPerson?.accounts?.length || 0} accounts)</li>
                <li>All CRM entries ({selectedPerson?.crmEntries?.length || 0} entries)</li>
                <li>All associated data</li>
              </ul>
              <div className="form-actions" style={{ marginTop: "24px" }}>
                <button type="button" className="button-secondary" onClick={() => closeModal("deleteClient")}>
                  Cancel
                </button>
                <button type="button" className="button-danger" onClick={handleDeleteClient}>
                  <Trash2 size={16} style={{ marginRight: "8px" }} />
                  Delete Client Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
