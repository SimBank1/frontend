"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
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
  Trash2,
  ChevronDown,
  ChevronRight,
  SquareUser,
  PlugZap,
  UserCheck,
  Clock,
  AlertCircle,
  Shield,
  Pyramid,
} from "lucide-react";
import "./employeePanel.css";
import { getServerLink } from "@/server_link";
import { parsePhoneNumberFromString } from 'libphonenumber-js'

export default function EmployeePanel({ data: initialData, currentUser, username }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [data, setData] = useState(initialData?.clients || [])
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [isAddCrmOpen, setIsAddCrmOpen] = useState(false)
  const [isEditCrmOpen, setIsEditCrmOpen] = useState(false)
  const [isDeleteClientOpen, setIsDeleteClientOpen] = useState(false)
  const [isDeleteCrmOpen, setIsDeleteCrmOpen] = useState(false)
  const [editingCrmEntry, setEditingCrmEntry] = useState(null)
  const [deletingCrmEntry, setDeletingCrmEntry] = useState(null)
  const [errors, setErrors] = useState({})

  const [employeeUsername] = useState(username);

  const [isLogoutOpen, setIsLogoutOpen] = useState(false)
  const [sameAsRegistration, setSameAsRegistration] = useState(true)
  const [expandedCrmEntries, setExpandedCrmEntries] = useState({})
  const [closingCrmEntry, setClosingCrmEntry] = useState(null)
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false)
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(null)

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

  // Handle mouse up on modal overlay - only close if it's the same target as mouse down
  const handleModalMouseUp = (e, modalType) => {
    if (e.target === e.currentTarget && e.target === mouseDownTarget) {
      closeModal(modalType)
    }
    setMouseDownTarget(null)
  }



  useEffect(() => {
    if (selectedPerson) {
      localStorage.setItem("lastSelectedPersonId", selectedPerson.id);

    }
  }, [selectedPerson]);



  useEffect(() => {
    const lastSelectedPersonId = localStorage.getItem("lastSelectedPersonId");
    if (lastSelectedPersonId && data.length > 0) {
      const foundPerson = data.find(
        (person) => String(person.id) === String(lastSelectedPersonId)
      );
      if (foundPerson) {
        setSelectedPerson(foundPerson);
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



  function formatPhoneNumber(input, defaultCountry = 'LT') {
    if (!input) return '';

    const phoneNumber = parsePhoneNumberFromString(input, defaultCountry);

    if (!phoneNumber || !phoneNumber.isValid()) return input; // fallback to raw input

    return phoneNumber.formatInternational(); // always returns in +XXX format
  }


  // Apple-style success animation states
  const [showSuccess, setShowSuccess] = useState(false)
  const [closing, setClosing] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Search input ref for focus management
  const searchInputRef = useRef(null)


  const selectedClientRef = useRef(null)

  // Apple-style success animation implementation
  const triggerSuccess = (message) => {
    setSuccessMessage(message)
    setShowSuccess(true)
    setClosing(false)
  }
  // Automatically start closing after 3.5s
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setClosing(true)
      }, 3500)
      // Cleanup timeout if unmounted or toast hidden early
      return () => clearTimeout(timer)
    }
  }, [showSuccess])
  // Remove toast after closing animation ends (~400ms)
  useEffect(() => {
    if (closing) {
      const timer = setTimeout(() => {
        setShowSuccess(false)
        setClosing(false)
        setSuccessMessage("")
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [closing])


  // Tracks which modal is in the process of closing (for fade‐out animation)
  const [modalClosing, setModalClosing] = useState({
    addClient: false,
    addAccount: false,
    addCrm: false,
    editCrm: false,
    editInfo: false,
    deleteClient: false,
    deleteCrm: false,
    deleteAccount: false,
    logout: false,
  })

  const [crmFormData, setCrmFormData] = useState({
    title: "",
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
    secondPhone: "",
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
    cardType: "none",
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
        if (isEditInfoOpen) closeModal("editInfo")
        if (isDeleteClientOpen) closeModal("deleteClient")
        if (isDeleteCrmOpen) closeModal("deleteCrm")
        if (isDeleteAccountOpen) closeModal("deleteAccount")
        if (isLogoutOpen) closeModal("logout")
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [
    isAddClientOpen,
    isAddAccountOpen,
    isAddCrmOpen,
    isEditCrmOpen,
    isEditInfoOpen,
    isDeleteClientOpen,
    isDeleteCrmOpen,
    isDeleteAccountOpen,
    isLogoutOpen,
    searchTerm,
  ])

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
        case "editInfo":
          setIsEditInfoOpen(false)
          break
        case "deleteClient":
          setIsDeleteClientOpen(false)
          break
        case "deleteCrm":
          setIsDeleteCrmOpen(false)
          setDeletingCrmEntry(null)
          break
        case "deleteAccount":
          setIsDeleteAccountOpen(false)
          setDeletingAccount(null)
          break
        case "logout":
          setIsLogoutOpen(false)
          break
      }
      setModalClosing((prev) => ({ ...prev, [modalType]: false }))
    }, 200)
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

  const fetchGeneratedIBAN = async () => {

    try {
      const response = await fetch(`${getServerLink()}/generateIBAN`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ personal_code: String(selectedPerson.personalCode) }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`IBAN request failed: ${errText}`);
      }

      const iban = await response.text();
      return iban;
    } catch (error) {
      console.error("Failed to generate IBAN:", error);
      return null;
    }
  };

  const isSameAddress = (addr1, addr2) => {
    if (!addr1 || !addr2) return false;
    return (
      addr1.street === addr2.street &&
      addr1.house === addr2.house &&
      addr1.apartment === addr2.apartment &&
      addr1.postalCode === addr2.postalCode &&
      addr1.cityOrVillage === addr2.cityOrVillage &&
      addr1.region === addr2.region &&
      addr1.country === addr2.country
    );
  };
  


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

    const monthNum = Number.parseInt(month, 10)
    const dayNum = Number.parseInt(day, 10)
    if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
      return ""
    }

    return `${fullYear}-${month}-${day}`
  }

  const handleGenerateIBAN = async () => {
    // 2) Wait for the text response
    const newIBAN = await fetchGeneratedIBAN()

    if (newIBAN) {
      // 3) Only now update your state with the real string
      setAccountFormData((prev) => ({ ...prev, iban: newIBAN }))
      // clear any prior validation error
      if (errors.iban) {
        setErrors((prev) => ({ ...prev, iban: null }))
      }
    } else {
      triggerSuccess("Failed to generate IBAN. Please try again.")
    }
  }

  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !text) return text

    const normText = normalize(text)
    const normSearch = normalize(searchTerm)

    const matchIndex = normText.indexOf(normSearch)
    if (matchIndex === -1) return text

    let normCount = 0
    let start = -1
    let end = -1
    for (let i = 0; i < text.length; i++) {
      if (normalize(text[i])) {
        if (normCount === matchIndex) start = i
        if (normCount === matchIndex + normSearch.length - 1) {
          end = i + 1
          break
        }
        normCount++
      }
    }

    if (start === -1 || end === -1) return text

    return (
      <>
        {text.slice(0, start)}
        <span className="highlight-search">{text.slice(start, end)}</span>
        {text.slice(end)}
      </>
    )
  }

  // VALIDATION HELPERS
  const validatePersonalCode = (code) => {
    if (!/^\d{11}$/.test(code)) {
      return "Personal code must be exactly 11 digits"
    }

    const inputCode = Number(code.trim());

    const codeExists = data.some(
      (person) => Number(person.personalCode) === inputCode
    );

    if (codeExists) {
      return "Personal code already in use";
    }

    return null;
  };



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
    if (!phone) return false

    let cleanedPhone = phone.replace(/\s+/g, '')
    if (cleanedPhone.startsWith('00')) {
      cleanedPhone = '+' + cleanedPhone.slice(2)
    }

    return false
  }

  const validateIBAN = (iban) => {
    if (!/^LT8170440\d{11}$/.test(iban)) {
      return "IBAN must start with LT8170440 followed by exactly 11 digits"
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
    if (date) {
      // Placeholder for future validation logic
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

  const validateTitle = (title) => {
    if (!title.trim()) {
      return "Title is required"
    }
    if (title.length > 75) {
      return "Title exceeds 75 characters"
    }
    return null
  }

  const validateContent = (content) => {
    if (!content.trim()) {
      return "Content is required"
    }
    if (content.length > 750) {
      return "Content exceeds 750 characters"
    }
    return null
  }

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!validateClientForm()) return;

    // Construct the payload with keys matching the exact snake_case JSON structure your backend expects
    const payload = {
      // Top-level fields (snake_case)
      first_name: clientFormData.firstName,
      last_name: clientFormData.lastName,
      email: clientFormData.email,
      personal_code: clientFormData.personalCode,
      doc_type: clientFormData.documentType,
      doc_number: clientFormData.documentNumber,
      doc_expiry_date: clientFormData.documentExpiry,
      date_of_birth: clientFormData.dateOfBirth,
      phone_number: clientFormData.phone,
      other_phone_number: clientFormData.secondPhone, // Ensure this maps correctly from your form data
      marketing_consent: clientFormData.marketingConsent,

      // Nested Address objects (snake_case for the object names, but cityOrVillage/postalCode are still camelCase within them as per your provided perfect input)
      reg_address: { // Matches 'reg_address' in your perfect JSON
        country: clientFormData.registrationCountry,
        region: clientFormData.registrationRegion || null,
        cityOrVillage: clientFormData.registrationCity || null, // Still camelCase here as per your input
        street: clientFormData.registrationStreet,
        house: clientFormData.registrationHouse || null,
        apartment: clientFormData.registrationApartment || null,
        postalCode: clientFormData.registrationPostalCode || null // Still camelCase here as per your input
      },

      cor_address: { // Matches 'cor_address' in your perfect JSON
        country: clientFormData.correspondenceCountry,
        region: clientFormData.correspondenceRegion || null,
        cityOrVillage: clientFormData.correspondenceCity || null,
        street: clientFormData.correspondenceStreet,
        house: clientFormData.correspondenceHouse || null,
        apartment: clientFormData.correspondenceApartment || null,
        postalCode: clientFormData.correspondencePostalCode || null
      },

      // Array fields (snake_case as per your perfect JSON)
      bank_accs: [],
      crm: [],

      // Stringified JSON object (snake_case as per your perfect JSON)
      other_bank_accounts: JSON.stringify({
        bank: "",
        iban: "",
      }),
    };

    try {
      const response = await fetch(getServerLink() + "/createClient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (response.ok) {
        // As discussed, if backend returns empty string, read as text.
        // If backend starts returning JSON, change this back to `await response.json()`.


        await response.text();

        // Add to local state (assuming client creation was successful based on response.ok)
        // Note: Since backend returns empty string, you don't get the actual ID back.
        // You might need to generate a temporary ID or refetch data if real ID is crucial.
        const newClient = {
          id: (data.length + 1).toString(), // Temporary ID
          firstName: clientFormData.firstName,
          lastName: clientFormData.lastName,
          personalCode: clientFormData.personalCode,
          email: clientFormData.email,
          phoneNumber: clientFormData.phone,
          otherPhoneNumber: clientFormData.secondPhone,
          docType: clientFormData.documentType,
          docNumber: clientFormData.documentNumber,
          docExpiryDate: clientFormData.documentExpiry,
          dateOfBirth: clientFormData.dateOfBirth,
          marketingConsent: clientFormData.marketingConsent,

          regAddress: {
            country: clientFormData.registrationCountry,
            region: clientFormData.registrationRegion || null,
            cityOrVillage: clientFormData.registrationCity || null,
            street: clientFormData.registrationStreet,
            house: clientFormData.registrationHouse || null,
            apartment: clientFormData.registrationApartment || null,
            postalCode: clientFormData.registrationPostalCode || null
          },
          corAddress: {
            country: clientFormData.correspondenceCountry,
            region: clientFormData.correspondenceRegion || null,
            cityOrVillage: clientFormData.correspondenceCity || null,
            street: clientFormData.correspondenceStreet,
            house: clientFormData.correspondenceHouse || null,
            apartment: clientFormData.correspondenceApartment || null,
            postalCode: clientFormData.correspondencePostalCode || null
          },

          // These are the frontend's internal names, mapping from the snake_case payload
          accounts: [], // Assuming this maps to bank_accs
          crmEntries: [], // Assuming this maps to crm
          otherBankAccounts: JSON.parse(payload.other_bank_accounts) // Parse string back to object for frontend state
        };


        setData((prev) => [newClient, ...prev]);

        // Reset form
        setClientFormData({
          firstName: "",
          lastName: "",
          personalCode: "",
          email: "",
          phone: "",
          secondPhone: "",
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
        });

        setErrors({});
        closeModal("addClient");

        setTimeout(() => {
          setSelectedPerson(newClient);
          triggerSuccess("Client profile created successfully!");
        }, 200);
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to create client: ${errorText}`);
      }

    } catch (error) {
      console.error("Error creating client:", error);
      triggerSuccess(`Failed to create client. Error: ${error.message}`);
    }
  };



  const validateClientForm = (notEmail = false, skipPersonalCode = false) => {
    const newErrors = {};
  
    // First Name
    if (!clientFormData.firstName?.trim()) {
      newErrors.firstName = "First name is required.";
    } else {
      const firstNameError = validateName(clientFormData.firstName, "First name");
      if (firstNameError) newErrors.firstName = firstNameError;
    }
  
    // Last Name
    if (!clientFormData.lastName?.trim()) {
      newErrors.lastName = "Last name is required.";
    } else {
      const lastNameError = validateName(clientFormData.lastName, "Last name");
      if (lastNameError) newErrors.lastName = lastNameError;
    }
  
    // Personal Code

    if (!skipPersonalCode) {
      if (!String(clientFormData.personalCode || "").trim()) {
        newErrors.personalCode = "Personal code is required.";
      } else {
        const personalCodeError = validatePersonalCode(String(clientFormData.personalCode));
        if (personalCodeError) newErrors.personalCode = personalCodeError;
      }
    }
  
  
    // Document Number
    if (!String(clientFormData.documentNumber || "").trim()) {
      newErrors.documentNumber = "Document number is required.";
    } else {
      const documentNumberError = validateDocumentNumber(clientFormData.documentNumber);
      if (documentNumberError) newErrors.documentNumber = documentNumberError;
    }
  
    // Document Expiry
    if (!clientFormData.documentExpiry) {
      newErrors.documentExpiry = "Document expiry date is required.";
    } else {
      const expiryError = validateFutureDate(clientFormData.documentExpiry);
      if (expiryError) newErrors.documentExpiry = expiryError;
    }
  
    // Email
    if (!notEmail && clientFormData.email?.trim()) {
      const emailError = validateEmail(clientFormData.email);
      if (emailError) newErrors.email = emailError;
    }
    else{
      if(clientFormData.email?.trim()){
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailError = regex.test(clientFormData.email);
      if (!emailError) newErrors.email = emailError;
}
    }
  
    // Phone
    if (clientFormData.phone?.trim()) {
      const phoneError = validatePhone(clientFormData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  

  const handleClientFormChange = async (field, value) => {
    if (field === "personalCode") {
      const dateOfBirth = getDateOfBirthFromPersonalCode(value);

      setClientFormData((prev) => ({
        ...prev,
        [field]: value,
        dateOfBirth,
      }));

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }

      return;
    }

    setClientFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };


  const copyRegistrationToCorrespondence = useCallback(() => {
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
, [sameAsRegistration])

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
    copyRegistrationToCorrespondence,
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

    console.log("hej", selectedPerson)

    if (selectedPerson && accountFormData.currency !== "EUR") {
      const existingCurrencyAccounts =
        selectedPerson.bank_accs?.filter((acc) => acc.currency === accountFormData.currency) || []
      if (existingCurrencyAccounts.length >= 1) {
        newErrors.currency = `Only one ${accountFormData.currency} account allowed per client`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAccountFormChange = (field, value) => {
    setAccountFormData((prev) => ({ ...prev, [field]: value }))

    // Reset card type if service plan doesn't support cards
    if (field === "servicePlan" && !["Jaunimo", "Standard", "Gold"].includes(value)) {
      setAccountFormData((prev) => ({ ...prev, cardType: "none" }))
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }





  const createBankAccount = async (accountData) => {
    console.log(accountData)
    try {
      const response = await fetch(getServerLink() + "/createBankAcc", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
        credentials: "include"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("Error in createBankAccount API call:", error);
      throw error;
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();

    if (!selectedPerson) return;
    if (!validateAccountForm()) return;

    const newAccount = {
      id: `acc${selectedPerson.accounts ? selectedPerson.accounts.length + 1 : 1}`,
      ...accountFormData,
      balance: Number.parseFloat(accountFormData.balance),
    };

    const apiAccount = {
      id: selectedPerson.accounts?.length + 1 || 1,
      first_name: selectedPerson.firstName,
      personal_code: Number(selectedPerson.personalCode),
      iban: accountFormData.iban,
      currency: accountFormData.currency,
      balance: Math.round(Number(accountFormData.balance)),
      type: accountFormData.cardType === "none" ? "" : accountFormData.cardType,
      plan: accountFormData.servicePlan,
      opening_date: accountFormData.openingDate,
    };

    try {
      const responseFromApi = await createBankAccount(apiAccount);
      console.log("Bank account created successfully on backend:", responseFromApi);

      const updatedPerson = {
        ...selectedPerson,
        bank_accs: [...(selectedPerson.bank_accs || []), newAccount],
      };

      console.log(updatedPerson)

      setData((prev) =>
        prev.map((person) => (person.personalCode === selectedPerson.personalCode ? updatedPerson : person))
      );
      setSelectedPerson(updatedPerson);





      setAccountFormData({
        iban: "",
        currency: "EUR",
        balance: "",
        cardType: "none",
        servicePlan: "Standard",
        openingDate: new Date().toISOString().split("T")[0],
      });
      setErrors({});
      closeModal("addAccount");

      setTimeout(() => {
        triggerSuccess("Bank account created successfully!");
      }, 200);

    } catch (err) {
      console.error("Failed to create bank account:", err);
    }
  };


  // ADD CRM ENTRY with new structure and employee username
  const validateCrmForm = () => {
    const newErrors = {}

    const titleError = validateTitle(crmFormData.title)
    if (titleError) newErrors.title = titleError

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
    e.preventDefault();
    if (!selectedPerson) return;
    if (!validateCrmForm()) return;

    // Generate a 1-based numeric ID for the new CRM entry
    // This ID will be used for both local state and sent to the backend.
    const newId = (selectedPerson.crm && selectedPerson.crm.length > 0)
      ? Math.max(...selectedPerson.crm.map(entry => entry.id || 0)) + 1 // Find max existing ID and add 1
      : 1; // Start with 1 if no existing CRM entries

    const crmData = {
      id: newId, // Assign the new 1-based ID
      personal_code: selectedPerson.personalCode,
      date_of_contact: crmFormData.date,
      contact_type: crmFormData.contactType,
      title: crmFormData.title,
      content: crmFormData.content.replace(/\n/g, '\\n').replace(/\r/g, '\\r'),
      username: employeeUsername || "unknown",
    };



    try {
      const response = await fetch(getServerLink() + "/createCRM", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(crmData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create CRM entry");
      }

      // The newCrmEntry for local state should match the structure you display
      const newCrmEntry = {
        id: newId, // Use the generated 1-based ID
        title: crmFormData.title,
        username: employeeUsername || "unknown",
        canEdit: true, // Assuming this is derived logic, not from DB
        contactType: crmFormData.contactType,
        content: crmFormData.content,
        date: crmFormData.date, // Use the frontend date format
      };

      const updatedPerson = {
        ...selectedPerson,
        crm: [...(selectedPerson.crm || []), newCrmEntry],
      };

      setData((prev) => prev.map((person) => (person.id === selectedPerson.id ? updatedPerson : person)));
      setSelectedPerson(updatedPerson);
      setCrmFormData({
        title: "",
        contactType: "phone",
        content: "",
        date: new Date().toISOString().split("T")[0],
      });
      setErrors({});
      closeModal("addCrm");
      setTimeout(() => {
        triggerSuccess("CRM entry added successfully!");
      }, 200);
    } catch (error) {
      console.error("Error creating CRM entry:", error);
      triggerSuccess("Error creating CRM entry. Please try again.");
    }
  };


  const handleEditCrm = (entry) => {
    // When editing, load existing data, using snake_case properties from DB
    setEditingCrmEntry(entry);
    setCrmFormData({
      title: entry.title || "",
      contactType: entry.contact_type, // Use contact_type from DB
      content: entry.content,
      date: entry.date_of_contact,    // Use date_of_contact from DB
    });
    setIsEditCrmOpen(true);
  };




  const handleUpdateCrm = async (e) => {
    e.preventDefault();
    if (!validateCrmForm()) return;
    if (!editingCrmEntry || !selectedPerson) return;

    const entryIndex = selectedPerson.crm.findIndex(
      (entry) =>
        entry.id === editingCrmEntry.id &&
        entry.username === editingCrmEntry.username &&
        entry.title === editingCrmEntry.title &&
        entry.contact_type === editingCrmEntry.contact_type &&
        entry.content === editingCrmEntry.content &&
        entry.date_of_contact === editingCrmEntry.date_of_contact
    );


    const updatedCrmData = {
      id: entryIndex + 1,
      personal_code: selectedPerson.personalCode,
      title: crmFormData.title,
      contact_type: crmFormData.contactType,
      content: crmFormData.content,
      date_of_contact: crmFormData.date,
    };

    try {
      const response = await fetch(getServerLink() + "/editCRM", {
        method: "POST", // Keep as POST to match your @PostMapping backend
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedCrmData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update CRM entry");
      }

      // Update the local state's `crm` array
      const updatedCrmEntries = selectedPerson.crm.map((entry) =>
        entry.id === editingCrmEntry.id &&
          entry.title === editingCrmEntry.title &&
          entry.contact_type === editingCrmEntry.contact_type &&
          entry.content === editingCrmEntry.content &&
          entry.date_of_contact === editingCrmEntry.date_of_contact

          ? {
            ...entry,
            // Update specific fields. Ensure snake_case from form matches DB fields.
            title: crmFormData.title,
            contact_type: crmFormData.contactType,
            content: crmFormData.content,
            date_of_contact: crmFormData.date,
            // employeeName: currentUser?.username || "Current Employee", // Update if necessary
          }
          : entry
      );

      const updatedPerson = {
        ...selectedPerson,
        crm: updatedCrmEntries,
      };

      setData((prev) => prev.map((person) => (person.id === selectedPerson.id ? updatedPerson : person)));
      setSelectedPerson(updatedPerson); // Update selected person to show changes immediately

      setEditingCrmEntry(null);
      setCrmFormData({
        title: "",
        contactType: "phone",
        content: "",
        date: new Date().toISOString().split("T")[0],
      });
      setErrors({});
      closeModal("editCrm");
      setTimeout(() => {
        triggerSuccess("CRM entry updated successfully!");
      }, 200);
    } catch (error) {
      console.error("Error updating CRM entry:", error);
      triggerSuccess("Error updating CRM entry. Please try again.");
    }
  };



  const handleDeleteCrm = (entry) => {
    setDeletingCrmEntry(entry)
    setIsDeleteCrmOpen(true)
  }

  const confirmDeleteCrm = async () => {
    if (!deletingCrmEntry || !selectedPerson) return;


    const entryIndex = selectedPerson.crm.findIndex(
      (entry) =>
        entry &&
        entry.username === deletingCrmEntry.username &&
        entry.title === deletingCrmEntry.title &&
        entry.contact_type === deletingCrmEntry.contact_type &&
        entry.content === deletingCrmEntry.content &&
        entry.date_of_contact === deletingCrmEntry.date_of_contact
    );


    if (entryIndex === -1) {
      triggerSuccess("CRM entry not found.");
      return;
    }

    // Prepare the data to send for deletion
    const deleteCrmData = {
      id: entryIndex + 1,
      personal_code: selectedPerson.personalCode,
      username: deletingCrmEntry.username
    };

    console.log(deleteCrmData)

    try {
      const response = await fetch(getServerLink() + "/deleteCRM", {
        method: "POST", // Assuming backend expects POST for delete
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(deleteCrmData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete CRM entry");
      }
      if (data.error) {

        setTimeout(() => {
          triggerSuccess("Only creator can delete CRM!");
        }, 200);
        return


      }

      const updatedCrmEntries = selectedPerson.crm.filter(
        (entry) =>
          !(
            entry.username === deletingCrmEntry.username &&
            entry.title === deletingCrmEntry.title &&
            entry.contact_type === deletingCrmEntry.contact_type &&
            entry.content === deletingCrmEntry.content &&
            entry.date_of_contact === deletingCrmEntry.date_of_contact
          )
      );

      const updatedPerson = {
        ...selectedPerson,
        crm: updatedCrmEntries,
      };

      setData((prev) =>
        prev.map((person) => (person.id === selectedPerson.id ? updatedPerson : person))
      );
      setSelectedPerson(updatedPerson); // Update selected person to reflect changes

      setDeletingCrmEntry(null);
      closeModal("deleteCrm");
      setTimeout(() => {
        triggerSuccess("CRM entry deleted successfully!");
      }, 200);
    } catch (error) {
      console.error("Error deleting CRM entry:", error);
      triggerSuccess("Error deleting CRM entry. Please try again.");
    }
  };



  const canDeleteCrmEntry = (entry) => {
    return entry.employeeName === currentUser?.username
  }

  const canEditCrmEntry = (entry) => {
    return entry.employeeName === currentUser?.username
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

  const handleOpenEditInfo = () => {
    if (!selectedPerson) return

    setClientFormData({
      firstName: selectedPerson.firstName || "",
      lastName: selectedPerson.lastName || "",
      personalCode: selectedPerson.personalCode || "",
      email: selectedPerson.email || "",
      phone: selectedPerson.phoneNumber || "",
      secondPhone: selectedPerson.otherPhoneNumber || "",
      documentType: selectedPerson.docType || selectedPerson.documentType || "ID Card",
      documentNumber: selectedPerson.docNumber || selectedPerson.documentNumber || "",
      documentExpiry: selectedPerson.docExpiryDate || selectedPerson.documentExpiry || "",
      dateOfBirth:
        selectedPerson.dateOfBirth ||
        getDateOfBirthFromPersonalCode(selectedPerson.personalCode || ""),
      registrationCountry: selectedPerson.regAddress?.country || "",
      registrationRegion: selectedPerson.regAddress?.region || "",
      registrationCity: selectedPerson.regAddress?.cityOrVillage || "",
      registrationStreet: selectedPerson.regAddress?.street || "",
      registrationHouse: selectedPerson.regAddress?.house || "",
      registrationApartment: selectedPerson.regAddress?.apartment || "",
      registrationPostalCode: selectedPerson.regAddress?.postalCode || "",
      correspondenceCountry: selectedPerson.corAddress?.country || "",
      correspondenceRegion: selectedPerson.corAddress?.region || "",
      correspondenceCity: selectedPerson.corAddress?.cityOrVillage || "",
      correspondenceStreet: selectedPerson.corAddress?.street || "",
      correspondenceHouse: selectedPerson.corAddress?.house || "",
      correspondenceApartment: selectedPerson.corAddress?.apartment || "",
      correspondencePostalCode: selectedPerson.corAddress?.postalCode || "",
      marketingConsent: selectedPerson.marketingConsent || false,
    })

    const reg = selectedPerson.regAddress
    const cor = selectedPerson.corAddress
    const same =
      reg &&
      cor &&
      reg.country === cor.country &&
      reg.region === cor.region &&
      reg.cityOrVillage === cor.cityOrVillage &&
      reg.street === cor.street &&
      reg.house === cor.house &&
      reg.apartment === cor.apartment &&
      reg.postalCode === cor.postalCode

    setSameAsRegistration(!!same)
    setIsEditInfoOpen(true)
  }

  const handleUpdateClient = async (e) => {
    e.preventDefault()
    if (!selectedPerson) return
    if (!validateClientForm(true, true)) return;

    const payload = {
      personal_code: selectedPerson.personalCode,
      first_name: clientFormData.firstName,
      last_name: clientFormData.lastName,
      email: clientFormData.email,
      phone_number: clientFormData.phone,
      other_phone_number: clientFormData.secondPhone,
      doc_type: clientFormData.documentType,
      doc_number: clientFormData.documentNumber,
      doc_expiry_date: clientFormData.documentExpiry,
      marketing_consent: clientFormData.marketingConsent,
      reg_address: {
        country: clientFormData.registrationCountry,
        region: clientFormData.registrationRegion || null,
        cityOrVillage: clientFormData.registrationCity || null,
        street: clientFormData.registrationStreet,
        house: clientFormData.registrationHouse || null,
        apartment: clientFormData.registrationApartment || null,
        postalCode: clientFormData.registrationPostalCode || null,
      },
      cor_address: {
        country: clientFormData.correspondenceCountry,
        region: clientFormData.correspondenceRegion || null,
        cityOrVillage: clientFormData.correspondenceCity || null,
        street: clientFormData.correspondenceStreet,
        house: clientFormData.correspondenceHouse || null,
        apartment: clientFormData.correspondenceApartment || null,
        postalCode: clientFormData.correspondencePostalCode || null,
      },
    }


    console.log(payload)
    try {
      const response = await fetch(getServerLink() + "/editClient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const updatedPerson = {
        ...selectedPerson,
        firstName: clientFormData.firstName,
        lastName: clientFormData.lastName,
        email: clientFormData.email,
        phoneNumber: clientFormData.phone,
        otherPhoneNumber: clientFormData.secondPhone,
        docType: clientFormData.documentType,
        docNumber: clientFormData.documentNumber,
        docExpiryDate: clientFormData.documentExpiry,
        marketingConsent: clientFormData.marketingConsent,
        regAddress: {
          country: clientFormData.registrationCountry,
          region: clientFormData.registrationRegion || null,
          cityOrVillage: clientFormData.registrationCity || null,
          street: clientFormData.registrationStreet,
          house: clientFormData.registrationHouse || null,
          apartment: clientFormData.registrationApartment || null,
          postalCode: clientFormData.registrationPostalCode || null,
        },
        corAddress: {
          country: clientFormData.correspondenceCountry,
          region: clientFormData.correspondenceRegion || null,
          cityOrVillage: clientFormData.correspondenceCity || null,
          street: clientFormData.correspondenceStreet,
          house: clientFormData.correspondenceHouse || null,
          apartment: clientFormData.correspondenceApartment || null,
          postalCode: clientFormData.correspondencePostalCode || null,
        },
      }

      setData((prev) => prev.map((p) => (p.id === selectedPerson.id ? updatedPerson : p)))
      setSelectedPerson(updatedPerson)
      closeModal("editInfo")
      setTimeout(() => {
        triggerSuccess("Client information updated!")
      }, 200)
    } catch (error) {
      console.error("Error updating client:", error)
      closeModal("editInfo")
      setTimeout(() => {
        triggerSuccess("Failed to update client information.")
      }, 200)
    }
  }

  const handleDeleteAccount = (account) => {
    setDeletingAccount(account)
    setIsDeleteAccountOpen(true)
  }

  const confirmDeleteAccount = async () => {
    if (!selectedPerson || !deletingAccount) return

    try {
      const response = await fetch(getServerLink() + "/deleteBankAcc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          personal_code: selectedPerson.personalCode,
          iban: deletingAccount.iban,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const updatedAccounts = selectedPerson.bank_accs.filter((acc) => acc !== deletingAccount)
      const updatedPerson = { ...selectedPerson, bank_accs: updatedAccounts }
      setData((prev) => prev.map((p) => (p.id === selectedPerson.id ? updatedPerson : p)))
      setSelectedPerson(updatedPerson)
      setDeletingAccount(null)
      closeModal("deleteAccount")
      setTimeout(() => {
        triggerSuccess("Bank account deleted!")
      }, 200)
    } catch (error) {
      console.error("Error deleting bank account:", error)
      setDeletingAccount(null)
      closeModal("deleteAccount")
      setTimeout(() => {
        triggerSuccess("Failed to delete bank account.")
      }, 200)
    }
  }

  const normalize = (str) =>
    String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();


  // Normalize phone for comparison: remove spaces, +, 00 prefixes
  const normalizePhoneForCompare = (phone) => {
    if (!phone) return ""
    let cleaned = phone.replace(/\s+/g, "")

    if (cleaned.startsWith("00")) {
      cleaned = "+" + cleaned.slice(2)
    }

    if (cleaned.startsWith("+")) {
      cleaned = cleaned.slice(1)
    }

    // New line to cut "370" if the number starts with it
    if (cleaned.startsWith("370")) {
      cleaned = cleaned.slice(3)
    }

    return cleaned
  }

  const filteredData = useMemo(() => {
    if (!searchTerm) return data

    const normSearch = normalize(searchTerm)
    const searchTokens = normSearch.split(" ").filter(Boolean)
    const normSearchPhone = normalizePhoneForCompare(searchTerm)

    return data.filter((person) => {
      const fullName = normalize(`${person.firstName} ${person.lastName}`)
      const first = normalize(person.firstName)
      const last = normalize(person.lastName)
      const code = normalize(person.personalCode || "")
      const phone = normalizePhoneForCompare(person.phoneNumber || "")

      const fullNameMatches = searchTokens.every((token) => fullName.includes(token))

      const personalCodeMatches = code.includes(normSearch)

      return (
        fullNameMatches ||
        first.includes(normSearch) ||
        last.includes(normSearch) ||
        personalCodeMatches ||
        phone.includes(normSearchPhone)
      )
    })
  }, [searchTerm, data])

  const handlePersonClick = (person) => {
    setSelectedPerson(person)
  }

  // RENDER LIST OF CLIENTS
  const renderPersonList = () =>
    filteredData.map((person, idx) => (
      <div
        key={`${person.id}-${idx}`}
        className={`client-card ${selectedPerson?.id === person.id ? "selected" : ""}`}
        onClick={() => handlePersonClick(person)}
        ref={selectedPerson?.id === person.id ? selectedClientRef : null}
        style={{ animationDelay: `${idx * 0.05}s` }}
      >
        <div className="client-card-content">
          <User className="client-icon" />
          <div className="client-info">
            <div className="client-header">
              <h3 className="client-name">{highlightText(`${person.firstName} ${person.lastName}`, searchTerm)}</h3>
              <span className="client-badge">client</span>
            </div>
            {person.crm && person.crm.length > 0 ? (
              <p className="client-preview">
                Last interaction: {person.crm.length > 0 ? person.crm[person.crm.length - 1].date_of_contact || person.crm[person.crm.length - 1].date : "No interactions"}
              </p>
            ) : (
              <p className="client-preview no-recent-activities">No recent activities</p>
            )}
          </div>
        </div>
      </div>
    ))

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

    return (
      <div>
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={24} color="white" />
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
                  <div className="info-value">{selectedPerson.docType}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Document Number</div>
                  <div className="info-value">{selectedPerson.docNumber}</div>
                </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="info-card">
          <div className="card-header">
            <h3 className="card-title">
              <Mail size={16} />
              Contact
            </h3>
            <button className="edit-button" onClick={handleOpenEditInfo} title="Edit Information">
              <Edit size={16} />
            </button>
          </div>
          <div className="card-content">
     

            <div className="contact-item">
                <Mail className="contact-icon" />
                <div className="contact-text">
                  <div className="info-label">Email</div> 
                  <div className="info-value"> {selectedPerson.email || "N/A"}</div>
                </div>
              </div>

            {selectedPerson.phoneNumber && (
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
          </div></div>

        {/* Bank Accounts for clients */}
        {isClient && (
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
              {selectedPerson.bank_accs && selectedPerson.bank_accs.length > 0 ? (
                selectedPerson.bank_accs.map((account, index) => ( // Add 'index' as a second argument to map
                  <div key={`${account.id}-${index}`} className="account-item">
                    <div className="account-header">
                      <span className="account-iban">{account.iban}</span>
                      <div className="account-actions">
                        <span className="account-badge">{account.currency}</span>
                        <button
                          className="delete-account-button"
                          onClick={() => handleDeleteAccount(account)}
                          title="Delete Account"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
                        <div className="info-value">{account.plan || account.servicePlan}</div>
                      </div>
                      <div className="account-detail">
                        <div className="info-label">Card Type</div>
                        <div className="info-value">  
                        {(account.type || account.cardType) === "none"
                        ? "No Card"
                        : (account.type || account.cardType) === "Debeto"
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
                <button className="edit-button" onClick={handleOpenEditInfo} title="Edit Information">
                  <Edit size={16} />
                </button>
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
                <button className="edit-button" onClick={handleOpenEditInfo} title="Edit Information">
                  <Edit size={16} />
                </button>
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
      {selectedPerson.regAddress.street && selectedPerson.regAddress.street !== "null" && (
        <span>{selectedPerson.regAddress.street} </span>
      )}
      {selectedPerson.regAddress.house && selectedPerson.regAddress.house !== "null" && (
        <span>{selectedPerson.regAddress.house}</span>
      )}
      {selectedPerson.regAddress.apartment && selectedPerson.regAddress.apartment !== "null" && (
        <span>, Apt {selectedPerson.regAddress.apartment}</span>
      )}
    </div>
    <div>
      {selectedPerson.regAddress.postalCode && selectedPerson.regAddress.postalCode !== "null" && (
        <span>{selectedPerson.regAddress.postalCode} </span>
      )}
      {selectedPerson.regAddress.cityOrVillage && selectedPerson.regAddress.cityOrVillage !== "null" && (
        <span>{selectedPerson.regAddress.cityOrVillage}</span>
      )}
    </div>
    <div>
      {selectedPerson.regAddress.region && selectedPerson.regAddress.region !== "null" && (
        <span>{selectedPerson.regAddress.region}</span>
      )}
      {selectedPerson.regAddress.region && selectedPerson.regAddress.region !== "null" &&
       selectedPerson.regAddress.country && selectedPerson.regAddress.country !== "null" && (
        <span>, </span>
      )}
      {selectedPerson.regAddress.country && selectedPerson.regAddress.country !== "null" && (
        <span>{selectedPerson.regAddress.country}</span>
      )}
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
        isSameAddress(selectedPerson.corAddress, selectedPerson.regAddress) ? (
          <div>Same as registration address</div>
        ) : (
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
        )
      ) : (
        <div>No correspondence address</div>
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
                  <div className="info-value">{selectedPerson.crm ? selectedPerson.crm.length : 0}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Last Contact Date</div>
                  <div className="info-value">
                    {selectedPerson.crm && selectedPerson.crm.length > 0
                      ? selectedPerson.crm[selectedPerson.crm.length - 1].date_of_contact
                      : "No contact recorded"}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Last Contact Type</div>
                  <div className="info-value">
                    {selectedPerson.crm && selectedPerson.crm.length > 0
                      ? selectedPerson.crm[selectedPerson.crm.length - 1].contact_type
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
          {selectedPerson.crm && selectedPerson.crm.length > 0 ? (
            selectedPerson.crm.slice().reverse().map((entry, i) => ( 
              <div key={entry.id || `crm-${i}`} className="crm-entry" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="crm-entry-header">
                  <div className="crm-entry-title" onClick={() => toggleCrmExpansion(entry.id || `crm-${i}`)}>
                    {expandedCrmEntries[entry.id || `crm-${i}`] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span style={{ fontWeight: 600, marginLeft: "8px", overflowWrap: 'break-word', userSelect: 'none' }}>
                      {entry.title
                        ? (entry.title.length > 75 ? entry.title.substring(0, 50) : entry.title)
                        : "Untitled Entry"
                      }
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" ,userSelect: 'none' }}>
                    <span className="crm-entry-badge">{entry.contactType || entry.contact_type}</span> {/* Uses contact_type from DB */}
                    <span className="crm-entry-date">{entry.date_of_contact || entry.date}</span> {/* Uses date_of_contact from DB */}
                    <span className="crm-entry-employee">by {entry.username}</span> {/* Uses username from DB */}
                    <div className="crm-entry-actions">
                      {canEditCrmEntry(entry) && (
                        <button className="edit-button"  style={{ color: '#8064f3' }} onClick={() => handleEditCrm(entry) }>
                          <Edit size={16} color="#8064f3" />
                        </button>
                      )}
                      {canDeleteCrmEntry(entry) && (
                        <button
                          className="delete-crm-button"
                          onClick={() => handleDeleteCrm(entry)}
                          title="Delete CRM entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                  {expandedCrmEntries[entry.id || `crm-${i}`] && (
                        <div
                          style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}
                          className="crm-entry-content"
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
    <div className="employee-panel dashboard-fade-in">
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
              <Building size={24} color="white" />
            </div>
            <div className="logo-text">
              <h1>SimBank</h1>
              <p>Employee Portal</p>
            </div>
            <div className="vegova-logo-sidebar">
              <img src="/vegova-logo.png" alt="Vegova Ljubljana" className="vegova-logo-sidebar-img" />
            </div>
          </div>
          <div className="logged-in-info card-header info-card text-white" style={{ color: "white !important" }}>
            <User size={16} strokeWidth={3} style={{ marginRight: "6px", verticalAlign: "middle" }} />
            <p>Logged in as: {employeeUsername}</p>
          </div>
          <div className="search-container">
            <Search className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search clients, phone numbers..."
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

      {/* Logout Confirmation Modal */}
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

      {/* Add Client Modal */}
      {isAddClientOpen && (
        <div
          className="modal-overlay"
          onMouseDown={handleModalMouseDown}
          onMouseUp={(e) => handleModalMouseUp(e, "addClient")}
        >
          <div
            className={`modal-content large-modal ${modalClosing.addClient ? "closing" : ""}`}
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
                      maxLength={11}
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
                    onChange={(e) => handleClientFormChange("email", e.target.value)}
                    placeholder="Enter email"
                    required
                  />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <div className="phone-input-group">
                      <input
                        className={`form-input ${errors.phone ? "error" : ""}`}
                        value={clientFormData.phone}
                        onChange={(e) => handleClientFormChange("phone", e.target.value)}
                        placeholder="Phone number"
                        required
                      />
                    </div>
                    {errors.phone && <div className="error-message">{errors.phone}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Second Phone (Optional)</label>
                    <div className="phone-input-group">
                      <input
                        className="form-input"
                        value={clientFormData.secondPhone}
                        onChange={(e) => handleClientFormChange("secondPhone", e.target.value)}
                        placeholder="Second phone number"
                      />
                    </div>
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
                      <option value="Temporary Residence Permit">Residence Permit</option>
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
                  <div className="form-grid">
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

                      <div className="form-group">
                      <label className="form-label">City *</label>
                      <input
                        className={`form-input ${errors.registrationCity ? "error" : ""}`}
                        value={clientFormData.registrationCity}
                        onChange={(e) => handleClientFormChange("registrationCity", e.target.value)}
                        placeholder="City or Village"
                        required
                      />
                      {errors.registrationCity && <div className="error-message">{errors.registrationCity}</div>}
                    </div>
                    
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
                    <div className="form-group">
                      <label className="form-label">Correspondence Address *</label>
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
                        </div>
                        <div className="form-group">
                          <label className="form-label">Apartment</label>
                          <input
                            className={`form-input ${errors.correspondenceApartment ? "error" : ""}`}
                            value={clientFormData.correspondenceApartment}
                            onChange={(e) => handleClientFormChange("correspondenceApartment", e.target.value)}
                            placeholder="Apartment (optional)"
                          />
                        </div>
                      </div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Postal Code *</label>
                          <input
                            className={`form-input ${errors.correspondencePostalCode ? "error" : ""}`}
                            value={clientFormData.correspondencePostalCode}
                            onChange={(e) => handleClientFormChange("correspondencePostalCode", e.target.value)}
                            placeholder="Postal code"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Country *</label>
                          <input
                            className={`form-input ${errors.correspondenceCountry ? "error" : ""}`}
                            value={clientFormData.correspondenceCountry}
                            onChange={(e) => handleClientFormChange("correspondenceCountry", e.target.value)}
                            placeholder="Country"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">City *</label>
                          <input
                            className={`form-input ${errors.correspondenceCity ? "error" : ""}`}
                            value={clientFormData.correspondenceCity}
                            onChange={(e) => handleClientFormChange("correspondenceCity", e.target.value)}
                            placeholder="City or Village"
                            required
                          />
                        </div>  
                      </div>
                    </div>
                  )}
                </div>
                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    id="marketingConsent"
                    checked={clientFormData.marketingConsent}
                    onChange={(e) => handleClientFormChange("marketingConsent", e.target.checked)}
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
        <div
          className="modal-overlay"
          onMouseDown={handleModalMouseDown}
          onMouseUp={(e) => handleModalMouseUp(e, "addAccount")}
        >
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
                        placeholder="LT817044..."
                        required
                      />
                    </div>
                    <button type="button" className="button-secondary" onClick={handleGenerateIBAN}>
                      Generate
                    </button>
                  </div>
                  {errors.iban && <div className="error-message">{errors.iban}</div>}
                </div>

                <div className="form-grid-account">
                  <div className="form-group">
                    <label className="form-label">Currency *</label>
                    <select
                      className={`form-input ${errors.currency ? "error" : ""}`}
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
                    {errors.currency && <div className="error-message">{errors.currency}</div>}
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
                </div>

                <div className="form-grid-account">
                  <div className="form-group">
                    <label className="form-label">Service Plan *</label>
                    <select
                      className="form-input"
                      value={accountFormData.servicePlan}
                      onChange={(e) => handleAccountFormChange("servicePlan", e.target.value)}
                      required
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
                      onChange={(e) => handleAccountFormChange("cardType", e.target.value)}
                      disabled={!["Jaunimo", "Standard", "Gold"].includes(accountFormData.servicePlan)}
                    >
                      <option value="none">/</option>
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

      {/* Add CRM Modal - Made wider */}
      {isAddCrmOpen && (
        <div
          className="modal-overlay"
          onMouseDown={handleModalMouseDown}
          onMouseUp={(e) => handleModalMouseUp(e, "addCrm")}
        >
          <div
            className={`modal-content crm-modal ${modalClosing.addCrm ? "closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
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
                  <label className="form-label">Title * (max 75 characters)</label>
                  <input
                    className={`form-input ${errors.title ? "error" : ""}`}
                    value={crmFormData.title}
                    onChange={(e) => handleCrmFormChange("title", e.target.value)}
                    placeholder="Enter a brief title for this interaction"
                    maxLength={75}
                    required
                  />
                  <div
                    className={`character-count ${crmFormData.title.length > 60 ? "warning" : ""
                      } ${crmFormData.title.length > 70 ? "error" : ""}`}
                  >
                    {crmFormData.title.length}/75 characters
                  </div>
                  {errors.title && <div className="error-message">{errors.title}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Contact *</label>
                  <input type="date" className="form-input readonly" value={crmFormData.date} readOnly />
                  {errors.date && <div className="error-message">{errors.date}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Type</label>
                  <select
                    className={`form-select ${errors.contactType ? "error" : ""}`}
                    value={crmFormData.contactType}
                    onChange={(e) => handleCrmFormChange("contactType", e.target.value)}
                    required
                  >
                    <option value="phone">Phone</option>
                    <option value="visit">Visit</option>
                    <option value="email">Email</option>
                  </select>
                  {errors.contactType && <div className="error-message">{errors.contactType}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Content * (max 750 characters)</label>
                  <textarea
                    className={`form-textarea ${errors.content ? "error" : ""}`}
                    value={crmFormData.content}
                    onChange={(e) => handleCrmFormChange("content", e.target.value)}
                    placeholder="Enter details of the interaction"
                    rows={8}
                    maxLength={750}
                    required
                  />
                  <div
                    className={`character-count ${crmFormData.content.length > 600 ? "warning" : ""
                      } ${crmFormData.content.length > 700 ? "error" : ""}`}
                  >
                    {crmFormData.content.length}/750 characters
                  </div>
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
        <div
          className="modal-overlay"
          onMouseDown={handleModalMouseDown}
          onMouseUp={(e) => handleModalMouseUp(e, "editCrm")}
        >
          <div
            className={`modal-content crm-modal ${modalClosing.editCrm ? "closing" : ""}`}
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
                  <label className="form-label">Title * (max 75 characters)</label>
                  <input
                    className={`form-input ${errors.title ? "error" : ""}`}
                    value={crmFormData.title}
                    onChange={(e) => handleCrmFormChange("title", e.target.value)}
                    placeholder="Enter a brief title for this interaction"
                    maxLength={75}
                    required
                  />
                  <div
                    className={`character-count ${crmFormData.title.length > 60 ? "warning" : ""
                      } ${crmFormData.title.length > 70 ? "error" : ""}`}
                  >
                    {crmFormData.title.length}/75 characters
                  </div>
                  {errors.title && <div className="error-message">{errors.title}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Contact * (Read-only)</label>
                  <input type="date" className="form-input readonly" value={crmFormData.date} readOnly />
                  {errors.date && <div className="error-message">{errors.date}</div>}
                </div>


                <div className="form-group">
                  <label className="form-label">Contact Type (Read-only)</label>
                  <input
                    type="text"
                    className="form-input readonly"
                    value={crmFormData.contactType
                      ? crmFormData.contactType.charAt(0).toUpperCase() + crmFormData.contactType.slice(1)
                      : ''
                    }
                    readOnly
                  />
                  {errors.date && <div className="error-message">{errors.date}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Content * (max 750 characters)</label>
                  <textarea
                    className={`form-textarea ${errors.content ? "error" : ""}`}
                    value={crmFormData.content}
                    onChange={(e) => handleCrmFormChange("content", e.target.value)}
                    placeholder="Enter details of the interaction"
                    rows={8}
                    maxLength={750}
                    required
                  />
                  <div
                    className={`character-count ${crmFormData.content.length > 600 ? "warning" : ""
                      } ${crmFormData.content.length > 700 ? "error" : ""}`}
                  >
                    {crmFormData.content.length}/750 characters
                  </div>
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

      {/* Delete CRM Modal */}
      {isDeleteCrmOpen && (
        <div
          className="modal-overlay"
          onMouseDown={handleModalMouseDown}
          onMouseUp={(e) => handleModalMouseUp(e, "deleteCrm")}
        >
          <div
            className={`modal-content ${modalClosing.deleteCrm ? "closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                <Trash2 size={20} color="#ef4444" />
                Delete CRM Entry
              </h3>
              <button className="modal-close" onClick={() => closeModal("deleteCrm")}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p className="delete-warning">
                Are you sure you want to delete this CRM entry? This action cannot be undone.
                <br />
                <br />
                <strong>Entry:</strong> {deletingCrmEntry?.title || "Untitled Entry"}
                <br />
                <strong>Date:</strong> {deletingCrmEntry?.date}
              </p>
              <div className="form-actions">
                <button type="button" className="button-secondary" onClick={() => closeModal("deleteCrm")}>
                  Cancel
                </button>
                <button type="button" className="button-danger" onClick={confirmDeleteCrm}>
                  <Trash2 size={16} style={{ marginRight: "8px" }} />
                  Delete Entry
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

      {/* Edit Info Modal */}
      {isEditInfoOpen && (
        <div
          className="modal-overlay"
          onMouseDown={handleModalMouseDown}
          onMouseUp={(e) => handleModalMouseUp(e, "editInfo")}
        >
          <div
            className={`modal-content large-modal ${modalClosing.editInfo ? "closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                <Edit size={20} color="#8b5cf6" />
                Edit Client Information
              </h3>
              <button className="modal-close" onClick={() => closeModal("editInfo")}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdateClient}>
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
              
                </div>

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

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <div className="phone-input-group">
                      <input
                        className={`form-input ${errors.phone ? "error" : ""}`}
                        value={clientFormData.phone}
                        onChange={(e) => handleClientFormChange("phone", e.target.value)}
                        placeholder="Phone number"
                        required
                      />
                    </div>
                    {errors.phone && <div className="error-message">{errors.phone}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Second Phone (Optional)</label>
                    <div className="phone-input-group">
                      <input
                        className="form-input"
                        value={clientFormData.secondPhone}
                        onChange={(e) => handleClientFormChange("secondPhone", e.target.value)}
                        placeholder="Second phone number"
                      />
                    </div>
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
                      <option value="Temporary Residence Permit">Residence Permit</option>
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
                  <div className="form-grid">
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

                      <div className="form-group">
                      <label className="form-label">City *</label>
                      <input
                        className={`form-input ${errors.registrationCity ? "error" : ""}`}
                        value={clientFormData.registrationCity}
                        onChange={(e) => handleClientFormChange("registrationCity", e.target.value)}
                        placeholder="City or Village"
                        required
                      />
                      {errors.registrationCity && <div className="error-message">{errors.registrationCity}</div>}
                    </div>

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
                    <div className="form-group">
                      <label className="form-label">Correspondence Address *</label>
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
                        </div>
                        <div className="form-group">
                          <label className="form-label">Apartment</label>
                          <input
                            className={`form-input ${errors.correspondenceApartment ? "error" : ""}`}
                            value={clientFormData.correspondenceApartment}
                            onChange={(e) => handleClientFormChange("correspondenceApartment", e.target.value)}
                            placeholder="Apartment (optional)"
                          />
                        </div>
                      </div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Postal Code *</label>
                          <input
                            className={`form-input ${errors.correspondencePostalCode ? "error" : ""}`}
                            value={clientFormData.correspondencePostalCode}
                            onChange={(e) => handleClientFormChange("correspondencePostalCode", e.target.value)}
                            placeholder="Postal code"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Country *</label>
                          <input
                            className={`form-input ${errors.correspondenceCountry ? "error" : ""}`}
                            value={clientFormData.correspondenceCountry}
                            onChange={(e) => handleClientFormChange("correspondenceCountry", e.target.value)}
                            placeholder="Country"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">City *</label>
                          <input
                            className={`form-input ${errors.correspondenceCity ? "error" : ""}`}
                            value={clientFormData.correspondenceCity}
                            onChange={(e) => handleClientFormChange("correspondenceCity", e.target.value)}
                            placeholder="City or Village"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    id="marketingConsent"
                    checked={clientFormData.marketingConsent}
                    onChange={(e) => handleClientFormChange("marketingConsent", e.target.checked)}
                  />
                  <label htmlFor="marketingConsent">Marketing consent</label>
                </div>

                <div className="form-actions">
                  <button type="button" className="button-secondary" onClick={() => closeModal("editInfo")}>Cancel</button>
                  <button type="submit" className="button-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {isDeleteAccountOpen && (
        <div
          className="modal-overlay"
          onMouseDown={handleModalMouseDown}
          onMouseUp={(e) => handleModalMouseUp(e, "deleteAccount")}
        >
          <div
            className={`modal-content ${modalClosing.deleteAccount ? "closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                <Trash2 size={20} color="#ef4444" />
                Delete Account
              </h3>
              <button className="modal-close" onClick={() => closeModal("deleteAccount")}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p className="delete-warning">
                Are you sure you want to delete account {deletingAccount?.iban}?
              </p>
              <div className="form-actions">
                <button type="button" className="button-secondary" onClick={() => closeModal("deleteAccount")}>Cancel</button>
                <button type="button" className="button-danger" onClick={confirmDeleteAccount}>
                  <Trash2 size={16} style={{ marginRight: "8px" }} />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
