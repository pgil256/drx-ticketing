import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/common/Navbar.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import IssueForm from './pages/IssueForm.jsx'
import IssueList from './pages/IssueList.jsx'
import PastIssues from './pages/PastIssues.jsx'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<IssueForm />} />
              <Route path="/submit" element={<IssueForm />} />
              <Route path="/dashboard" element={<IssueList />} />
              <Route path="/past-issues" element={<PastIssues />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App