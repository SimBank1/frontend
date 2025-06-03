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
  Briefcase,
  Eye,
  EyeOff,
  Plus,
  Building,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

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
    phone: "037123456",
    username: "mkazlauskiene",
    password: "SecurePass123",
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
    phone: "037555666",
    username: "tpetrauskas",
    password: "MyPassword456",
    createdAt: "2024-02-15",
  },
]

export default function adminPanel() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [showPassword, setShowPassword] = useState({})
  const [data, setData] = useState(mockData)
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
  })
  const [errors, setErrors] = useState({})

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = data

    // Apply type filter
    if (activeFilter === "employees") {
      filtered = filtered.filter((person) => person.type === "employee")
    } else if (activeFilter === "clients") {
      filtered = filtered.filter((person) => person.type === "client")
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (person) =>
          person.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (person.type === "client" && person.personalCode.includes(searchTerm)),
      )
    }

    return filtered
  }, [searchTerm, activeFilter, data])

  const handlePersonClick = (person) => {
    setSelectedPerson(person)
  }

  const togglePasswordVisibility = (personId) => {
    setShowPassword((prev) => ({
      ...prev,
      [personId]: !prev[personId],
    }))
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
      phone: "", // Will be added later
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
    setIsAddEmployeeOpen(false)
    setShowNewPassword(false)

    // Show success message (you can implement a toast here)
    alert("Employee created successfully!")
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
    })
    setErrors({})
    setShowNewPassword(false)
  }

  const renderPersonList = () => {
    return filteredData.map((person) => (
      <Card
        key={person.id}
        className="mb-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => handlePersonClick(person)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {person.type === "employee" ? (
                <Briefcase className="w-5 h-5 text-blue-600" />
              ) : (
                <User className="w-5 h-5 text-green-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-medium text-gray-900 break-words leading-tight">
                  {person.firstName} {person.lastName}
                </h3>
                <Badge variant={person.type === "employee" ? "secondary" : "default"} className="flex-shrink-0 text-xs">
                  {person.type}
                </Badge>
              </div>
              {person.type === "client" && person.crmEntries.length > 0 && (
                <p className="text-sm text-gray-600 line-clamp-2 break-words">
                  {person.crmEntries[0].content.substring(0, 80)}...
                </p>
              )}
              {person.type === "employee" && <p className="text-sm text-gray-600 break-words">{person.email}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    ))
  }

  const renderPersonalInfo = () => {
    if (!selectedPerson) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Personal Information</h3>
            <p className="text-gray-500">Select a person to view their details</p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4 ">
        <div className="flex items-center gap-3 mb-6">
          {selectedPerson.type === "employee" ? (
            <Briefcase className="w-8 h-8 text-blue-600" />
          ) : (
            <User className="w-8 h-8 text-green-600" />
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {selectedPerson.firstName} {selectedPerson.lastName}
            </h2>
            <p className="text-gray-600 capitalize">{selectedPerson.type}</p>
          </div>
        </div>

        {/* Additional Information for Clients - Moved to top */}
        {selectedPerson.type === "client" && (
          <Card className>
            <CardHeader>
              <CardTitle className=" flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Document Expiry</label>
                  <p className="text-sm text-gray-900">{selectedPerson.documentExpiry}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Marketing Consent</label>
                  <p className="text-sm text-gray-900">{selectedPerson.marketingConsent ? "Yes" : "No"}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Correspondence Address
                </label>
                <p className="text-sm text-gray-900">{selectedPerson.correspondenceAddress}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedPerson.type === "client" ? (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Personal Code</label>
                  <p className="text-sm text-gray-900">{selectedPerson.personalCode}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Birth</label>
                  <p className="text-sm text-gray-900">{selectedPerson.dateOfBirth}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Document Type</label>
                  <p className="text-sm text-gray-900">{selectedPerson.documentType}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Document Number</label>
                  <p className="text-sm text-gray-900">{selectedPerson.documentNumber}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Username</label>
                  <p className="text-sm text-gray-900">{selectedPerson.username}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Password</label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-900 font-mono">
                      {showPassword[selectedPerson.id]
                        ? selectedPerson.password
                        : "*".repeat(selectedPerson.password.length)}
                    </p>
                    <button
                      onClick={() => togglePasswordVisibility(selectedPerson.id)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword[selectedPerson.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created</label>
                  <p className="text-sm text-gray-900">{selectedPerson.createdAt}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="w-4 h-4" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{selectedPerson.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{selectedPerson.phone}</span>
            </div>
            {selectedPerson.type === "client" && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Registration Address</p>
                  <p className="text-sm text-gray-600">{selectedPerson.registrationAddress}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bank Accounts for Clients */}
        {selectedPerson.type === "client" && selectedPerson.accounts && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-4 h-4" />
                Bank Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPerson.accounts.map((account) => (
                <div key={account.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{account.iban}</span>
                    <Badge variant="outline">{account.currency}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Balance: </span>
                      <span className="font-medium">
                        {account.balance.toFixed(2)} {account.currency}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Plan: </span>
                      <span>{account.servicePlan}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderCRMRequests = () => {
    if (!selectedPerson) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Customer Relations Management</h2>
            <p className="text-gray-500">Select a client to view CRM requests</p>
          </div>
        </div>
      )
    }

    if (selectedPerson.type === "employee") {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Employee Profile</h2>
            <p className="text-gray-500">Employees do not have CRM data</p>
            <p className="text-gray-500">Personal information is shown in the left panel</p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">CRM History</h2>
            <p className="text-gray-600">
              {selectedPerson.firstName} {selectedPerson.lastName}
            </p>
          </div>
        </div>

        {/* CRM Entries */}
        <div className="space-y-4">
          {selectedPerson.crmEntries && selectedPerson.crmEntries.length > 0 ? (
            selectedPerson.crmEntries.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{entry.contactType}</Badge>
                    <span className="text-sm text-gray-500">{entry.date}</span>
                    <span className="text-sm text-gray-500">by {entry.employeeName}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{entry.content}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No CRM entries found for this client</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Search and Entity List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Company Logo and Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">CRM System</h1>
              <p className="text-xs text-gray-500">Company Management</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col gap-2">
            <Button
              variant={activeFilter === "all" ? "default" : "ghost"}
              onClick={() => setActiveFilter("all")}
              className="justify-start"
            >
              <Users className="w-4 h-4 mr-2" />
              All
            </Button>
            <Button
              variant={activeFilter === "employees" ? "default" : "ghost"}
              onClick={() => setActiveFilter("employees")}
              className="justify-start"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Employees
            </Button>
            <Button
              variant={activeFilter === "clients" ? "default" : "ghost"}
              onClick={() => setActiveFilter("clients")}
              className="justify-start"
            >
              <User className="w-4 h-4 mr-2" />
              Clients
            </Button>
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Users (alphabetical order):</h3>
          {renderPersonList()}
        </div>

        {/* Bottom Buttons */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            {/* Add Employee Button - Wider */}
            <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 justify-start" onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Add New Employee
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter first name"
                      className={errors.firstName ? "border-red-500" : ""}
                    />
                    {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter last name"
                      className={errors.lastName ? "border-red-500" : ""}
                    />
                    {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="user@example.com"
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      placeholder="Enter username (4-20 characters)"
                      className={errors.username ? "border-red-500" : ""}
                    />
                    {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showNewPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder="Enter password (min 8 characters)"
                        className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      Create Employee
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddEmployeeOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Logout Button - Square */}
            <Button variant="outline" size="icon" className="w-10 h-10 flex-shrink-0">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Middle Panel - Personal Information */}
      <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Data</h2>
          {renderPersonalInfo()}
        </div>
      </div>

      {/* Right Panel - CRM Requests */}
      <div className="flex-1 p-6 overflow-y-auto">{renderCRMRequests()}</div>
    </div>
  )
}
