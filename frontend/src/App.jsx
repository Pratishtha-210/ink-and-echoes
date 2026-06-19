import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext.jsx';

// Pages
import Landing from './pages/Landing.jsx';
import About from './pages/About.jsx';
import Library from './pages/Library.jsx';
import PoemDetail from './pages/PoemDetail.jsx';
import Thoughts from './pages/Thoughts.jsx';
import EssayDetail from './pages/EssayDetail.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import JournalDashboard from './pages/JournalDashboard.jsx';
import JournalEditor from './pages/JournalEditor.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

// Global Layout & Protective Route Gates & Transitions
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PageTransition from './components/PageTransition.jsx';

// Initialize React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Inner router wrapper to safely capture location and trigger exit animations
const AnimatedAppContent = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Sanctuary Routes */}
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/library" element={<PageTransition><Library /></PageTransition>} />
        <Route path="/library/:id" element={<PageTransition><PoemDetail /></PageTransition>} />
        <Route path="/thoughts" element={<PageTransition><Thoughts /></PageTransition>} />
        <Route path="/thoughts/:id" element={<PageTransition><EssayDetail /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />

        {/* Secure Private Journal Routes */}
        <Route 
          path="/journal" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <JournalDashboard />
              </PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/journal/new" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <JournalEditor />
              </PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/journal/edit/:id" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <JournalEditor />
              </PageTransition>
            </ProtectedRoute>
          } 
        />

        {/* Secure Admin Dashboard Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <AdminDashboard />
              </PageTransition>
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback to home */}
        <Route path="*" element={<PageTransition><Landing /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Layout>
            <AnimatedAppContent />
          </Layout>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
