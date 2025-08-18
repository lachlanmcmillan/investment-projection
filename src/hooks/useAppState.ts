import { useState, useEffect, useCallback, useRef } from 'react';
import type { InvestmentInputs } from '../components/InputForm';

// Default values for the comparison
const defaultInputs: InvestmentInputs = {
  // General parameters
  initialNetWorth: 100000, // Available savings for deposit or investment
  yearlyInvestment: 35000, // Annual amount available for investment/extra payments

  // Stock investment path (renting)
  weeklyRent: 500, // Weekly rental cost
  stockAnnualReturn: 9.8, // Expected stock market return including dividends

  // Property purchase path (residence)
  houseCost: 500000, // Purchase price
  mortgageRate: 5.5, // Mortgage interest rate
  houseGrowthRate: 3.5, // Conservative property growth rate
  ownersCorp: 5000, // Annual costs (strata, repairs, rates, insurance)
};

// Mapping between input keys and URL parameter names
const urlParamMap: Record<keyof InvestmentInputs, string> = {
  initialNetWorth: 'deposit',
  yearlyInvestment: 'yearly',
  weeklyRent: 'rent',
  stockAnnualReturn: 'stockReturn',
  houseCost: 'housePrice',
  mortgageRate: 'mortgageRate',
  houseGrowthRate: 'houseGrowth',
  ownersCorp: 'fees',
};

// Reverse mapping for URL params to input keys
const inputKeyMap: Record<string, keyof InvestmentInputs> = Object.fromEntries(
  Object.entries(urlParamMap).map(([key, param]) => [
    param,
    key as keyof InvestmentInputs,
  ])
);

function getInitialInputsFromURL(): InvestmentInputs {
  if (typeof window === 'undefined') {
    return defaultInputs;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const inputs = { ...defaultInputs };

  // Override defaults with URL parameters
  for (const [param, value] of searchParams.entries()) {
    const inputKey = inputKeyMap[param];
    if (inputKey && value) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        inputs[inputKey] = numValue;
      }
    }
  }

  return inputs;
}

function updateURL(key: keyof InvestmentInputs, value: number) {
  if (typeof window === 'undefined') {
    return;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const urlParam = urlParamMap[key];

  // Only update if value is different from default
  if (value !== defaultInputs[key]) {
    searchParams.set(urlParam, value.toString());
  } else {
    // Remove parameter if it's back to default value
    searchParams.delete(urlParam);
  }

  // Update URL without page reload
  const newUrl = searchParams.toString()
    ? `${window.location.pathname}?${searchParams.toString()}`
    : window.location.pathname;

  window.history.replaceState({}, '', newUrl);
}

export function useAppState() {
  const [inputs, setInputs] = useState<InvestmentInputs>(() =>
    getInitialInputsFromURL()
  );
  const pendingChangesRef = useRef<Partial<InvestmentInputs>>({});

  // Handle input changes (update state immediately, URL on blur)
  const handleInputChange = useCallback(
    (key: keyof InvestmentInputs, value: number) => {
      setInputs((prev) => ({
        ...prev,
        [key]: value,
      }));

      // Store pending change for URL update on blur
      pendingChangesRef.current[key] = value;
    },
    []
  );

  // Handle input blur - update URL with all pending changes
  const handleInputBlur = useCallback(() => {
    const pendingChanges = pendingChangesRef.current;

    // Update URL for each pending change
    Object.entries(pendingChanges).forEach(([key, value]) => {
      if (value !== undefined) {
        updateURL(key as keyof InvestmentInputs, value);
      }
    });

    // Clear pending changes
    pendingChangesRef.current = {};
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setInputs(getInitialInputsFromURL());
      // Clear any pending changes when navigating
      pendingChangesRef.current = {};
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return {
    inputs,
    setInputs,
    handleInputChange,
    handleInputBlur,
  };
}

export { defaultInputs };
