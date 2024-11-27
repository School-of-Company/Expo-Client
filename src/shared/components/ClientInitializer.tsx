'use client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import useStore from '../stores/useStore';

const ClientInitializer: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const setRole = useStore((state) => state.setRole);

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await axios.get('/api/tokenCheck');
        console.log('API response:', response.data);
        setToken(response.data.accessToken);
        console.log('AccessToken from API:', response.data.accessToken);
      } catch (error) {
        console.error('Error fetching access token:', error);
      }
    };

    fetchAccessToken();
  }, []);

  useEffect(() => {
    if (token) {
      setRole('manage');
    } else {
      setRole('user');
    }
  }, [token, setRole]);

  return null;
};

export default ClientInitializer;
