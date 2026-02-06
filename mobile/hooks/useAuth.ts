import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import api from '../services/api';

// Define the shape of your user
interface User {
  username: string;
  streak: number;
  behaviorScore: number;
}

export function useAuth() {
  // Tell useState it can be a User or null
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.success) setUser(data.data);
    } catch (err) {
      // Only redirect if it's an auth error (401)
      console.log(err)
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, refetch: fetchUser };
}