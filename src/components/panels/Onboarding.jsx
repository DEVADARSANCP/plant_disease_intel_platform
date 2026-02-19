import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, MapPin, Wallet, Cpu, Leaf, ChevronRight, ChevronLeft,
  Check, Droplets, Home, Users, Building, Sprout, Info,
  CheckCircle2, AlertCircle, User, ShoppingCart, Loader2
} from 'lucide-react';
import { saveFarmerProfile } from '../../services/api';

const steps = [
  { id: 'info', title: 'Info', icon: User },
  { id: 'time', title: 'Time', icon: Clock },
  { id: 'land', title: 'Land', icon: MapPin },
  { id: 'capital', title: 'Capital', icon: Wallet },
  { id: 'technology', title: 'Tech', icon: Cpu },
  { id: 'crops', title: 'Crops', icon: Leaf },
  { id: 'commodity', title: 'Commodity', icon: ShoppingCart }
];

const farmerTypes = [
  { value: 'new_farmer', label: 'New Farmer', desc: 'Just starting my farming journey', icon: '🌱' },
  { value: 'experienced', label: 'Experienced', desc: 'I have years of farming experience', icon: '🧑‍🌾' },
  { value: 'learning', label: 'Learning', desc: 'Exploring modern farming techniques', icon: '📚' },
  { value: 'profit_focused', label: 'Profit Focused', desc: 'Maximize returns on investment', icon: '💰' }
];

const stateOptions = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const timeOptions = [
  { value: 'full_time', label: 'Full-time', desc: 'I can dedicate all my time', icon: '👨‍🌾' },
  { value: 'part_time', label: 'Part-time', desc: '4-6 hours daily', icon: '⏱️' },
  { value: 'weekend', label: 'Weekend Only', desc: 'Only on weekends', icon: '🗓️' }
];

const noLandOptions = [
  { value: 'lease', label: 'Lease Land', icon: Home, desc: 'Rent agricultural land' },
  { value: 'community', label: 'Community Farming', icon: Users, desc: 'Join a farming group' },
  { value: 'hydroponics', label: 'Hydroponics Indoor', icon: Droplets, desc: 'Soilless farming' },
  { value: 'terrace', label: 'Terrace Farming', icon: Building, desc: 'Use your rooftop' }
];

const technologies = [
  { value: 'hydroponics', label: 'Hydroponics', desc: 'Soilless water-based' },
  { value: 'polyhouse', label: 'Polyhouse', desc: 'Controlled environment' },
  { value: 'drip_irrigation', label: 'Drip Irrigation', desc: 'Water efficiency' },
  { value: 'vertical_farming', label: 'Vertical Farming', desc: 'Space optimization' },
  { value: 'traditional', label: 'Traditional Only', desc: 'Classic methods' }
];

const cropOptions = [
  { value: 'rice', label: 'Rice', emoji: '🌾' },
  { value: 'vegetables', label: 'Vegetables', emoji: '🥬' },
  { value: 'fruits', label: 'Fruits', emoji: '🍎' },
  { value: 'pulses', label: 'Pulses', emoji: '🫘' },
  { value: 'suggest', label: 'Suggest for me', emoji: '🤖' }
];

const commodityOptions = [
  { value: 'Banana', label: 'Banana', emoji: '🍌', region: 'Kerala_Kottayam' },
  { value: 'Tomato', label: 'Tomato', emoji: '🍅', region: 'Karnataka_Bangalore' },
  { value: 'Rice', label: 'Rice', emoji: '🌾', region: 'Andhra Pradesh_Guntur' },
  { value: 'Onion', label: 'Onion', emoji: '🧅', region: 'Maharashtra_Nashik' },
  { value: 'Potato', label: 'Potato', emoji: '🥔', region: 'Uttar Pradesh_Agra' },
  { value: 'Wheat', label: 'Wheat', emoji: '🌾', region: 'Punjab_Ludhiana' },
  { value: 'Cotton', label: 'Cotton', emoji: '🏵️', region: 'Gujarat_Rajkot' },
  { value: 'Soyabean', label: 'Soyabean', emoji: '🫘', region: 'Madhya Pradesh_Indore' }
];

export default function Onboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [data, setData] = useState({
    farmer_type: '',
    full_name: '',
    location: '',
    district: '',
    state: '',
    time_commitment: '',
    has_land: null,
    land_size: '',
    has_irrigation: false,
    no_land_option: '',
    capital_amount: 50000,
    technologies: [],
    crop_preferences: [],
    primary_commodity: '',
    primary_region: ''
  });

  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field, value) => {
    const current = data[field] || [];
    if (current.includes(value)) {
      updateData(field, current.filter(v => v !== value));
    } else {
      updateData(field, [...current, value]);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return data.farmer_type && data.full_name.trim();
      case 1: return data.time_commitment;
      case 2: return data.has_land !== null && (data.has_land ? data.land_size : data.no_land_option);
      case 3: return data.capital_amount > 0;
      case 4: return data.technologies.length > 0;
      case 5: return data.crop_preferences.length > 0;
      case 6: return data.primary_commodity;
      default: return true;
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const profilePayload = {
        farmer_type: data.farmer_type,
        full_name: data.full_name,
        location: data.location,
        district: data.district,
        state: data.state,
        land_size: parseFloat(data.land_size) || 0,
        available_capital: data.capital_amount,
        has_irrigation: data.has_irrigation,
        has_land: data.has_land || false,
        no_land_option: data.no_land_option,
        interested_crops: data.crop_preferences,
        technology_interest: data.technologies,
        time_commitment: data.time_commitment,
        primary_commodity: data.primary_commodity,
        primary_region: data.primary_region,
      };

      const result = await saveFarmerProfile(profilePayload);
      // Store farmer ID for dashboard queries
      const completeData = { ...data, farmerId: result.id };
      onComplete(completeData);
    } catch (err) {
      console.error('Profile save failed:', err);
      setSaveError(err.message || 'Failed to save profile');
      // Still proceed even if save fails — data is in localStorage
      const completeData = { ...data, farmerId: null };
      onComplete(completeData);
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const formatCapital = (value) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return `₹${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="ob-screen">
      <div className="ob-bg-dec">
        <div className="ob-bg-blob ob-bg-blob--1" />
        <div className="ob-bg-blob ob-bg-blob--2" />
      </div>

      <div className="ob-container">
        {/* Header */}
        <div className="ob-header">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="ob-logo"
          >
            <Sprout className="ob-logo-icon" />
          </motion.div>
          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="ob-title"
          >
            Farming Journey
          </motion.h1>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="ob-subtitle"
          >
            Answer a few questions so we can generate your personalized crop &amp; profit plan.
          </motion.p>
        </div>

        {/* Progress Tracker */}
        <div className="ob-progress">
          <div className="ob-progress-line" />
          <motion.div
            className="ob-progress-line-active"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return (
              <div key={step.id} className="ob-progress-step">
                <button
                  onClick={() => index < currentStep && setCurrentStep(index)}
                  className={`ob-progress-dot ${isActive ? 'ob-progress-dot--active' : ''} ${isCompleted ? 'ob-progress-dot--done' : ''}`}
                >
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : <Icon size={18} />}
                </button>
                <span className={`ob-progress-label ${isActive ? 'ob-progress-label--active' : ''}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step Content Card */}
        <div className="ob-card">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="ob-card-inner"
            >
              {/* Step 0: Farmer Info */}
              {currentStep === 0 && (
                <div className="ob-step">
                  <div className="ob-step-header">
                    <div className="ob-step-icon"><User size={22} /></div>
                    <h3>Tell Us About You</h3>
                  </div>

                  <div className="ob-field">
                    <label>Your Name</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={data.full_name}
                      onChange={(e) => updateData('full_name', e.target.value)}
                      className="ob-text-input"
                    />
                  </div>

                  <div className="ob-field-row">
                    <div className="ob-field ob-field--half">
                      <label>State</label>
                      <select
                        value={data.state}
                        onChange={(e) => updateData('state', e.target.value)}
                        className="ob-select"
                      >
                        <option value="">Select State</option>
                        {stateOptions.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="ob-field ob-field--half">
                      <label>District</label>
                      <input
                        type="text"
                        placeholder="Your district"
                        value={data.district}
                        onChange={(e) => updateData('district', e.target.value)}
                        className="ob-text-input"
                      />
                    </div>
                  </div>

                  <div className="ob-step-header" style={{ marginTop: '8px' }}>
                    <h3 style={{ fontSize: 'var(--font-size-md)' }}>I am a...</h3>
                  </div>
                  <div className="ob-options-list">
                    {farmerTypes.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateData('farmer_type', option.value)}
                        className={`ob-option-btn ${data.farmer_type === option.value ? 'ob-option-btn--selected' : ''}`}
                      >
                        <span className="ob-option-emoji">{option.icon}</span>
                        <div className="ob-option-text">
                          <p className="ob-option-label">{option.label}</p>
                          <p className="ob-option-desc">{option.desc}</p>
                        </div>
                        {data.farmer_type === option.value && <CheckCircle2 className="ob-option-check" size={20} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Time Commitment */}
              {currentStep === 1 && (
                <div className="ob-step">
                  <div className="ob-step-header">
                    <div className="ob-step-icon"><Clock size={22} /></div>
                    <h3>Time Commitment</h3>
                  </div>
                  <div className="ob-options-list">
                    {timeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateData('time_commitment', option.value)}
                        className={`ob-option-btn ${data.time_commitment === option.value ? 'ob-option-btn--selected' : ''}`}
                      >
                        <span className="ob-option-emoji">{option.icon}</span>
                        <div className="ob-option-text">
                          <p className="ob-option-label">{option.label}</p>
                          <p className="ob-option-desc">{option.desc}</p>
                        </div>
                        {data.time_commitment === option.value && <CheckCircle2 className="ob-option-check" size={20} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Land */}
              {currentStep === 2 && (
                <div className="ob-step">
                  <div className="ob-step-header">
                    <div className="ob-step-icon"><MapPin size={22} /></div>
                    <h3>Land Details</h3>
                  </div>

                  <div className="ob-land-toggle">
                    <button
                      onClick={() => updateData('has_land', true)}
                      className={`ob-land-choice ${data.has_land === true ? 'ob-land-choice--selected' : ''}`}
                    >
                      <div className={`ob-land-choice-icon ${data.has_land === true ? 'ob-land-choice-icon--active' : ''}`}>
                        <Check size={24} />
                      </div>
                      <p>I Have Land</p>
                    </button>
                    <button
                      onClick={() => updateData('has_land', false)}
                      className={`ob-land-choice ${data.has_land === false ? 'ob-land-choice--selected' : ''}`}
                    >
                      <div className={`ob-land-choice-icon ${data.has_land === false ? 'ob-land-choice-icon--active' : ''}`}>
                        <Building size={24} />
                      </div>
                      <p>Need Land</p>
                    </button>
                  </div>

                  {data.has_land === true && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ob-land-form">
                      <div className="ob-field">
                        <label>Land Size (Acres)</label>
                        <input
                          type="number"
                          placeholder="0.0"
                          value={data.land_size}
                          onChange={(e) => updateData('land_size', e.target.value)}
                        />
                      </div>
                      <label className="ob-checkbox-row">
                        <input
                          type="checkbox"
                          checked={data.has_irrigation}
                          onChange={(e) => updateData('has_irrigation', e.target.checked)}
                        />
                        <span><Droplets size={16} className="ob-check-icon" /> Irrigation Available</span>
                      </label>
                    </motion.div>
                  )}

                  {data.has_land === false && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ob-no-land">
                      <div className="ob-info-banner">
                        <Info size={18} />
                        <p>No land? We'll suggest urban farming or lease options!</p>
                      </div>
                      <div className="ob-no-land-grid">
                        {noLandOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => updateData('no_land_option', opt.value)}
                            className={`ob-no-land-btn ${data.no_land_option === opt.value ? 'ob-no-land-btn--selected' : ''}`}
                          >
                            <opt.icon size={20} className="ob-no-land-icon" />
                            <p>{opt.label}</p>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step 3: Capital */}
              {currentStep === 3 && (
                <div className="ob-step">
                  <div className="ob-step-header">
                    <div className="ob-step-icon"><Wallet size={22} /></div>
                    <h3>Investment Budget</h3>
                  </div>

                  <div className="ob-capital-hero">
                    <p className="ob-capital-label">Maximum Budget</p>
                    <h4 className="ob-capital-value">{formatCapital(data.capital_amount)}</h4>
                    <input
                      type="range"
                      min={10000}
                      max={1000000}
                      step={10000}
                      value={data.capital_amount}
                      onChange={(e) => updateData('capital_amount', parseInt(e.target.value))}
                      className="ob-slider"
                    />
                    <div className="ob-slider-labels">
                      <span>₹10k</span>
                      <span>₹5L</span>
                      <span>₹10L+</span>
                    </div>
                  </div>

                  <div className="ob-capital-presets">
                    {[50000, 200000, 500000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => updateData('capital_amount', amount)}
                        className={`ob-preset-btn ${data.capital_amount === amount ? 'ob-preset-btn--selected' : ''}`}
                      >
                        {formatCapital(amount)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Tech */}
              {currentStep === 4 && (
                <div className="ob-step">
                  <div className="ob-step-header">
                    <div className="ob-step-icon"><Cpu size={22} /></div>
                    <h3>Technology Interest</h3>
                  </div>
                  <div className="ob-options-list">
                    {technologies.map((tech) => (
                      <button
                        key={tech.value}
                        onClick={() => toggleArrayItem('technologies', tech.value)}
                        className={`ob-option-btn ${data.technologies.includes(tech.value) ? 'ob-option-btn--selected' : ''}`}
                      >
                        <div className="ob-option-text">
                          <p className="ob-option-label">{tech.label}</p>
                          <p className="ob-option-desc">{tech.desc}</p>
                        </div>
                        {data.technologies.includes(tech.value)
                          ? <div className="ob-check-circle"><Check size={12} strokeWidth={3} /></div>
                          : <div className="ob-uncheck-circle" />
                        }
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Crops */}
              {currentStep === 5 && (
                <div className="ob-step ob-step--grow">
                  <div className="ob-step-header">
                    <div className="ob-step-icon"><Leaf size={22} /></div>
                    <h3>Crop Preferences</h3>
                  </div>
                  <div className="ob-crop-grid">
                    {cropOptions.map((crop) => (
                      <button
                        key={crop.value}
                        onClick={() => toggleArrayItem('crop_preferences', crop.value)}
                        className={`ob-crop-btn ${data.crop_preferences.includes(crop.value) ? 'ob-crop-btn--selected' : ''}`}
                      >
                        <span className="ob-crop-emoji">{crop.emoji}</span>
                        <p className="ob-crop-label">{crop.label}</p>
                      </button>
                    ))}
                  </div>

                  {data.crop_preferences.length > 0 && (
                    <div className="ob-crop-summary">
                      <AlertCircle size={16} />
                      <p>AI will prioritize {data.crop_preferences.length} selected {data.crop_preferences.length === 1 ? 'category' : 'categories'} for your plan.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 6: Primary Commodity */}
              {currentStep === 6 && (
                <div className="ob-step ob-step--grow">
                  <div className="ob-step-header">
                    <div className="ob-step-icon"><ShoppingCart size={22} /></div>
                    <h3>Primary Commodity</h3>
                  </div>
                  <p className="ob-option-desc" style={{ marginBottom: '8px' }}>
                    Select the main commodity you want to track on your dashboard. We'll show live mandi prices, buyer signals, and AI recommendations for this crop.
                  </p>
                  <div className="ob-crop-grid">
                    {commodityOptions.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => {
                          updateData('primary_commodity', c.value);
                          updateData('primary_region', c.region);
                        }}
                        className={`ob-crop-btn ${data.primary_commodity === c.value ? 'ob-crop-btn--selected' : ''}`}
                      >
                        <span className="ob-crop-emoji">{c.emoji}</span>
                        <p className="ob-crop-label">{c.label}</p>
                      </button>
                    ))}
                  </div>

                  {saveError && (
                    <div className="ob-info-banner" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.06)', color: 'var(--accent-red)' }}>
                      <AlertCircle size={16} />
                      <p>{saveError}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer Navigation */}
          <div className="ob-card-footer">
            <button
              className="btn btn-outline ob-nav-btn"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="btn btn-primary ob-nav-btn ob-nav-btn--next"
              onClick={nextStep}
              disabled={!canProceed() || saving}
            >
              {saving ? (
                <><Loader2 size={18} className="ob-spinner-icon" /> Saving...</>
              ) : currentStep === steps.length - 1 ? (
                <>Generate My Plan <ChevronRight size={18} /></>
              ) : (
                <>Continue <ChevronRight size={18} /></>
              )}
            </button>
          </div>
        </div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="ob-support"
        >
          <button className="ob-support-btn">
            <Users size={14} /> Need help? Talk to an Agri-Expert
          </button>
        </motion.div>
      </div>
    </div>
  );
}
