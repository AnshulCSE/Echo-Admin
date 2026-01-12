import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Dashboard from "./Dashboard";
import AddStory from "./AddStory";
import AddEpisode from "./AddEpisode";
import Login from "./Login"; // <--- Import Login
import ProtectedRoute from "./ProtectedRoute"; // <--- Import Guard

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/add-story" element={
          <ProtectedRoute>
            <Layout>
              <AddStory />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/add-episode" element={
          <ProtectedRoute>
            <Layout>
              <AddEpisode />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}