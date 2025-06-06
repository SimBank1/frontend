import React, { useEffect, useState } from "react";
import AdminPanel from "../adminPanel/AdminPanel";
import EmployeePanel from "../employeePanel/EmployeePanel";
import Terminal from "../terminal/terminal";
import { getServerLink } from "@/server_link";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEmployee, setIsEmployee] = useState(false)
  const [sessionData, setSessionData] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(getServerLink() + "/rand", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()
        console.log(data)

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch session data")
        }

        const hasClients = Array.isArray(data.clients)
        const hasEmployees = Array.isArray(data.employees)

        setSessionData(data)

        // Set current user from session data if available
        if (data.currentUser) {
          setCurrentUser(data.currentUser)
        }

        if (hasClients && hasEmployees) {
          setIsAdmin(true)
        } else if (hasClients && !hasEmployees) {
          setIsEmployee(true)
        }
      } catch (error) {
        console.error("Session check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  useEffect(() => {
    if (!isLoading && !isAdmin && !isEmployee) {
      window.location.href = "/login"
    }
  }, [isLoading, isAdmin, isEmployee])

  if (isLoading) return <div>Loading dashboard...</div>
  if (isAdmin) return <AdminPanel data={sessionData} currentUser={currentUser} />
  if (isEmployee) return <EmployeePanel data={sessionData} currentUser={currentUser} />
  return null
}

export default Dashboard
