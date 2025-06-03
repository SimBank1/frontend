import React from 'react';
import AdminPanel from '../adminPanel/AdminPanel';
import EmployeePanel from '../employeePanel/EmployeePanel';

const Dashboard = () => {
  const sessionToken = sessionStorage.getItem('sessionToken');

  // Leave this as-is for now; server validation can be added later
  if (sessionToken === 'admin') {
    return <AdminPanel />;
  } else {
    return <EmployeePanel />;
  }
};

export default Dashboard;
