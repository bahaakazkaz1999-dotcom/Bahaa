import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { User } from './types';

// Pages - I will create these next
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import CreateCase from './pages/CreateCase';
import BrowseCases from './pages/BrowseCases';
import CompletedSupports from './pages/CompletedSupports';
import Layout from './components/Layout';

export default function App() {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [userData, setUserData] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data() as User);
        } else {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen font-sans">
        <div className="text-xl font-medium animate-pulse">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        
        {/* Protected Routes */}
        <Route element={<Layout user={user} userData={userData} />}>
          <Route path="/" element={
            user ? (
              userData ? <Home userData={userData} /> : <Navigate to="/onboarding" />
            ) : <Navigate to="/login" />
          } />
          
          <Route path="/onboarding" element={
            user ? (
              userData ? <Navigate to="/" /> : <Onboarding user={user} userData={userData} />
            ) : <Navigate to="/login" />
          } />

          <Route path="/profile" element={user ? <Profile userData={userData} /> : <Navigate to="/login" />} />
          <Route path="/create-case" element={user && userData?.role === 'beneficiary' ? <CreateCase userData={userData} /> : <Navigate to="/" />} />
          <Route path="/cases" element={user ? <BrowseCases userData={userData} /> : <Navigate to="/login" />} />
          <Route path="/completed" element={user ? <CompletedSupports /> : <Navigate to="/login" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
