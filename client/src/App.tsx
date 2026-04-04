import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Layout/Header';
import { OfflineBanner } from './components/Layout/OfflineBanner';
import Home from './pages/Home';
import Shelters from './pages/Shelters';
import Resources from './pages/Resources';
import PeerSupport from './pages/PeerSupport';
import CrisisAlerts from './pages/CrisisAlerts';
import Volunteer from './pages/Volunteer';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <OfflineBanner />
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/"          element={<Home />} />
              <Route path="/shelters"  element={<Shelters />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/support"   element={<PeerSupport />} />
              <Route path="/alerts"    element={<CrisisAlerts />} />
              <Route path="/volunteer" element={<Volunteer />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
