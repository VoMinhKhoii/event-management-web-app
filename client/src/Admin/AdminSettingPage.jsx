/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { FiSave, FiRefreshCw, FiInfo, FiSettings } from 'react-icons/fi';

import AdminNavPane from '../components/AdminNavPane';

const AdminSettingPage = () => {
    const [activeMenu, setActiveMenu] = useState('settings');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Settings state objects
    const [eventSettings, setEventSettings] = useState({
        maxEventsPerUser: 10,
        maxInvitationsPerEvent: 100,
        maxAttendeesPerEvent: 500,
    });
    
    const [notificationSettings, setNotificationSettings] = useState({
        enableEmailNotifications: true,
        reminderTimeBefore: 24, // hours
        sendUpdateNotifications: true,
        sendRSVPReminders: true
    });
    
    const [systemSettings, setSystemSettings] = useState({
        eventCategories: ['Tech', 'Business', 'Game', 'Music', 'Sports'],
        registrationRequiresApproval: false,
        defaultUserRole: 'attendee'
    });
    
    // Form validation state
    const [formErrors, setFormErrors] = useState({});
    
    // Fetch settings on component mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setIsLoading(true);
                
                // Simulating API call to fetch settings
                // In a real application, you would fetch from your API
                // const response = await fetch('http://localhost:8800/api/admin/settings', {
                //     credentials: 'include'
                // });
                
                // if (!response.ok) {
                //     throw new Error('Failed to fetch settings');
                // }
                
                // const settingsData = await response.json();
                
                // Simulate successful data fetch
                setTimeout(() => {
                    // This would be replaced with actual API data
                    // setEventSettings(settingsData.eventSettings);
                    // setNotificationSettings(settingsData.notificationSettings);
                    // setSystemSettings(settingsData.systemSettings);
                    setIsLoading(false);
                }, 800);
                
            } catch (error) {
                console.error('Error fetching settings:', error);
                setMessage({
                    type: 'error',
                    text: 'Failed to load settings. Please try again.'
                });
                setIsLoading(false);
            }
        };
        
        fetchSettings();
    }, []);

    // Handle form input changes for event settings
    const handleEventSettingChange = (e) => {
        const { name, value } = e.target;
        
        // Convert string values to numbers where appropriate
        const numericValue = ['maxEventsPerUser', 'maxInvitationsPerEvent', 'maxAttendeesPerEvent'].includes(name)
            ? parseInt(value, 10)
            : value;
            
        setEventSettings({
            ...eventSettings,
            [name]: numericValue
        });
        
        // Clear error for this field if it exists
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: null
            });
        }
    };

    // Handle form input changes for system settings
    const handleSystemSettingChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // Handle checkboxes separately
        const newValue = type === 'checkbox' ? checked : value;
            
        setSystemSettings({
            ...systemSettings,
            [name]: newValue
        });
        
        // Clear error for this field if it exists
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: null
            });
        }
    };

    // Handle category input (comma-separated values)
    const handleCategoryChange = (e) => {
        const categoriesText = e.target.value;
        
        // Split by commas and trim whitespace
        const categoriesArray = categoriesText
            .split(',')
            .map(category => category.trim())
            .filter(category => category !== '');
            
        setSystemSettings({
            ...systemSettings,
            eventCategories: categoriesArray
        });
        
        // Clear error for this field if it exists
        if (formErrors.eventCategories) {
            setFormErrors({
                ...formErrors,
                eventCategories: null
            });
        }
    };

    // Validate form before submission
    const validateForm = () => {
        const errors = {};
        
        // Validate event settings
        if (eventSettings.maxEventsPerUser < 1) {
            errors.maxEventsPerUser = 'Must be at least 1';
        }
        if (eventSettings.maxInvitationsPerEvent < 1) {
            errors.maxInvitationsPerEvent = 'Must be at least 1';
        }
        if (eventSettings.maxAttendeesPerEvent < 1) {
            errors.maxAttendeesPerEvent = 'Must be at least 1';
        }
        // Validate notification settings
        if (notificationSettings.reminderTimeBefore < 0) {
            errors.reminderTimeBefore = 'Must be a positive number';
        }
        
        // Validate system settings
        if (systemSettings.eventCategories.length === 0) {
            errors.eventCategories = 'At least one category is required';
        }
        
        return errors;
    };

    // Handle save settings
    const handleSaveSettings = async () => {
        // Validate form
        const errors = validateForm();
        
        // If validation errors exist, show them and prevent submission
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setMessage({
                type: 'error',
                text: 'Please fix the errors before saving'
            });
            return;
        }
        
        try {
            setIsSaving(true);
            
            // Combine all settings into one object
            const allSettings = {
                eventSettings,
                notificationSettings,
                systemSettings
            };
            
            // Simulating API call to save settings
            // In a real application, you would post to your API
            
            // const response = await fetch('http://localhost:8800/api/admin/settings', {
            //     method: 'PUT',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     credentials: 'include',
            //     body: JSON.stringify(allSettings)
            // });
            
            // if (!response.ok) {
            //     throw new Error('Failed to save settings');
            // }
            
            // Simulate successful save
            setTimeout(() => {
                setIsSaving(false);
                setMessage({
                    type: 'success',
                    text: 'Settings saved successfully'
                });
                
                // Clear message after 3 seconds
                setTimeout(() => {
                    setMessage({ type: '', text: '' });
                }, 3000);
            }, 800);
            
        } catch (error) {
            console.error('Error saving settings:', error);
            setIsSaving(false);
            setMessage({
                type: 'error',
                text: 'Failed to save settings. Please try again.'
            });
        }
    };

    // Reset settings to default
    const handleResetDefaults = () => {
        // Default values - in a real app, these might come from a constants file
        setEventSettings({
            maxEventsPerUser: 10,
            maxInvitationsPerEvent: 100,
            maxAttendeesPerEvent: 500,
        });
        
        setNotificationSettings({
            enableEmailNotifications: true,
            reminderTimeBefore: 24,
            sendUpdateNotifications: true,
            sendRSVPReminders: true
        });
        
        setSystemSettings({
            eventCategories: ['Tech', 'Business', 'Game', 'Music', 'Sports'],
            registrationRequiresApproval: false,
            defaultUserRole: 'attendee'
        });
        
        // Clear any form errors
        setFormErrors({});
        
        setMessage({
            type: 'info',
            text: 'Settings reset to default values'
        });
        
        // Clear message after 3 seconds
        setTimeout(() => {
            setMessage({ type: '', text: '' });
        }, 3000);
    };

    // Render loading state
    if (isLoading) {
        return (
            <div className="flex h-screen bg-gray-50 font-[Poppins]">
                {/* Sidebar */}
                <AdminNavPane activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
                
                {/* Loading state */}
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
            {/* Sidebar */}
            <AdminNavPane activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

            {/* Main Content */}
            <div className="flex-1 overflow-auto px-4 py-6">
                <div className="flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
                        <div className="flex space-x-4">
                            <button
                                onClick={handleResetDefaults}
                                className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isSaving}
                            >
                                <FiRefreshCw className="mr-2 h-5 w-5" />
                                Reset Defaults
                            </button>
                            <button
                                onClick={handleSaveSettings}
                                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="mr-2 h-5 w-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Status message */}
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-md ${
                            message.type === 'error' ? 'bg-red-100 text-red-800' :
                            message.type === 'success' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Settings Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Event Settings Card */}
                        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="p-3 rounded-full bg-[#EFF6FF]">
                                    <FiSettings className="h-6 w-6 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">Event Settings</h2>
                            </div>
                            
                            <div className="space-y-4">
                                {/* Max Events Per User */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Maximum Events Per User
                                    </label>
                                    <input
                                        type="number"
                                        name="maxEventsPerUser"
                                        value={eventSettings.maxEventsPerUser}
                                        onChange={handleEventSettingChange}
                                        className={`w-full py-2 px-3 border ${formErrors.maxEventsPerUser ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        min="1"
                                    />
                                    {formErrors.maxEventsPerUser && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.maxEventsPerUser}</p>
                                    )}
                                    <p className="mt-1 text-sm text-gray-500">
                                        Maximum number of active events a user can create
                                    </p>
                                </div>
                                
                                {/* Max Invitations Per Event */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Maximum Invitations Per Event
                                    </label>
                                    <input
                                        type="number"
                                        name="maxInvitationsPerEvent"
                                        value={eventSettings.maxInvitationsPerEvent}
                                        onChange={handleEventSettingChange}
                                        className={`w-full py-2 px-3 border ${formErrors.maxInvitationsPerEvent ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        min="1"
                                    />
                                    {formErrors.maxInvitationsPerEvent && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.maxInvitationsPerEvent}</p>
                                    )}
                                    <p className="mt-1 text-sm text-gray-500">
                                        Maximum number of invitations that can be sent per event
                                    </p>
                                </div>
                                
                                {/* Max Attendees Per Event */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Maximum Attendees Per Event
                                    </label>
                                    <input
                                        type="number"
                                        name="maxAttendeesPerEvent"
                                        value={eventSettings.maxAttendeesPerEvent}
                                        onChange={handleEventSettingChange}
                                        className={`w-full py-2 px-3 border ${formErrors.maxAttendeesPerEvent ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        min="1"
                                    />
                                    {formErrors.maxAttendeesPerEvent && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.maxAttendeesPerEvent}</p>
                                    )}
                                    <p className="mt-1 text-sm text-gray-500">
                                        Maximum number of attendees allowed per event
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* System Settings Card */}
                        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 grid-cols-2 lg:grid-col-2">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="p-3 rounded-full bg-[#EFF6FF]">
                                    <FiInfo className="h-6 w-6 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">System Settings</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-4">
                                    {/* Event Categories */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Event Categories (comma-separated)
                                        </label>
                                        <textarea
                                            value={systemSettings.eventCategories.join(', ')}
                                            onChange={handleCategoryChange}
                                            className={`w-full py-2 px-3 border ${formErrors.eventCategories ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            rows="3"
                                        />
                                        {formErrors.eventCategories && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.eventCategories}</p>
                                        )}
                                        <p className="mt-1 text-sm text-gray-500">
                                            Categories available for event creation
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    {/* Registration Requires Approval */}
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="registrationRequiresApproval"
                                            name="registrationRequiresApproval"
                                            checked={systemSettings.registrationRequiresApproval}
                                            onChange={handleSystemSettingChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlForm="registrationRequiresApproval" className="ml-2 block text-sm text-gray-700">
                                            New User Registration Requires Admin Approval
                                        </label>
                                    </div>
                                    
                                    {/* Default User Role */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Default Role For New Users
                                        </label>
                                        <select
                                            name="defaultUserRole"
                                            value={systemSettings.defaultUserRole}
                                            onChange={handleSystemSettingChange}
                                            className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="attendee">Attendee</option>
                                            <option value="organizer">Organizer</option>
                                        </select>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Role assigned to newly registered users
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettingPage;