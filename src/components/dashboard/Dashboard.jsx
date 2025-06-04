import React from 'react';
import AdminPanel from '../adminPanel/AdminPanel';
import EmployeePanel from '../employeePanel/EmployeePanel';
import { useCookies } from 'react-cookie';

const Dashboard = () => {
  const [cookies, setCookies] = useCookies(['sessionCokie']);
  const sessionToken = cookies.sessionCokie;

  console.log("Session Token: ", sessionToken);

  // For testing, check if sessionToken equals "admin"
  if (sessionToken === 'admin') {
    return <AdminPanel />;
  } else {
    return <EmployeePanel />;
  }
};

export default Dashboard;
