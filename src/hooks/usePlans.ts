import { useState, useEffect } from 'react';
import { PricingPlan } from '../types';

export function usePlans(category?: string) {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          if (category) {
            setPlans(data.filter(p => p.category === category));
          } else {
            setPlans(data);
          }
        }
      })
      .catch(err => console.error("Error fetching plans:", err))
      .finally(() => setLoading(false));
  }, [category]);

  return { plans, loading };
}
