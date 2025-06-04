import { useState, useMemo } from "react"
import { Search, Users, User, Phone, Mail, MapPin, CreditCard, Calendar, FileText, LogOut, Plus, Building, UserPlus } from 'lucide-react'
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Textarea } from "../ui/textarea"
import './EmployeePanel.css'

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
]

export default function EmployeePanel() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [data, setData] = useState(mockData)
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [isAddCrmOpen, setIsAddCrmOpen] = useState(false)
  const [crmFormData, setCrmFormData] = useState({
    contactType: "Phone",
    content: "",
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
    marketingConsent: false,
  })

  // Form state for new account
  const [accountFormData, setAccountFormData] = useState({
    currency: "EUR",
    cardType: "Debeto",
    servicePlan: "Standard",
  })

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
    setClientFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAccountFormChange = (field, value) => {
    setAccountFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCrmFormChange = (field, value) => {
    setCrmFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddClient = (e) => {
    e.preventDefault()

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
      marketingConsent: false,
    })
    setIsAddClientOpen(false)
    setSelectedPerson(newClient)
  }

  const handleAddAccount = (e) => {
    e.preventDefault()

    if (!selectedPerson) return

    const newAccount = {
      id: `acc${selectedPerson.accounts ? selectedPerson.accounts.length + 1 : 1}`,
      iban: `LT${Math.floor(Math.random() * 1000000000000000000)}`,
      balance: 0,
      openingDate: new Date().toISOString().split("T")[0],
      ...accountFormData,
    }

    const updatedPerson = {
      ...selectedPerson,
      accounts: [...(selectedPerson.accounts || []), newAccount],
    }

    setData((prev) => prev.map((person) => (person.id === selectedPerson.id ? updatedPerson : person)))
    setSelectedPerson(updatedPerson)
    setAccountFormData({
      currency: "EUR",
      cardType: "Debeto",
      servicePlan: "Standard",
    })
    setIsAddAccountOpen(false)
  }

  const handleAddCrm = (e) => {
    e.preventDefault()

    if (!selectedPerson) return

    const newCrmEntry = {
      id: `crm${selectedPerson.crmEntries ? selectedPerson.crmEntries.length + 1 : 1}`,
      date: new Date().toISOString().split("T")[0],
      employeeName: "Current Employee",
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
    })
    setIsAddCrmOpen(false)
  }

  const renderPersonList = () => {
    return filteredData.map((person, index) => (
      <div key={person.id} className="client-card" onClick={() => handlePersonClick(person)}>
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
              <p className="client-preview">
                {person.crmEntries[0].content.substring(0, 80)}...
              </p>
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
      <div>
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={24} color="white" />
          </div>
          <div className="profile-info">
            <h2>{selectedPerson.firstName} {selectedPerson.lastName}</h2>
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
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">
              <CreditCard size={16} />
              Bank Accounts
            </h3>
            <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
              <DialogTrigger asChild>
                <button className="button-secondary" style={{ background: 'white', color: '#7c3aed', fontSize: '12px', padding: '4px 8px' }}>
                  <Plus size={14} style={{ marginRight: '4px' }} /> Add Account
                </button>
              </DialogTrigger>
              <DialogContent className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsAddAccountOpen(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3 className="modal-title">Create New Bank Account</h3>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleAddAccount}>
                      <div className="form-group">
                        <label className="form-label">Currency</label>
                        <select 
                          className="form-input"
                          value={accountFormData.currency}
                          onChange={(e) => handleAccountFormChange("currency", e.target.value)}
                        >
                          <option value="EUR">EUR</option>
                          <option value="USD">USD</option>
                          <option value="GBP">GBP</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Card Type</label>
                        <select 
                          className="form-input"
                          value={accountFormData.cardType}
                          onChange={(e) => handleAccountFormChange("cardType", e.target.value)}
                        >
                          <option value="Debeto">Debit</option>
                          <option value="Kredito">Credit</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Service Plan</label>
                        <select 
                          className="form-input"
                          value={accountFormData.servicePlan}
                          onChange={(e) => handleAccountFormChange("servicePlan", e.target.value)}
                        >
                          <option value="Standard">Standard</option>
                          <option value="Gold">Gold</option>
                          <option value="Platinum">Platinum</option>
                        </select>
                      </div>
                      <div className="form-actions">
                        <button type="button" className="button-secondary" onClick={() => setIsAddAccountOpen(false)}>
                          Cancel
                        </button>
                        <button type="submit" className="button-primary">
                          Create Account
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="card-content">
            {selectedPerson.accounts && selectedPerson.accounts.length > 0 ? (
              <div>
                {selectedPerson.accounts.map((account) => (
                  <div key={account.id} className="account-item">
                    <div className="account-header">
                      <span className="account-iban">{account.iban}</span>
                      <span className="account-badge">{account.currency}</span>
                    </div>
                    <div className="account-details">
                      <div className="account-detail">
                        <div className="info-label">Balance</div>
                        <div className="info-value">{account.balance.toFixed(2)} {account.currency}</div>
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
      <div>
        <div className="crm-header">
          <div className="crm-info">
            <div className="crm-avatar">
              <FileText size={24} color="white" />
            </div>
            <div className="crm-title">
              <h2>CRM History</h2>
              <p>{selectedPerson.firstName} {selectedPerson.lastName}</p>
            </div>
          </div>

          <Dialog open={isAddCrmOpen} onOpenChange={setIsAddCrmOpen}>
            <DialogTrigger asChild>
              <button className="button-primary">
                <Plus size={16} style={{ marginRight: '8px' }} /> Add CRM Entry
              </button>
            </DialogTrigger>
            <DialogContent className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsAddCrmOpen(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3 className="modal-title">Create New CRM Entry</h3>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleAddCrm}>
                    <div className="form-group">
                      <label className="form-label">Contact Type</label>
                      <select 
                        className="form-input"
                        value={crmFormData.contactType}
                        onChange={(e) => handleCrmFormChange("contactType", e.target.value)}
                      >
                        <option value="Phone">Phone</option>
                        <option value="Email">Email</option>
                        <option value="Visit">Visit</option>
                        <option value="Video Call">Video Call</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Content</label>
                      <textarea
                        className="form-textarea"
                        value={crmFormData.content}
                        onChange={(e) => handleCrmFormChange("content", e.target.value)}
                        placeholder="Enter details of the interaction"
                        required
                      />
                    </div>
                    <div className="form-actions">
                      <button type="button" className="button-secondary" onClick={() => setIsAddCrmOpen(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="button-primary">
                        Save Entry
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
              <p className="no-data-subtext">Create a new entry to start tracking client interactions</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="employee-panel">
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
            <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
              <DialogTrigger asChild>
                <button className="add-button">
                  <Plus size={16} color="#8b5cf6" />
                </button>
              </DialogTrigger>
              <DialogContent className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsAddClientOpen(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3 className="modal-title">
                      <UserPlus size={20} color="#8b5cf6" />
                      Create New Client
                    </h3>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleAddClient}>
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">First Name *</label>
                          <input
                            className="form-input"
                            value={clientFormData.firstName}
                            onChange={(e) => handleClientFormChange("firstName", e.target.value)}
                            placeholder="Enter first name"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Last Name *</label>
                          <input
                            className="form-input"
                            value={clientFormData.lastName}
                            onChange={(e) => handleClientFormChange("lastName", e.target.value)}
                            placeholder="Enter last name"
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Personal Code *</label>
                        <input
                          className="form-input"
                          value={clientFormData.personalCode}
                          onChange={(e) => handleClientFormChange("personalCode", e.target.value)}
                          placeholder="Enter personal code"
                          required
                        />
                      </div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-input"
                            value={clientFormData.email}
                            onChange={(e) => handleClientFormChange("email", e.target.value)}
                            placeholder="Enter email"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Phone</label>
                          <input
                            className="form-input"
                            value={clientFormData.phone}
                            onChange={(e) => handleClientFormChange("phone", e.target.value)}
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                      <div className="form-actions">
                        <button type="button" className="button-secondary" onClick={() => setIsAddClientOpen(false)}>
                          Cancel
                        </button>
                        <button type="submit" className="button-primary">
                          Create Client
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="nav-buttons">
            <button className="nav-button">
              <Users size={16} style={{ marginRight: '8px', color: '#8b5cf6' }} />
              All Clients
            </button>
            <button className="nav-button">
              <Calendar size={16} style={{ marginRight: '8px', color: '#8b5cf6' }} />
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
            <button 
              className="primary-button"
              onClick={() => setIsAddClientOpen(true)}
            >
              <UserPlus size={16} style={{ marginRight: '8px' }} />
              New Client
            </button>
            <button className="icon-button">
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
      <div className="right-panel">
        {renderCRMRequests()}
      </div>
    </div>
  )
}