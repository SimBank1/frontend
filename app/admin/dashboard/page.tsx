"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, CreditCard, FileText, UserPlus } from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the admin dashboard. Here you can manage clients, employees, and view system statistics.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128</div>
              <p className="text-xs text-muted-foreground">+14% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bank Accounts</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">243</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CRM Entries</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">573</div>
              <p className="text-xs text-muted-foreground">+19% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 new this month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recent-clients">Recent Clients</TabsTrigger>
            <TabsTrigger value="recent-crm">Recent CRM</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>Summary of system activity and performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid gap-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-md border p-4">
                      <div className="text-sm font-medium">Active Users</div>
                      <div className="text-2xl font-bold">8</div>
                    </div>
                    <div className="rounded-md border p-4">
                      <div className="text-sm font-medium">Today's Logins</div>
                      <div className="text-2xl font-bold">24</div>
                    </div>
                    <div className="rounded-md border p-4">
                      <div className="text-sm font-medium">New Accounts</div>
                      <div className="text-2xl font-bold">6</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="recent-clients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recently Added Clients</CardTitle>
                <CardDescription>Clients added in the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <div className="font-medium">Client Name {i}</div>
                        <div className="text-sm text-muted-foreground">Added on {new Date().toLocaleDateString()}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">ID: CL-{1000 + i}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="recent-crm" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent CRM Entries</CardTitle>
                <CardDescription>CRM entries created in the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <div className="font-medium">Client Contact {i}</div>
                        <div className="text-sm text-muted-foreground">
                          Created on {new Date().toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">By: Employee {i}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
