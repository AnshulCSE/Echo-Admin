import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Dashboard from "./Dashboard"; // Stats Page
import ManageStories from "./ManageStories"; // Content Management
import Login from "./Login"; 
import Marketing from "./Marketing";
import Settings from "./Settings";
import ProtectedRoute from "./ProtectedRoute"; 
import SessionManager from './components/SessionManager';
import Users from "./Users";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <SessionManager>
              <Layout>
                <Dashboard />
              </Layout>
            </SessionManager>
          </ProtectedRoute>
        } />

        <Route path="/content" element={
          <ProtectedRoute>
            <SessionManager>
              <Layout>
                <ManageStories />
              </Layout>
            </SessionManager>
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute>
            <SessionManager>
              <Layout>
                <Users />
              </Layout>
            </SessionManager>
          </ProtectedRoute>
        } />

        <Route path="/marketing" element={
          <ProtectedRoute>
            <SessionManager>
              <Layout>
                <Marketing />
              </Layout>
            </SessionManager>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <SessionManager>
              <Layout>
                <Settings />
              </Layout>
            </SessionManager>
          </ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}