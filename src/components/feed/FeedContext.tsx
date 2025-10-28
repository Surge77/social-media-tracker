'use client';

import { createContext, useContext } from 'react';
import { FilterContextType } from './types';

const FeedContext = createContext<FilterContextType | null>(null);

export const useFeedContext = () => {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error('useFeedContext must be used within a FeedContainer');
  }
  return context;
};

export default FeedContext;