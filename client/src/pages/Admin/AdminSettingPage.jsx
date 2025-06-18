/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { FiSave, FiRefreshCw, FiSettings } from 'react-icons/fi';
import AdminNavPane from '../../components/AdminNavPane';
import { API_BASE_URL } from '../../config/api';

const AdminSettingPage = () => {
    const [activeMenu, setActiveMenu] = useState('settings');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [eventSettings, setEventSettings] = useState({
        maxInvitationsPerEvent: 100,
        maxAttendeesPerEvent: 500,
    });

    const [formErrors, setFormErrors] = useState({});

    // Fetch current settings from Setting Obj MongoDB
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`${API_BASE_URL}/api/settings/`);
                const data = await res.json();
                setEventSettings(data.eventSettings);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching settings:', error);
                setMessage({ type: 'error', text: 'Failed to load settings.' });
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);


    const handleEventSettingChange = (e) => {
        const { name, value } = e.target;
        const numericValue = ['maxInvitationsPerEvent', 'maxAttendeesPerEvent'].includes(name)
            ? parseInt(value, 10)
            : value;
        setEventSettings({ ...eventSettings, [name]: numericValue });
        if (formErrors[name]) setFormErrors({ ...formErrors, [name]: null });
    };

    const validateForm = () => {
        const errors = {};
        if (eventSettings.maxInvitationsPerEvent < 1) {
            errors.maxInvitationsPerEvent = 'Must be at least 1';
        }
        if (eventSettings.maxAttendeesPerEvent < 1) {
            errors.maxAttendeesPerEvent = 'Must be at least 1';
        }
        return errors;
    };

    // Save updated settings
    const handleSaveSettings = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setMessage({ type: 'error', text: 'Input error. Please fix before saving' });
            return;
        }
        
        try {
            setIsSaving(true);
            const res = await fetch(`${API_BASE_URL}/api/settings/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventSettings),
            });

            if (!res.ok) throw new Error('Save failed');
            const result = await res.json();

            setIsSaving(false);
            setMessage({ type: 'success', text: result.message });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Save failed:', error);
            setIsSaving(false);
            setMessage({ type: 'error', text: 'Failed to save settings.' });
        }
    };

    const handleResetDefaults = () => {
        setEventSettings({ maxInvitationsPerEvent: 100, maxAttendeesPerEvent: 500 });
        setFormErrors({});
        setMessage({ type: 'info', text: 'Settings reset to default values' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen bg-gray-50 font-[Poppins]">
                <AdminNavPane activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading settings...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 font-[Poppins]">
            <AdminNavPane activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

            <div className="flex-1 overflow-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Event Settings</h1>
                    <div className="flex space-x-4">
                        <button onClick={handleResetDefaults} className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">
                            <FiRefreshCw className="mr-2 h-5 w-5" /> Reset Defaults
                        </button>
                        <button onClick={handleSaveSettings} disabled={isSaving} className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            {isSaving ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> Saving...</> :
                                <><FiSave className="mr-2 h-5 w-5" /> Save Changes</>}
                        </button>
                    </div>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-800' : message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Event Settings */}
                    <div className="bg-white p-6 rounded-md shadow-sm border">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="p-3 rounded-full bg-[#EFF6FF]">
                                <FiSettings className="h-6 w-6 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800">Event Settings</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Maximum Invitations Per Event</label>
                                <input
                                    type="number"
                                    name="maxInvitationsPerEvent"
                                    value={eventSettings.maxInvitationsPerEvent}
                                    onChange={handleEventSettingChange}
                                    className={`w-full mt-1 py-2 px-3 border ${formErrors.maxInvitationsPerEvent ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                    min="1"
                                />
                                {formErrors.maxInvitationsPerEvent && <p className="text-sm text-red-600">{formErrors.maxInvitationsPerEvent}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Maximum Attendees Per Event</label>
                                <input
                                    type="number"
                                    name="maxAttendeesPerEvent"
                                    value={eventSettings.maxAttendeesPerEvent}
                                    onChange={handleEventSettingChange}
                                    className={`w-full mt-1 py-2 px-3 border ${formErrors.maxAttendeesPerEvent ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                    min="1"
                                />
                                {formErrors.maxAttendeesPerEvent && <p className="text-sm text-red-600">{formErrors.maxAttendeesPerEvent}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettingPage;
