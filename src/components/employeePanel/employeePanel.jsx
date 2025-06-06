"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import {
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  LogOut,
  Plus,
  Building,
  UserPlus,
  Edit,
  CheckCircle,
  X,
} from "lucide-react"
import "./EmployeePanel.css"
import { getServerLink } from "../../server_link"

export default function EmployeePanel({ data: initialData, currentUser }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [data, setData] = useState(initialData?.clients || [])
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [isAddCrmOpen, setIsAddCrmOpen] = useState(false)
  const [isEditCrmOpen, setIsEditCrmOpen] = useState(false)
  const [editingCrmEntry, setEditingCrmEntry] = useState(null)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState("")
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)
  const [sameAsRegistration, setSameAsRegistration] = useState(true)

  // Search input ref for focus management
  const searchInputRef = useRef(null)

  // Tracks which modal is in the process of closing (for fade‐out animation)
  const [modalClosing, setModalClosing] = useState({
    addClient: false,
    addAccount: false,
    addCrm: false,
    editCrm: false,
    logout: false,
  })

  const [crmFormData, setCrmFormData] = useState({
    contactType: "phone",
    content: "",
    date: new Date().toISOString().split("T")[0],
  })

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

  const [accountFormData, setAccountFormData] = useState({
    iban: "",
    currency: "EUR",
    balance: "",
    cardType: "Debeto",
    servicePlan: "Standard",
    openingDate: new Date().toISOString().split("T")[0],
  })

  // Enhanced ESC key handling for search functionality
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
        if (isAddClientOpen) closeModal("addClient")
        if (isAddAccountOpen) closeModal("addAccount")
        if (isAddCrmOpen) closeModal("addCrm")
        if (isEditCrmOpen) closeModal("editCrm")
        if (isLogoutOpen) closeModal("logout")
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isAddClientOpen, isAddAccountOpen, isAddCrmOpen, isEditCrmOpen, isLogoutOpen, searchTerm])

  const closeModal = (modalType) => {
    setModalClosing((prev) => ({ ...prev, [modalType]: true }))
    setTimeout(() => {
      switch (modalType) {
        case "addClient":
          setIsAddClientOpen(false)
          break
        case "addAccount":
          setIsAddAccountOpen(false)
          break
        case "addCrm":
          setIsAddCrmOpen(false)
          break
        case "editCrm":
          setIsEditCrmOpen(false)
          setEditingCrmEntry(null)
          break
        case "logout":
          setIsLogoutOpen(false)
          break
      }
      setModalClosing((prev) => ({ ...prev, [modalType]: false }))
    }, 200)
  }

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => {
      setSuccessMessage("")
    }, 3000)
  }

  const handleLogout = () => {
    document.cookie = "sessionCokie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    window.location.href = "/login"
  }

  const confirmLogout = () => {
    closeModal("logout")
    setTimeout(() => {
      handleLogout()
    }, 200)
  }

  // VALIDATION HELPERS
  const validatePersonalCode = (code) => {
    if (!/^\d{11}$/.test(code)) {
      return "Personal code must be exactly 11 digits"
    }
    return null
  }

  const validateName = (name, fieldName) => {
    if (!/^[A-Za-zĄąČčĘęĖėĮįŠšŲųŪūŽž\s]{3,50}$/.test(name)) {
      return `${fieldName} must be 3–50 alphabetic characters only`
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
    const ibanExists = data.some((person) => person.accounts?.some((account) => account.iban === iban))
    if (ibanExists) {
      return "IBAN number is already in use"
    }
    return null
  }

  const validateBalance = (balance) => {
    const balanceRegex = /^\d{1,10}(\.\d{1,2})?$/
    if (!balanceRegex.test(balance)) {
      return "Balance must be a valid number with up to 10 digits and 2 decimal places"
    }
    if (Number.parseFloat(balance) < 0) {
      return "Balance must be ≥ 0.00"
    }
    return null
  }

  const validateDateIsToday = (date) => {
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

  // AUTO-FILL dateOfBirth from personalCode
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

    const monthNum = Number.parseInt(month, 10)
    const dayNum = Number.parseInt(day, 10)
    if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
      return ""
    }

    return `${fullYear}-${month}-${day}`
  }

  // GENERATE random IBAN (tries up to 100 times)
  const generateRandomIBAN = () => {
    const randomDigits = (len) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("")
    let iban
    let attempts = 0
    do {
      iban = `LT${randomDigits(18)}`
      attempts++
    } while (data.some((person) => person.accounts?.some((account) => account.iban === iban)) && attempts < 100)
    return iban
  }

  const handleGenerateIBAN = () => {
    const newIBAN = generateRandomIBAN()
    setAccountFormData((prev) => ({ ...prev, iban: newIBAN }))
    if (errors.iban) {
      setErrors((prev) => ({ ...prev, iban: null }))
    }
  }

  // ADD CLIENT
  const handleAddClient = (e) => {
    e.preventDefault()
    if (!validateClientForm()) return

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
      showSuccess("Client profile created successfully!")
    }, 200)
  }

  const validateClientForm = () => {
    const newErrors = {}

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

    const requiredAddressFields = [
      "registrationCountry",
      "registrationRegion",
      "registrationCity",
      "registrationStreet",
      "registrationHouse",
      "registrationPostalCode",
      "correspondenceCountry",
      "correspondenceRegion",
      "correspondenceCity",
      "correspondenceStreet",
      "correspondenceHouse",
      "correspondencePostalCode",
    ]

    requiredAddressFields.forEach((field) => {
      if (!clientFormData[field].trim()) {
        const fieldName = field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
        newErrors[field] = `${fieldName} is required`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleClientFormChange = (field, value) => {
    if (field === "personalCode") {
      const dateOfBirth = getDateOfBirthFromPersonalCode(value)
      setClientFormData((prev) => ({
        ...prev,
        [field]: value,
        dateOfBirth,
      }))
      return
    }
    setClientFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const copyRegistrationToCorrespondence = () => {
    if (sameAsRegistration) {
      setClientFormData((prev) => ({
        ...prev,
        correspondenceCountry: prev.registrationCountry,
        correspondenceRegion: prev.registrationRegion,
        correspondenceCity: prev.registrationCity,
        correspondenceStreet: prev.registrationStreet,
        correspondenceHouse: prev.registrationHouse,
        correspondenceApartment: prev.registrationApartment,
        correspondencePostalCode: prev.registrationPostalCode,
      }))
    }
  }

  useEffect(() => {
    if (sameAsRegistration) {
      copyRegistrationToCorrespondence()
    }
  }, [
    sameAsRegistration,
    clientFormData.registrationCountry,
    clientFormData.registrationRegion,
    clientFormData.registrationCity,
    clientFormData.registrationStreet,
    clientFormData.registrationHouse,
    clientFormData.registrationApartment,
    clientFormData.registrationPostalCode,
  ])

  // ADD ACCOUNT
  const validateAccountForm = () => {
    const newErrors = {}
    const ibanError = validateIBAN(accountFormData.iban)
    if (ibanError) newErrors.iban = ibanError

    const balanceError = validateBalance(accountFormData.balance)
    if (balanceError) newErrors.balance = balanceError

    const openingDateError = validateDateIsToday(accountFormData.openingDate)
    if (openingDateError) newErrors.openingDate = openingDateError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAccountFormChange = (field, value) => {
    setAccountFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const handleAddAccount = (e) => {
    e.preventDefault()
    if (!selectedPerson) return
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
      cardType: "Debeto",
      servicePlan: "Standard",
      openingDate: new Date().toISOString().split("T")[0],
    })
    setErrors({})
    closeModal("addAccount")
    setTimeout(() => {
      showSuccess("Bank account created successfully!")
    }, 200)
  }

  // ADD CRM ENTRY with new structure and employee username
  const validateCrmForm = () => {
    const newErrors = {}
    const contentError = validateContent(crmFormData.content)
    if (contentError) newErrors.content = contentError

    const dateError = validateDateIsToday(crmFormData.date)
    if (dateError) newErrors.date = dateError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCrmFormChange = (field, value) => {
    setCrmFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const handleAddCrm = async (e) => {
    e.preventDefault()
    if (!selectedPerson) return
    if (!validateCrmForm()) return

    // Create CRM entry with the required structure including employee username
    const crmData = {
      personal_code: Number.parseInt(selectedPerson.personalCode), // long
      date_of_contact: crmFormData.date, // LocalDate format (YYYY-MM-DD)
      contact_type: crmFormData.contactType, // String
      content: crmFormData.content, // String
      employee_username: currentUser?.username || "unknown", // Add employee username
    }

    try {
      // Send to server using the proper format
      const response = await fetch(getServerLink() + "/crm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(crmData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create CRM entry")
      }

      // Update local state
      const newCrmEntry = {
        id: `crm${selectedPerson.crmEntries ? selectedPerson.crmEntries.length + 1 : 1}`,
        employeeName: currentUser?.username || "Current Employee",
        canEdit: true,
        contactType: crmFormData.contactType,
        content: crmFormData.content,
        date: crmFormData.date,
      }

      const updatedPerson = {
        ...selectedPerson,
        crmEntries: [...(selectedPerson.crmEntries || []), newCrmEntry],
      }

      setData((prev) => prev.map((person) => (person.id === selectedPerson.id ? updatedPerson : person)))
      setSelectedPerson(updatedPerson)
      setCrmFormData({
        contactType: "phone",
        content: "",
        date: new Date().toISOString().split("T")[0],
      })
      setErrors({})
      closeModal("addCrm")
      setTimeout(() => {
        showSuccess("CRM entry added successfully!")
      }, 200)
    } catch (error) {
      console.error("Error creating CRM entry:", error)
      showSuccess("Error creating CRM entry. Please try again.")
    }
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
    if (!validateCrmForm()) return

    const updatedPerson = {
      ...selectedPerson,
      crmEntries: selectedPerson.crmEntries.map((ent) =>
        ent.id === editingCrmEntry.id ? { ...ent, ...crmFormData } : ent,
      ),
    }

    setData((prev) => prev.map((person) => (person.id === selectedPerson.id ? updatedPerson : person)))
    setSelectedPerson(updatedPerson)
    setCrmFormData({
      contactType: "phone",
      content: "",
      date: new Date().toISOString().split("T")[0],
    })
    setErrors({})
    closeModal("editCrm")
    setTimeout(() => {
      showSuccess("CRM entry updated successfully!")
    }, 200)
  }

  // FILTER + SEARCH
  const filteredData = useMemo(() => {
    let result = data
    if (searchTerm) {
      result = result.filter(
        (person) =>
          person.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.personalCode.includes(searchTerm),
      )
    }
    return result
  }, [searchTerm, data])

  const handlePersonClick = (person) => {
    setSelectedPerson(person)
  }

  // RENDER LIST OF CLIENTS
  const renderPersonList = () =>
    filteredData.map((person, idx) => (
      <div
        key={person.id}
        className="client-card"
        onClick={() => handlePersonClick(person)}
        style={{ animationDelay: `${idx * 0.05}s` }}
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
            {person.crmEntries && person.crmEntries.length > 0 ? (
              <p className="client-preview">Last interaction: {person.crmEntries[0].date}</p>
            ) : (
              <p className="client-preview no-recent-activities">No recent activities</p>
            )}
          </div>
        </div>
      </div>
    ))

  // RENDER CLIENT PROFILE PANEL
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
              {selectedPerson?.firstName ?? ""} {selectedPerson?.lastName ?? ""}
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
              <div className="info-value">{selectedPerson?.personalCode ?? "-"}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Date of Birth</div>
              <div className="info-value">{selectedPerson?.dateOfBirth ?? "-"}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Document Type</div>
              <div className="info-value">{selectedPerson?.docType ?? "-"}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Document Number</div>
              <div className="info-value">{selectedPerson?.docNumber ?? "-"}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Document Expiry</div>
              <div className="info-value">{selectedPerson?.docExpiryDate ?? "-"}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Other Bank Accounts</div>
              <div className="info-value">{selectedPerson?.otherBankAccounts || "None"}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Marketing Consent</div>
              <div className="info-value">
                {selectedPerson?.marketingConsent === true
                  ? "Yes"
                  : selectedPerson?.marketingConsent === false
                    ? "No"
                    : "-"}
              </div>
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
              <div className="contact-text">
                <div className="contact-email">
                  <span className="contact-email-text">{selectedPerson.email}</span>
                </div>
              </div>
            </div>
            <div className="contact-item">
              <Phone className="contact-icon" />
              <span>
                {(() => {
                  if (!selectedPerson?.phoneNumber) return ""

                  const raw = selectedPerson.phoneNumber.replace(/\s+/g, "")
                  const number = raw.startsWith("8") ? raw.slice(1) : raw

                  if (number.length === 8) {
                    const part1 = number.slice(0, 3)
                    const part2 = number.slice(3, 5)
                    const part3 = number.slice(5, 8)
                    return `+370 ${part1} ${part2} ${part3}`
                  }

                  return `+370 ${number}`
                })()}
              </span>
            </div>
            <div className="address-item">
              <MapPin className="address-icon" />
              <div className="address-content">
                <div className="info-label">Registration Address</div>
                <div className="info-value">
                  {selectedPerson.regAddress ? (
                    <>
                      <div>
                        <div>Apartment: {selectedPerson.regAddress.apartment || "N/A"}</div>
                        {selectedPerson.regAddress.street || "N/A"} {selectedPerson.regAddress.house || "N/A"}
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
                    <div>No address info</div>
                  )}
                </div>
              </div>
            </div>
            <div className="address-item">
              <MapPin className="address-icon" />
              <div className="address-content">
                <div className="info-label">Correspondence Address</div>
                <div className="info-value">
                  {selectedPerson.corAddress ? (
                    <>
                      <div>
                        <div>Apartment: {selectedPerson.corAddress.apartment || "N/A"}</div>
                        {selectedPerson.corAddress.street || "N/A"} {selectedPerson.corAddress.house || "N/A"}
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
                    <div>No address info</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Accounts */}
        <div className="info-card">
          <div className="card-header bank-accounts-header">
            <h3 className="card-title">
              <CreditCard size={16} style={{ marginRight: "6px" }} />
              Bank Accounts
            </h3>
            <button className="button-add-account" onClick={() => setIsAddAccountOpen(true)}>
              <Plus size={14} style={{ marginRight: "4px" }} />
              Add Account
            </button>
          </div>

          <div className="card-content">
            {selectedPerson.accounts && selectedPerson.accounts.length > 0 ? (
              <div className="accounts-list">
                {selectedPerson.accounts.map((account, i) => (
                  <div key={account.id} className="account-item" style={{ animationDelay: `${i * 0.1}s` }}>
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

  // RENDER CRM PANEL
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

          <button
            className="button-primary flex-none crm-button"
            style={{ width: "200px" }}
            onClick={() => setIsAddCrmOpen(true)}
          >
            <Plus size={16} style={{ marginRight: "8px" }} /> Add CRM Entry
          </button>
        </div>

        <div className="crm-entries">
          {selectedPerson.crmEntries && selectedPerson.crmEntries.length > 0 ? (
            selectedPerson.crmEntries.map((entry, i) => (
              <div key={entry.id} className="crm-entry" style={{ animationDelay: `${i * 0.1}s` }}>
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
              <p className="no-data-text">No recent activities</p>
              <p className="no-data-subtext">Create a new entry to start tracking client interactions</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="employee-panel dashboard-fade-in">
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
              ref={searchInputRef}
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="client-list">
          <div className="management-header">
            <h2 className="management-title">All clients</h2>
            <button className="add-button" onClick={() => setIsAddClientOpen(true)}>
              <Plus size={16} color="#8b5cf6" />
            </button>
          </div>
          {renderPersonList()}
        </div>

        <div className="bottom-section">
          <div className="bottom-buttons">
            <button className="primary-button" onClick={() => setIsAddClientOpen(true)}>
              <UserPlus size={16} style={{ marginRight: "8px" }} />
              New Client
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
          <h2 className="panel-title">Client Profile</h2>
          {renderPersonalInfo()}
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel">{renderCRMRequests()}</div>

      {/* All modals remain the same as before... */}
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

      {/* Add Client Modal */}
      {isAddClientOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal("addClient")}>
          <div
            className={`modal-content ${modalClosing.addClient ? "closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                <UserPlus size={20} color="#8b5cf6" />
                Create New Client
              </h3>
              <button className="modal-close" onClick={() => closeModal("addClient")}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddClient}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      className={`form-input ${errors.firstName ? "error" : ""}`}
                      value={clientFormData.firstName}
                      onChange={(e) => handleClientFormChange("firstName", e.target.value)}
                      placeholder="Enter first name"
                      required
                    />
                    {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      className={`form-input ${errors.lastName ? "error" : ""}`}
                      value={clientFormData.lastName}
                      onChange={(e) => handleClientFormChange("lastName", e.target.value)}
                      placeholder="Enter last name"
                      required
                    />
                    {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Personal Code *</label>
                    <input
                      className={`form-input ${errors.personalCode ? "error" : ""}`}
                      value={clientFormData.personalCode}
                      onChange={(e) => handleClientFormChange("personalCode", e.target.value)}
                      placeholder="Enter 11-digit personal code"
                      required
                    />
                    {errors.personalCode && <div className="error-message">{errors.personalCode}</div>}
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className={`form-input ${errors.email ? "error" : ""}`}
                      value={clientFormData.email}
                      onChange={(e) => handleClientFormChange("email", e.target.value)}
                      placeholder="Enter email"
                      required
                    />
                    {errors.email && <div className="error-message">{errors.email}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input
                      className={`form-input ${errors.phone ? "error" : ""}`}
                      value={clientFormData.phone}
                      onChange={(e) => handleClientFormChange("phone", e.target.value)}
                      placeholder="0xxxxxxxx"
                      required
                    />
                    {errors.phone && <div className="error-message">{errors.phone}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Document Type *</label>
                    <select
                      className="form-select"
                      value={clientFormData.documentType}
                      onChange={(e) => handleClientFormChange("documentType", e.target.value)}
                      required
                    >
                      <option value="Passport">Passport</option>
                      <option value="ID Card">ID Card</option>
                      <option value="Driver's License">Driver's License</option>
                      <option value="Temporary Residence Permit">Temporary Residence Permit</option>
                    </select>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Document Number *</label>
                    <input
                      className={`form-input ${errors.documentNumber ? "error" : ""}`}
                      value={clientFormData.documentNumber}
                      onChange={(e) => handleClientFormChange("documentNumber", e.target.value)}
                      placeholder="8 alphanumeric characters"
                      required
                    />
                    {errors.documentNumber && <div className="error-message">{errors.documentNumber}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Document Expiry *</label>
                    <input
                      type="date"
                      className={`form-input ${errors.documentExpiry ? "error" : ""}`}
                      value={clientFormData.documentExpiry}
                      onChange={(e) => handleClientFormChange("documentExpiry", e.target.value)}
                      required
                    />
                    {errors.documentExpiry && <div className="error-message">{errors.documentExpiry}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth (Auto-filled)</label>
                    <input type="date" className="form-input readonly" value={clientFormData.dateOfBirth} readOnly />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Registration Address *</label>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Country *</label>
                      <input
                        className={`form-input ${errors.registrationCountry ? "error" : ""}`}
                        value={clientFormData.registrationCountry}
                        onChange={(e) => handleClientFormChange("registrationCountry", e.target.value)}
                        placeholder="Country"
                        required
                      />
                      {errors.registrationCountry && <div className="error-message">{errors.registrationCountry}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Region *</label>
                      <input
                        className={`form-input ${errors.registrationRegion ? "error" : ""}`}
                        value={clientFormData.registrationRegion}
                        onChange={(e) => handleClientFormChange("registrationRegion", e.target.value)}
                        placeholder="Region"
                        required
                      />
                      {errors.registrationRegion && <div className="error-message">{errors.registrationRegion}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">City/Village *</label>
                      <input
                        className={`form-input ${errors.registrationCity ? "error" : ""}`}
                        value={clientFormData.registrationCity}
                        onChange={(e) => handleClientFormChange("registrationCity", e.target.value)}
                        placeholder="City or Village"
                        required
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
                        onChange={(e) => handleClientFormChange("registrationStreet", e.target.value)}
                        placeholder="Street name"
                        required
                      />
                      {errors.registrationStreet && <div className="error-message">{errors.registrationStreet}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">House *</label>
                      <input
                        className={`form-input ${errors.registrationHouse ? "error" : ""}`}
                        value={clientFormData.registrationHouse}
                        onChange={(e) => handleClientFormChange("registrationHouse", e.target.value)}
                        placeholder="House number"
                        required
                      />
                      {errors.registrationHouse && <div className="error-message">{errors.registrationHouse}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Apartment</label>
                      <input
                        className={`form-input ${errors.registrationApartment ? "error" : ""}`}
                        value={clientFormData.registrationApartment}
                        onChange={(e) => handleClientFormChange("registrationApartment", e.target.value)}
                        placeholder="Apartment (optional)"
                      />
                      {errors.registrationApartment && (
                        <div className="error-message">{errors.registrationApartment}</div>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal Code *</label>
                    <input
                      className={`form-input ${errors.registrationPostalCode ? "error" : ""}`}
                      value={clientFormData.registrationPostalCode}
                      onChange={(e) => handleClientFormChange("registrationPostalCode", e.target.value)}
                      placeholder="Postal code"
                      required
                    />
                    {errors.registrationPostalCode && (
                      <div className="error-message">{errors.registrationPostalCode}</div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-checkbox" style={{ marginBottom: "12px" }}>
                    <input
                      type="checkbox"
                      id="sameAsRegistration"
                      checked={sameAsRegistration}
                      onChange={(e) => setSameAsRegistration(e.target.checked)}
                    />
                    <label htmlFor="sameAsRegistration">Same as registration address</label>
                  </div>

                  {!sameAsRegistration && (
                    <>
                      <label className="form-label">Correspondence Address *</label>
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Country *</label>
                          <input
                            className={`form-input ${errors.correspondenceCountry ? "error" : ""}`}
                            value={clientFormData.correspondenceCountry}
                            onChange={(e) => handleClientFormChange("correspondenceCountry", e.target.value)}
                            placeholder="Country"
                            required
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
                            onChange={(e) => handleClientFormChange("correspondenceRegion", e.target.value)}
                            placeholder="Region"
                            required
                          />
                          {errors.correspondenceRegion && (
                            <div className="error-message">{errors.correspondenceRegion}</div>
                          )}
                        </div>
                        <div className="form-group">
                          <label className="form-label">City/Village *</label>
                          <input
                            className={`form-input ${errors.correspondenceCity ? "error" : ""}`}
                            value={clientFormData.correspondenceCity}
                            onChange={(e) => handleClientFormChange("correspondenceCity", e.target.value)}
                            placeholder="City or Village"
                            required
                          />
                          {errors.correspondenceCity && (
                            <div className="error-message">{errors.correspondenceCity}</div>
                          )}
                        </div>
                      </div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Street *</label>
                          <input
                            className={`form-input ${errors.correspondenceStreet ? "error" : ""}`}
                            value={clientFormData.correspondenceStreet}
                            onChange={(e) => handleClientFormChange("correspondenceStreet", e.target.value)}
                            placeholder="Street name"
                            required
                          />
                          {errors.correspondenceStreet && (
                            <div className="error-message">{errors.correspondenceStreet}</div>
                          )}
                        </div>
                        <div className="form-group">
                          <label className="form-label">House *</label>
                          <input
                            className={`form-input ${errors.correspondenceHouse ? "error" : ""}`}
                            value={clientFormData.correspondenceHouse}
                            onChange={(e) => handleClientFormChange("correspondenceHouse", e.target.value)}
                            placeholder="House number"
                            required
                          />
                          {errors.correspondenceHouse && (
                            <div className="error-message">{errors.correspondenceHouse}</div>
                          )}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Apartment</label>
                          <input
                            className={`form-input ${errors.correspondenceApartment ? "error" : ""}`}
                            value={clientFormData.correspondenceApartment}
                            onChange={(e) => handleClientFormChange("correspondenceApartment", e.target.value)}
                            placeholder="Apartment (optional)"
                          />
                          {errors.correspondenceApartment && (
                            <div className="error-message">{errors.correspondenceApartment}</div>
                          )}
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Postal Code *</label>
                        <input
                          className={`form-input ${errors.correspondencePostalCode ? "error" : ""}`}
                          value={clientFormData.correspondencePostalCode}
                          onChange={(e) => handleClientFormChange("correspondencePostalCode", e.target.value)}
                          placeholder="Postal code"
                          required
                        />
                        {errors.correspondencePostalCode && (
                          <div className="error-message">{errors.correspondencePostalCode}</div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    id="marketingConsent"
                    checked={clientFormData.marketingConsent}
                    onChange={(e) => handleClientFormChange("marketingConsent", e.target.checked)}
                    className={errors.marketingConsent ? "error" : ""}
                  />
                  <label htmlFor="marketingConsent">Marketing consent *</label>
                  {errors.marketingConsent && <div className="error-message">{errors.marketingConsent}</div>}
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
                Create New Bank Account
              </h3>
              <button className="modal-close" onClick={() => closeModal("addAccount")}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddAccount}>
                <div className="form-group">
                  <label className="form-label">IBAN Number *</label>
                  <div className="iban-input-group">
                    <div className="iban-input">
                      <input
                        className={`form-input ${errors.iban ? "error" : ""}`}
                        value={accountFormData.iban}
                        onChange={(e) => handleAccountFormChange("iban", e.target.value)}
                        placeholder="LT123456789012345678"
                        required
                      />
                    </div>
                    <button type="button" className="button-secondary" onClick={handleGenerateIBAN}>
                      Generate
                    </button>
                  </div>
                  {errors.iban && <div className="error-message">{errors.iban}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Currency *</label>
                  <select
                    className="form-select"
                    value={accountFormData.currency}
                    onChange={(e) => handleAccountFormChange("currency", e.target.value)}
                    required
                  >
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="USD">USD</option>
                    <option value="NOK">NOK</option>
                    <option value="DKK">DKK</option>
                    <option value="SEK">SEK</option>
                    <option value="PLN">PLN</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Account Balance *</label>
                  <div style={{ position: "relative" }}>
                    <input
                      className={`form-input ${errors.balance ? "error" : ""}`}
                      value={accountFormData.balance}
                      onChange={(e) => handleAccountFormChange("balance", e.target.value)}
                      placeholder="0.00"
                      required
                      style={{ paddingRight: "50px" }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#6b7280",
                        fontSize: "14px",
                        pointerEvents: "none",
                      }}
                    >
                      {accountFormData.currency}
                    </span>
                  </div>
                  {errors.balance && <div className="error-message">{errors.balance}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Card Type *</label>
                  <select
                    className="form-select"
                    value={accountFormData.cardType}
                    onChange={(e) => handleAccountFormChange("cardType", e.target.value)}
                    required
                  >
                    <option value="Debeto">Debeto</option>
                    <option value="Kredito">Kredito</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Service Plan *</label>
                  <select
                    className="form-select"
                    value={accountFormData.servicePlan}
                    onChange={(e) => handleAccountFormChange("servicePlan", e.target.value)}
                    required
                  >
                    <option value="Jaunimo">Jaunimo</option>
                    <option value="Standard">Standard</option>
                    <option value="Gold">Gold</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Account Opening Date *</label>
                  <input
                    type="date"
                    className={`form-input ${errors.openingDate ? "error" : ""}`}
                    value={accountFormData.openingDate}
                    onChange={(e) => handleAccountFormChange("openingDate", e.target.value)}
                    required
                  />
                  {errors.openingDate && <div className="error-message">{errors.openingDate}</div>}
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

      {/* Add CRM Modal */}
      {isAddCrmOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal("addCrm")}>
          <div className={`modal-content ${modalClosing.addCrm ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <FileText size={20} color="#8b5cf6" />
                Create New CRM Entry
              </h3>
              <button className="modal-close" onClick={() => closeModal("addCrm")}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddCrm}>
                <div className="form-group">
                  <label className="form-label">Client Information (Auto-filled)</label>
                  <div className="client-info-box">
                    <p>
                      <strong>Name:</strong> {selectedPerson?.firstName} {selectedPerson?.lastName}
                    </p>
                    <p>
                      <strong>Personal Code:</strong> {selectedPerson?.personalCode}
                    </p>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Contact *</label>
                  <input
                    type="date"
                    className={`form-input ${errors.date ? "error" : ""}`}
                    value={crmFormData.date}
                    onChange={(e) => handleCrmFormChange("date", e.target.value)}
                    required
                  />
                  {errors.date && <div className="error-message">{errors.date}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Type *</label>
                  <select
                    className={`form-select ${errors.contactType ? "error" : ""}`}
                    value={crmFormData.contactType}
                    onChange={(e) => handleCrmFormChange("contactType", e.target.value)}
                    required
                  >
                    <option value="phone">Phone</option>
                    <option value="visit">Visit</option>
                    <option value="website">Website</option>
                  </select>
                  {errors.contactType && <div className="error-message">{errors.contactType}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Content * (max 200 characters)</label>
                  <textarea
                    className={`form-textarea ${errors.content ? "error" : ""}`}
                    value={crmFormData.content}
                    onChange={(e) => handleCrmFormChange("content", e.target.value)}
                    placeholder="Enter details of the interaction"
                    rows={5}
                    maxLength={200}
                    required
                  />
                  <div className="character-count">{crmFormData.content.length}/200 characters</div>
                  {errors.content && <div className="error-message">{errors.content}</div>}
                </div>
                <div className="form-actions">
                  <button type="button" className="button-secondary" onClick={() => closeModal("addCrm")}>
                    Cancel
                  </button>
                  <button type="submit" className="button-primary">
                    Save Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit CRM Modal */}
      {isEditCrmOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal("editCrm")}>
          <div
            className={`modal-content ${modalClosing.editCrm ? "closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                <Edit size={20} color="#8b5cf6" />
                Edit CRM Entry
              </h3>
              <button className="modal-close" onClick={() => closeModal("editCrm")}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdateCrm}>
                <div className="form-group">
                  <label className="form-label">Client Information (Read-only)</label>
                  <div className="client-info-box">
                    <p>
                      <strong>Name:</strong> {selectedPerson?.firstName} {selectedPerson?.lastName}
                    </p>
                    <p>
                      <strong>Personal Code:</strong> {selectedPerson?.personalCode}
                    </p>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Contact *</label>
                  <input
                    type="date"
                    className={`form-input ${errors.date ? "error" : ""}`}
                    value={crmFormData.date}
                    onChange={(e) => handleCrmFormChange("date", e.target.value)}
                    required
                  />
                  {errors.date && <div className="error-message">{errors.date}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Type *</label>
                  <select
                    className={`form-select ${errors.contactType ? "error" : ""}`}
                    value={crmFormData.contactType}
                    onChange={(e) => handleCrmFormChange("contactType", e.target.value)}
                    required
                  >
                    <option value="phone">Phone</option>
                    <option value="visit">Visit</option>
                    <option value="website">Website</option>
                  </select>
                  {errors.contactType && <div className="error-message">{errors.contactType}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Content * (max 200 characters)</label>
                  <textarea
                    className={`form-textarea ${errors.content ? "error" : ""}`}
                    value={crmFormData.content}
                    onChange={(e) => handleCrmFormChange("content", e.target.value)}
                    placeholder="Enter details of the interaction"
                    rows={5}
                    maxLength={200}
                    required
                  />
                  <div className="character-count">{crmFormData.content.length}/200 characters</div>
                  {errors.content && <div className="error-message">{errors.content}</div>}
                </div>
                <div className="form-actions">
                  <button type="button" className="button-secondary" onClick={() => closeModal("editCrm")}>
                    Cancel
                  </button>
                  <button type="submit" className="button-primary">
                    Update Entry
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