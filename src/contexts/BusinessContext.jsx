import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getUserBusiness } from '@/services/loginService';

const BusinessContext = createContext();

export const useBusiness = () => useContext(BusinessContext);

export const BusinessProvider = ({ children }) => {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        getUserBusiness(user.uid)
          .then((businessData) => {
            setBusiness(businessData);
            setLoading(false);
          })
          .catch((error) => {
            console.error('Error fetching business:', error);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <BusinessContext.Provider value={{ business, loading, setBusiness }}>
      {children}
    </BusinessContext.Provider>
  );
};
