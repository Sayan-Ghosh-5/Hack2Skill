import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { ActivityLevel, Gender, Goal, calculateTDEE } from '../../utils/macroCalculator';
import { ArrowRight, Activity, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '../../utils/api';

export const OnboardingModal: React.FC = () => {
  const { user, loginWithGoogle, refreshTracking } = useUser();
  const [step, setStep] = useState(0); // 0 = Auth, 1 = Biometrics, 2 = Goal
  const [profile, setProfile] = useState({
    age: 28,
    weight: 75,
    height: 175,
    gender: 'male' as Gender,
    activityLevel: 'moderately_active' as ActivityLevel
  });

  useEffect(() => {
    // If not logged in, we stay on step 0
    if (!user) {
      setStep(0);
      return;
    }
    // If logged in but profile is incomplete (no weight or goal)
    if (!user.currentGoal) {
      setStep(1);
    }
  }, [user]);

  // If user is logged in AND has completed onboarding
  if (user && user.currentGoal) return null;

  const handleGoogleSuccess = async (response: any) => {
    if (response.credential) {
      await loginWithGoogle(response.credential);
    }
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleStartTracking = async (goal: Goal) => {
    try {
      // One-shot setup endpoint
      await api.post('/users/setup', { ...profile, goal });
      // Reload page to rehydrate user context smoothly
      window.location.reload();
    } catch (e) {
      console.error('Setup failed', e);
    }
  };

  const currentTDEE = calculateTDEE(profile.weight, profile.height, profile.age, profile.gender, profile.activityLevel);

  return (
    <div className="fixed inset-0 z-[100] bg-dark-bg/80 backdrop-blur-xl flex flex-col items-center justify-center p-4">
      <div className="bg-dark-surface w-full max-w-xl rounded-3xl border border-dark-elevated shadow-2xl overflow-hidden shadow-neon-green/10">
        
        {/* Header */}
        <div className="p-8 border-b border-dark-elevated text-center">
          <span className="text-3xl font-black text-neon-green tracking-tighter mb-2 block">MacroPlate</span>
          <h2 className="text-2xl font-bold text-white">
            {step === 0 ? "Welcome. Sign in to start tracking." : step === 1 ? "Let's calculate your personalized macro targets." : "Your Starting Point"}
          </h2>
        </div>

        {/* Content Step 0 (Auth) */}
        {step === 0 && (
          <div className="p-12 flex flex-col items-center justify-center space-y-6">
            <p className="text-text-secondary text-center font-medium max-w-sm mb-4">
              Your strictly measured progress spans devices safely secured by Google.
            </p>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.error('Login Failed')}
              theme="filled_black"
              shape="pill"
              size="large"
            />
          </div>
        )}

        {/* Content Step 1 */}
        {step === 1 && (
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-secondary">Age</label>
                <input 
                  type="number" 
                  value={profile.age}
                  onChange={(e) => setProfile({...profile, age: Number(e.target.value)})}
                  className="w-full bg-dark-bg border border-dark-elevated rounded-xl p-3 text-white focus:outline-none focus:border-neon-green transition-colors font-bold text-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-secondary">Weight (kg)</label>
                <input 
                  type="number" 
                  value={profile.weight}
                  onChange={(e) => setProfile({...profile, weight: Number(e.target.value)})}
                  className="w-full bg-dark-bg border border-dark-elevated rounded-xl p-3 text-white focus:outline-none focus:border-neon-green transition-colors font-bold text-lg"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-semibold text-text-secondary">Height (cm)</label>
                <input 
                  type="number" 
                  value={profile.height}
                  onChange={(e) => setProfile({...profile, height: Number(e.target.value)})}
                  className="w-full bg-dark-bg border border-dark-elevated rounded-xl p-3 text-white focus:outline-none focus:border-neon-green transition-colors font-bold text-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary">Gender</label>
              <div className="flex gap-4">
                {(['male', 'female', 'other'] as Gender[]).map(g => (
                  <button
                    key={g}
                    onClick={() => setProfile({...profile, gender: g})}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold capitalize transition-all ${
                      profile.gender === g ? 'bg-electric-blue text-dark-bg' : 'bg-dark-bg text-text-secondary border border-dark-elevated hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary">Activity Level</label>
              <select 
                value={profile.activityLevel}
                onChange={(e) => setProfile({...profile, activityLevel: e.target.value as ActivityLevel})}
                className="w-full bg-dark-bg border border-dark-elevated rounded-xl p-3 text-white focus:outline-none focus:border-neon-green transition-colors font-bold appearance-none"
              >
                <option value="sedentary">Sedentary (little/no exercise)</option>
                <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                <option value="very_active">Very Active (6-7 days/week)</option>
                <option value="athlete">Athlete (2x/day training)</option>
              </select>
            </div>

            <button 
              onClick={handleNext}
              className="w-full mt-6 py-4 bg-neon-green text-dark-bg font-bold rounded-xl text-lg hover:bg-white hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] flex justify-center items-center gap-2"
            >
              Calculate My Macros <ArrowRight size={20} className="stroke-[3px]" />
            </button>
          </div>
        )}

        {/* Content Step 2 */}
        {step === 2 && (
          <div className="p-8 space-y-6">
            <div className="bg-dark-bg p-6 rounded-2xl border border-dark-elevated text-center relative overflow-hidden group">
              <Activity className="absolute -left-4 -bottom-4 w-24 h-24 text-white/5 opacity-50 group-hover:scale-110 transition-transform duration-500" />
              <p className="text-text-secondary font-semibold mb-2">Your Maintenance Calories (TDEE)</p>
              <span className="text-5xl font-black text-white">{currentTDEE}</span>
              <span className="text-neon-green font-bold ml-2">kcal/day</span>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-white mb-2">Choose Your Primary Goal</h3>
              
              <button onClick={() => handleStartTracking('cutting')} className="w-full flex items-center justify-between p-4 bg-dark-bg border border-dark-elevated rounded-xl hover:border-intense-orange hover:bg-intense-orange/5 transition-all group">
                <div className="flex items-center gap-4">
                  <span className="text-2xl"><TrendingDown className="text-intense-orange" /></span>
                  <div className="text-left">
                    <span className="block font-bold text-white text-lg">Cutting (Fat Loss)</span>
                    <span className="text-sm text-text-secondary">Caloric Deficit</span>
                  </div>
                </div>
                <span className="font-black text-lg text-white">~{Math.round(currentTDEE * 0.85)} kcal</span>
              </button>

              <button onClick={() => handleStartTracking('bulking')} className="w-full flex items-center justify-between p-4 bg-dark-bg border border-dark-elevated rounded-xl hover:border-protein-blue hover:bg-protein-blue/5 transition-all group">
                <div className="flex items-center gap-4">
                  <span className="text-2xl"><TrendingUp className="text-protein-blue" /></span>
                  <div className="text-left">
                    <span className="block font-bold text-white text-lg">Bulking (Muscle Gain)</span>
                    <span className="text-sm text-text-secondary">Caloric Surplus</span>
                  </div>
                </div>
                <span className="font-black text-lg text-white">~{Math.round(currentTDEE * 1.15)} kcal</span>
              </button>

              <button onClick={() => handleStartTracking('maintenance')} className="w-full flex items-center justify-between p-4 bg-dark-bg border border-dark-elevated rounded-xl hover:border-calories-green hover:bg-calories-green/5 transition-all group">
                <div className="flex items-center gap-4">
                  <span className="text-2xl"><Scale className="text-calories-green" /></span>
                  <div className="text-left">
                    <span className="block font-bold text-white text-lg">Maintenance</span>
                    <span className="text-sm text-text-secondary">Sustain Weight</span>
                  </div>
                </div>
                <span className="font-black text-lg text-white">{currentTDEE} kcal</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
