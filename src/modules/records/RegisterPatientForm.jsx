import React, { useState } from 'react';
import { UserPlus, CheckCircle2, AlertCircle, Smartphone, User, Phone, MapPin, Calendar } from 'lucide-react';
import { Card } from '../../shared/Card';
import { Button } from '../../shared/Button';
import { useAuth } from '../../auth/AuthContext';
import { createPatient } from '../../shared/dataService';

export function RegisterPatientForm({ onRegistered, onSuccess, className = '' }) {
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    address: '',
    hasSmartphone: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successPatient, setSuccessPatient] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const setGender = (gender) => {
    setFormData((prev) => ({ ...prev, gender }));
    if (error) setError('');
  };

  const setSmartphone = (hasSmartphone) => {
    setFormData((prev) => ({ ...prev, hasSmartphone }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedAge = formData.age.toString().trim();

    if (!trimmedName) {
      setError('Please enter the patient full name.');
      return;
    }
    if (!trimmedAge || isNaN(Number(trimmedAge)) || Number(trimmedAge) < 0 || Number(trimmedAge) > 130) {
      setError('Please enter a valid age (0 - 130).');
      return;
    }
    if (!trimmedPhone) {
      setError('Please enter the contact phone number.');
      return;
    }

    setLoading(true);

    try {
      const receptionistName =
        currentUser?.displayName ||
        currentUser?.name ||
        currentUser?.email ||
        currentUser?.uid ||
        'receptionist';

      const payload = {
        name: trimmedName,
        age: parseInt(trimmedAge, 10),
        gender: formData.gender,
        phone: trimmedPhone,
        address: formData.address.trim(),
        hasSmartphone: Boolean(formData.hasSmartphone),
        registeredBy: receptionistName,
        createdAt: new Date().toISOString(),
      };

      const saved = await createPatient(payload);

      setSuccessPatient(saved);
      if (typeof onRegistered === 'function') onRegistered(saved);
      if (typeof onSuccess === 'function') onSuccess(saved);

      // Trigger global event so PatientSearch can update immediately if mounted
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mediflow:patient-registered', { detail: saved }));
      }
    } catch (err) {
      console.error('Failed to register patient:', err);
      setError(err.message || 'Failed to register patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      phone: '',
      address: '',
      hasSmartphone: true,
    });
    setSuccessPatient(null);
    setError('');
  };

  return (
    <Card className={`relative ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-mediteal-light text-mediteal flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Register New Patient</h3>
            <p className="text-xs text-slate-500">
              Create an outpatient file for receptionist registration
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successPatient && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-emerald-900">
                Patient registered successfully!
              </h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                File created for <strong className="font-medium text-emerald-950">{successPatient.name}</strong> (ID: <code className="font-mono bg-emerald-100/70 px-1 py-0.5 rounded text-[11px]">{successPatient.id}</code>).
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  type="button"
                  size="small"
                  variant="primary"
                  onClick={handleReset}
                  icon={UserPlus}
                >
                  Register Another Patient
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Error Banner */}
      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-medicoral-light border border-medicoral/25 text-medicoral flex items-center gap-2.5 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            Full Name <span className="text-medicoral">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ramesh Patel"
              disabled={loading}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-mediteal focus:ring-1 focus:ring-mediteal text-sm transition-colors"
            />
          </div>
        </div>

        {/* Age and Gender (2 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Age */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Age <span className="text-medicoral">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="number"
                name="age"
                min="0"
                max="130"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 34"
                disabled={loading}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-mediteal focus:ring-1 focus:ring-mediteal text-sm transition-colors"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Gender <span className="text-medicoral">*</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {['Male', 'Female', 'Other'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  disabled={loading}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all text-center ${
                    formData.gender === g
                      ? 'bg-white text-mediteal shadow-sm border border-slate-200/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            Phone Number <span className="text-medicoral">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +91 98765 43210"
              disabled={loading}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-mediteal focus:ring-1 focus:ring-mediteal text-sm transition-colors"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            Residential Address
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. B-104 Sunrise Apartments, Ward 6"
              disabled={loading}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-mediteal focus:ring-1 focus:ring-mediteal text-sm transition-colors"
            />
          </div>
        </div>

        {/* Has a smartphone (Yes / No) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            Has a smartphone <span className="text-medicoral">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setSmartphone(true)}
              disabled={loading}
              className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl border text-sm font-semibold transition-all ${
                formData.hasSmartphone === true
                  ? 'bg-mediteal-light text-mediteal border-mediteal ring-1 ring-mediteal'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Smartphone className="w-4 h-4 stroke-[2]" />
              <span>Yes (Smartphone)</span>
            </button>
            <button
              type="button"
              onClick={() => setSmartphone(false)}
              disabled={loading}
              className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl border text-sm font-semibold transition-all ${
                formData.hasSmartphone === false
                  ? 'bg-mediteal-light text-mediteal border-mediteal ring-1 ring-mediteal'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>No (Basic / Keypad)</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Determines whether patient receives WhatsApp/app reminders or SMS alerts.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
            className="!py-3 font-bold"
          >
            {loading ? 'Saving to Records...' : 'Save & Register Patient'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
