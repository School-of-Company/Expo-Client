'use client';

import { useState, useEffect } from 'react';

export const useRole = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const response = await fetch('/api/role');
      const data = await response.json();
      setRole(data.role);
    };

    fetchRole();
  }, []);

  return role;
};
