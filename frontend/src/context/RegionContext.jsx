import React, { createContext, useState, useContext } from 'react';

const RegionContext = createContext();

export const RegionProvider = ({ children }) => {
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  return (
    <RegionContext.Provider value={{ selectedDistrict, setSelectedDistrict }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
};
