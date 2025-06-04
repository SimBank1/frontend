"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Users,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  FileText,
  LogOut,
  Plus,
  Building,
  UserPlus,
  Edit,
  CheckCircle,
} from "lucide-react"
import "./EmployeePanel.css"

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
    otherBankAccounts: "Swedbank LT123456789012345678",
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
        canEdit: true,
      },
      {
        id: "crm2",
        date: "2024-11-28",
        contactType: "Email",
        content:
          "Sent welcome package and account setup instructions. Client confirmed receipt and expressed satisfaction with service.",
        employeeName: "Marija Kazlauskienė",
        canEdit: true,
      },
    ],
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
    otherBankAccounts: "",
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
        canEdit: true,
      },
    ],
  },
]

export default function EmployeePanel() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [data, setData] = useState(mockData)
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [isAddCrmOpen, setIsAddCrmOpen] = useState(false)
  const [isEditCrmOpen, setIsEditCrmOpen] = useState(false)
  const [editingCrmEntry, setEditingCrmEntry] = useState(null)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState("")
  const [logoutPopup, setLogoutPopup] = useState({ show: false, message: "", stage: 0 })

  const [crmFormData, setCrmFormData] = useState({
    contactType: "Phone",
    content: "",
    date: new Date().toISOString().split("T")[0],
  })

  // Form state for new client
  const [clientFormData, setClientFormData] = useState({
    firstName: "",
    lastName: "",
    personalCode: "",
    email: "",
    phone: "",
    documentType: "ID Card",
    documentNumber: "",
    documentExpiry: "",
    dateOfBirth: "",
    registrationAddress: "",
    correspondenceAddress: "",
    otherBankAccounts: "",
    marketingConsent: false,
  })

  // Form state for new account
  const [accountFormData, setAccountFormData] = useState({
    iban: "",
    currency: "EUR",
    balance: "0.00",
    cardType: "Debeto",
    servicePlan: "Standard",
    openingDate: new Date().toISOString().split("T")[0],
  })

  // Show success message with auto-dismiss
  const showSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => {
      setSuccessMessage("")
    }, 3000)
  }

  // Validation functions
  const validatePersonalCode = (code) => {
    if (!/^\d{11}$/.test(code)) {
      return "Personal code must be exactly 11 digits"
    }
    return null
  }

  const validateName = (name, fieldName) => {
    if (!/^[A-Za-zĄąČčĘęĖėĮįŠšŲųŪūŽž\s]{3,50}$/.test(name)) {
      return `${fieldName} must be 3-50 alphabetic characters only`
    }
    return null
  }

  const validateDocumentNumber = (number) => {
    if (!/^[A-Za-z0-9]{8}$/.test(number)) {
      return "Document number must be exactly 8 alphanumeric characters"
    }
    return null
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return "Invalid email format"
    }
    // Check if email already exists
    const emailExists = data.some((person) => person.email === email)
    if (emailExists) {
      return "Email already in use"
    }
    return null
  }

  const validatePhone = (phone) => {
    if (!/^0\d{8}$/.test(phone)) {
      return "Phone number must start with 0 and contain exactly 9 digits"
    }
    return null
  }

  const validateIBAN = (iban) => {
    if (!/^LT\d{18}$/.test(iban)) {
      return "IBAN must start with LT followed by exactly 18 digits"
    }
    // Check if IBAN already exists
    const ibanExists = data.some((person) => person.accounts?.some((account) => account.iban === iban))
    if (ibanExists) {
      return "IBAN number is already in use"
    }
    return null
  }

  const validateBalance = (balance) => {
    const balanceRegex = /^\d{1,10}(\.\d{1,2})?$/
    if (!balanceRegex.test(balance)) {
      return "Balance must be a valid number with max 10 digits and 2 decimal places"
    }
    if (Number.parseFloat(balance) < 0) {
      return "Balance must be greater than or equal to 0.00"
    }
    return null
  }

  const validateDate = (date) => {
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    selectedDate.setHours(0, 0, 0, 0)

    if (selectedDate.getTime() !== today.getTime()) {
      return "Date must be today's date"
    }
    return null
  }

  const validateFutureDate = (date) => {
    const selectedDate = new Date(date)
    const today = new Date()
    if (selectedDate <= today) {
      return "Document already expired"
    }
    return null
  }

  const validateContent = (content) => {
    if (!content.trim()) {
      return "Content is required"
    }
    if (content.length > 200) {
      return "Content exceeds 200 characters"
    }
    return null
  }

  // Generate random IBAN
  const generateRandomIBAN = () => {
    // Generate random 18-digit number for Lithuanian IBAN
    const randomDigits = Math.floor(Math.random() * 1000000000000000000)
      .toString()
      .padStart(18, "0")
    return `LT${randomDigits}`
  }

  // Auto-fill date of birth from personal code
  const getDateOfBirthFromPersonalCode = (personalCode) => {
    if (personalCode.length !== 11) return ""

    const century = personalCode[0]
    const year = personalCode.substring(1, 3)
    const month = personalCode.substring(3, 5)
    const day = personalCode.substring(5, 7)

    let fullYear
    if (century === "3" || century === "4") {
      fullYear = "19" + year
    } else if (century === "5" || century === "6") {
      fullYear = "20" + year
    } else {
      return ""
    }

    return `${fullYear}-${month}-${day}`
  }

  const handleLogout = () => {
    setLogoutPopup({ show: true, message: "Logging you out...", stage: 1 })

    setTimeout(() => {
      setLogoutPopup({ show: true, message: "Redirecting back to login...", stage: 2 })

      setTimeout(() => {
        // Clear cookies and redirect
        document.cookie = "sessionCokie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        window.location.href = "/login"
      }, 2000)
    }, 1500)
  }

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = data

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (person) =>
          person.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.personalCode.includes(searchTerm),
      )
    }

    return filtered
  }, [searchTerm, data])

  const handlePersonClick = (person) => {
    setSelectedPerson(person)
  }

  const handleClientFormChange = (field, value) => {
    setClientFormData((prev) => {
      const updated = { ...prev, [field]: value }

      // Auto-fill date of birth when personal code changes (live update)
      if (field === "personalCode" && value.length >= 7) {
        const dateOfBirth = getDateOfBirthFromPersonalCode(value)
        if (dateOfBirth) {
          updated.dateOfBirth = dateOfBirth
        }
      }

      return updated
    })

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const handleAccountFormChange = (field, value) => {
    setAccountFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const handleCrmFormChange = (field, value) => {
    setCrmFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const validateClientForm = () => {
    const newErrors = {}

    // Validate all required fields
    const firstNameError = validateName(clientFormData.firstName, "First name")
    if (firstNameError) newErrors.firstName = firstNameError

    const lastNameError = validateName(clientFormData.lastName, "Last name")
    if (lastNameError) newErrors.lastName = lastNameError

    const personalCodeError = validatePersonalCode(clientFormData.personalCode)
    if (personalCodeError) newErrors.personalCode = personalCodeError

    const documentNumberError = validateDocumentNumber(clientFormData.documentNumber)
    if (documentNumberError) newErrors.documentNumber = documentNumberError

    const emailError = validateEmail(clientFormData.email)
    if (emailError) newErrors.email = emailError

    const phoneError = validatePhone(clientFormData.phone)
    if (phoneError) newErrors.phone = phoneError

    const expiryError = validateFutureDate(clientFormData.documentExpiry)
    if (expiryError) newErrors.documentExpiry = expiryError

    // Check required fields
    if (!clientFormData.registrationAddress.trim()) {
      newErrors.registrationAddress = "Registration address is required"
    }

    if (!clientFormData.correspondenceAddress.trim()) {
      newErrors.correspondenceAddress = "Correspondence address is required"
    }

    if (!clientFormData.marketingConsent) {
      newErrors.marketingConsent = "Marketing consent must be selected"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateAccountForm = () => {
    const newErrors = {}

    const ibanError = validateIBAN(accountFormData.iban)
    if (ibanError) newErrors.iban = ibanError

    const balanceError = validateBalance(accountFormData.balance)
    if (balanceError) newErrors.balance = balanceError

    const dateError = validateDate(accountFormData.openingDate)
    if (dateError) newErrors.openingDate = dateError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateCrmForm = () => {
    const newErrors = {}

    const contentError = validateContent(crmFormData.content)
    if (contentError) newErrors.content = contentError

    if (!crmFormData.contactType) {
      newErrors.contactType = "Please select contact type"
    }

    if (!crmFormData.date) {
      newErrors.date = "Invalid date format"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddClient = (e) => {
    e.preventDefault()

    if (!validateClientForm()) {
      return
    }

    const newClient = {
      id: (data.length + 1).toString(),
      type: "client",
      ...clientFormData,
      accounts: [],
      crmEntries: [],
    }

    setData((prev) => [...prev, newClient])
    setClientFormData({
      firstName: "",
      lastName: "",
      personalCode: "",
      email: "",
      phone: "",
      documentType: "ID Card",
      documentNumber: "",
      documentExpiry: "",
      dateOfBirth: "",
      registrationAddress: "",
      correspondenceAddress: "",
      otherBankAccounts: "",
      marketingConsent: false,
    })
    setErrors({})
    setIsAddClientOpen(false)
    setSelectedPerson(newClient)
    showSuccess("Client profile created successfully!")
  }

  const handleAddAccount = (e) => {
    e.preventDefault()

    if (!selectedPerson) return

    if (!validateAccountForm()) {
      return
    }

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
      balance: "0.00",
      cardType: "Debeto",
      servicePlan: "Standard",
      openingDate: new Date().toISOString().split("T")[0],
    })
    setErrors({})
    setIsAddAccountOpen(false)
    showSuccess("Bank account created successfully!")
  }

  const handleAddCrm = (e) => {
    e.preventDefault()

    if (!selectedPerson) return

    if (!validateCrmForm()) {
      return
    }

    const newCrmEntry = {
      id: `crm${selectedPerson.crmEntries ? selectedPerson.crmEntries.length + 1 : 1}`,
      employeeName: "Current Employee",
      canEdit: true,
      ...crmFormData,
    }

    const updatedPerson = {
      ...selectedPerson,
      crmEntries: [...(selectedPerson.crmEntries || []), newCrmEntry],
    }

    setData((prev) => prev.map((person) => (person.id === selectedPerson.id ? updatedPerson : person)))
    setSelectedPerson(updatedPerson)
    setCrmFormData({
      contactType: "Phone",
      content: "",
      date: new Date().toISOString().split("T")[0],
    })
    setErrors({})
    setIsAddCrmOpen(false)
    showSuccess("CRM entry added successfully!")
  }

  const handleEditCrm = (entry) => {
    setEditingCrmEntry(entry)
    setCrmFormData({
      contactType: entry.contactType,
      content: entry.content,
      date: entry.date,
    })
    setIsEditCrmOpen(true)
  }

  const handleUpdateCrm = (e) => {
    e.preventDefault()

    if (!validateCrmForm()) {
      return
    }

    const updatedPerson = {
      ...selectedPerson,
      crmEntries: selectedPerson.crmEntries.map((entry) =>
        entry.id === editingCrmEntry.id ? { ...entry, ...crmFormData } : entry,
      ),
    }

    setData((prev) => prev.map((person) => (person.id === selectedPerson.id ? updatedPerson : person)))
    setSelectedPerson(updatedPerson)
    setCrmFormData({
      contactType: "Phone",
      content: "",
      date: new Date().toISOString().split("T")[0],
    })
    setErrors({})
    setIsEditCrmOpen(false)
    setEditingCrmEntry(null)
    showSuccess("CRM entry updated successfully!")
  }

  const renderPersonList = () => {
    return filteredData.map((person, index) => (
      <div
        key={person.id}
        className="client-card"
        onClick={() => handlePersonClick(person)}
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <div className="client-card-content">
          <User className="client-icon" />
          <div className="client-info">
            <div className="client-header">
              <h3 className="client-name">
                {person.firstName} {person.lastName}
              </h3>
              <span className="client-badge">client</span>
            </div>
            {person.crmEntries && person.crmEntries.length > 0 && (
              <p className="client-preview">{person.crmEntries[0].content.substring(0, 80)}...</p>
            )}
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
            <h3 className="empty-title">Client Information</h3>
            <p className="empty-description">Select a client to view their details</p>
          </div>
        </div>
      )
    }

    return (
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={24} color="white" />
          </div>
          <div className="profile-info">
            <h2>
              {selectedPerson.firstName} {selectedPerson.lastName}
            </h2>
            <p>Client Profile</p>
          </div>
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
              <div className="info-value">{selectedPerson.documentType}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Document Number</div>
              <div className="info-value">{selectedPerson.documentNumber}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Document Expiry</div>
              <div className="info-value">{selectedPerson.documentExpiry}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Other Bank Accounts</div>
              <div className="info-value">{selectedPerson.otherBankAccounts || "None"}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Marketing Consent</div>
              <div className="info-value">{selectedPerson.marketingConsent ? "Yes" : "No"}</div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="info-card">
          <div className="card-header">
            <h3 className="card-title">
              <Phone size={16} />
              Contact Information
            </h3>
          </div>
          <div className="card-content">
            <div className="contact-item">
              <Mail className="contact-icon" />
              <span>{selectedPerson.email}</span>
            </div>
            <div className="contact-item">
              <Phone className="contact-icon" />
              <span>{selectedPerson.phone}</span>
            </div>
            <div className="address-item">
              <MapPin className="address-icon" />
              <div className="address-content">
                <div className="info-label">Registration Address</div>
                <div className="info-value">{selectedPerson.registrationAddress}</div>
              </div>
            </div>
            <div className="address-item">
              <MapPin className="address-icon" />
              <div className="address-content">
                <div className="info-label">Correspondence Address</div>
                <div className="info-value">{selectedPerson.correspondenceAddress}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Accounts */}
        <div className="info-card">
          <div className="card-header">
            <h3 className="card-title">
              <CreditCard size={16} />
              Bank Accounts
            </h3>
            <button className="add-account-button" onClick={() => setIsAddAccountOpen(true)}>
              <Plus size={14} /> Add Account
            </button>
          </div>
          <div className="card-content">
            {selectedPerson.accounts && selectedPerson.accounts.length > 0 ? (
              <div className="accounts-list">
                {selectedPerson.accounts.map((account, index) => (
                  <div key={account.id} className="account-item" style={{ animationDelay: `${index * 0.1}s` }}>
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
                        <div className="info-label">Opened</div>
                        <div className="info-value">{account.openingDate}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <CreditCard className="no-data-icon" />
                <p className="no-data-text">No accounts found for this client</p>
              </div>
            )}
          </div>
        </div>
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
            <p className="empty-description">Select a client to view and manage CRM data</p>
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
                {selectedPerson.firstName} {selectedPerson.lastName}
              </p>
            </div>
          </div>

          <button className="button-primary" onClick={() => setIsAddCrmOpen(true)}>
            <Plus size={16} style={{ marginRight: "8px" }} /> Add CRM Entry
          </button>
        </div>

        {/* CRM Entries */}
        <div className="crm-entries">
          {selectedPerson.crmEntries && selectedPerson.crmEntries.length > 0 ? (
            selectedPerson.crmEntries.map((entry, index) => (
              <div key={entry.id} className="crm-entry" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="crm-entry-header">
                  <div className="crm-entry-meta">
                    <span className="crm-entry-badge">{entry.contactType}</span>
                    <span className="crm-entry-date">{entry.date}</span>
                    <span className="crm-entry-employee">by {entry.employeeName}</span>
                  </div>
                  {entry.canEdit && (
                    <button className="edit-button" onClick={() => handleEditCrm(entry)}>
                      <Edit size={16} />
                    </button>
                  )}
                </div>
                <p className="crm-entry-content">{entry.content}</p>
              </div>
            ))
          ) : (
            <div className="no-data">
              <FileText className="no-data-icon" />
              <p className="no-data-text">No CRM entries found for this client</p>
              <p className="no-data-subtext">Create a new entry to start tracking client interactions</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="employee-panel">
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
              <p>Employee Portal</p>
            </div>
          </div>
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Management Section */}
        <div className="management-section">
          <div className="management-header">
            <h2 className="management-title">Client Management</h2>
            <button className="add-button" onClick={() => setIsAddClientOpen(true)}>
              <Plus size={16} color="#8b5cf6" />
            </button>
          </div>
          <div className="nav-buttons">
            <button className="nav-button">
              <Users size={16} style={{ marginRight: "8px", color: "#8b5cf6" }} />
              All Clients
            </button>
            <button className="nav-button">
              <Calendar size={16} style={{ marginRight: "8px", color: "#8b5cf6" }} />
              Recent Activity
            </button>
          </div>
        </div>

        {/* Client List */}
        <div className="client-list">
          <h3>Clients:</h3>
          {renderPersonList()}
        </div>

        {/* Bottom Section */}
        <div className="bottom-section">
          <div className="bottom-buttons">
            <button className="primary-button" onClick={() => setIsAddClientOpen(true)}>
              <UserPlus size={16} style={{ marginRight: "8px" }} />
              New Client
            </button>
            <button className="icon-button" onClick={handleLogout}>
              <LogOut size={16} />
            </button>\
