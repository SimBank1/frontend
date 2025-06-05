import React from "react";
import AdminPanel from "../adminPanel/AdminPanel";
import EmployeePanel from "../employeePanel/EmployeePanel";
import Terminal from "../terminal/terminal";
import { useCookies } from "react-cookie";

const Dashboard = () => {
  const [cookies] = useCookies(["sessionCookie"]);
  const sessionToken = cookies.sessionCookie;

  console.log("Session Token: ", sessionToken);

  // Routing based on sessionToken value
  switch (sessionToken) {
    case "admin":
      return <AdminPanel />;
    case "terminal":
      return <Terminal />;
    default:
      return <EmployeePanel />;
  }
};

export default Dashboard;
