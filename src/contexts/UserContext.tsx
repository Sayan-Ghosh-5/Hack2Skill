import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Goal, calculateTDEE, calculateMacros } from '../utils/macroCalculator';

export type UserData = {
  id: string;
  email: string;
  firstName: string;
  profileImage?: string;
  currentGoal: string;
  streak: number;
  profile: {
    age: number;
    weight: number;
    height: number;
    gender: string;
    activityLevel: string;
  };
  macroTargets: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
} | null;

export type MacroTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type DailyTracking = {
  date: string;
  consumed: MacroTargets;
  goalMet: boolean;
};

interface UserContextType {
  user: UserData;
  dailyTracking: DailyTracking | null;
  isLoading: boolean;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  updateGoal: (goal: Goal) => Promise<void>;
  markDayComplete: () => Promise<void>;
  refreshTracking: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData>(null);
  const [dailyTracking, setDailyTracking] = useState<DailyTracking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const res = await api.get('/users/me');
      if (res.success) {
        setUser({
          ...res.data,
          currentGoal: res.data.goals.currentGoal,
          streak: res.data.streak,
          macroTargets: res.data.goals.macroTargets,
          profile: res.data.profile,
        });
        await loadTracking(res.data.id);
      }
    } catch {
      localStorage.removeItem('macroplate_access_token');
      localStorage.removeItem('macroplate_refresh_token');
      setUser(null);
    }
  };

  const loadTracking = async (userId: string) => {
    try {
      const res = await api.get(`/tracking/${userId}/today`);
      if (res.success) {
        setDailyTracking({
          date: res.data.date,
          consumed: res.data.consumed,
          goalMet: res.data.goalMet,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('macroplate_access_token');
    if (token) {
      loadProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = async (credential: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/google', { credential });
      if (res.success) {
        localStorage.setItem('macroplate_access_token', res.data.tokens.accessToken);
        localStorage.setItem('macroplate_refresh_token', res.data.tokens.refreshToken);
        await loadProfile();
      }
    } catch (e) {
      console.error('Login failed', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('macroplate_access_token');
    localStorage.removeItem('macroplate_refresh_token');
    setUser(null);
    setDailyTracking(null);
  };

  const updateGoal = async (goal: Goal) => {
    if (!user) return;
    try {
      await api.patch('/users/goal', { goal });
      setUser({ ...user, currentGoal: goal });
    } catch (e) {
      console.error(e);
    }
  };

  const markDayComplete = async () => {
    if (!user) return;
    try {
      const res = await api.post(`/tracking/${user.id}/complete-day`, {});
      if (res.success) {
        setUser({ ...user, streak: res.data.streakCount });
        await loadTracking(user.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const refreshTracking = async () => {
    if (user) await loadTracking(user.id);
  };

  return (
    <UserContext.Provider value={{ user, dailyTracking, isLoading, loginWithGoogle, logout, updateGoal, markDayComplete, refreshTracking }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
