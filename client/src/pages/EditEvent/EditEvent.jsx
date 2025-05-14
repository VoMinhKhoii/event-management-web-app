import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavPane from '../../components/NavPane.jsx';
import { useContext } from 'react';
import { AuthContext } from '../../context/authContext.jsx'; // adjust path if needed

const EditEvent = () => {
    const { id: eventId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const [errors, setErrors] = useState({});
    const [privacy, setPrivacy] = useState(true); // State for Privacy toggle
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        summary: '',
        startTime: '',
        endTime: '',
        startDate: '',
        endDate: '',
        location: '',
        eventType: '',
        image: null,
        maxAttendees: '',
        publicity: !privacy
    });

    // fetch event data when mounting component
    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const response = await fetch(`http://localhost:8800/api/events/${eventId}`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch event data');
                }
                const data = await response.json();

                const startDate = new Date(data.startDate).toISOString().split('T')[0];
                const endDate = new Date(data.endDate).toISOString().split('T')[0];

                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    summary: data.summary || '',
                    startTime: data.startTime || '',
                    endTime: data.endTime || '',
                    startDate: startDate || '',
                    endDate: endDate || '',
                    location: data.location || '',
                    eventType: data.eventType || '',
                    image: null, // handle image separately
                    maxAttendees: data.maxAttendees || '',
                    publicity: data.publicity !== undefined ? data.publicity : !privacy
                });

                setPrivacy(!data.publicity);

                if (data.image) {
                    setImagePreview(data.image);
                }
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching event data:', err);
                alert('Failed to fetch event data');
                navigate(`/event/${eventId}`);
            }
        };
        fetchEventData();
    }, [eventId, navigate])

    const validateForm = () => {
        try {
            const { startDate, endDate, startTime, endTime } = formData;

            // Ensure all required fields are present
            if (!startDate || !endDate || !startTime || !endTime) {
                alert("Please fill in all date and time fields.");
                return false;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate comparison
            const startDateTime = new Date(`${startDate}T${startTime}`);
            const endDateTime = new Date(`${endDate}T${endTime}`);

            // 1. Start date can't be today
            if (new Date(startDate).toDateString() === today.toDateString()) {
                alert("The start date cannot be today.");
                return false;
            }

            // 2. Start date can't be in the past
            if (new Date(startDate) < today) {
                alert("The start date cannot be in the past.");
                return false;
            }

            // 3. Start date can't be after the end date
            if (new Date(startDate) > new Date(endDate)) {
                alert("The start date cannot be after the end date.");
                return false;
            }

            // 4. Start time can't be after end time (on the same day)
            if (startDate === endDate && startDateTime >= endDateTime) {
                alert("The start time cannot be after or equal to the end time.");
                return false;
            }

            // If all validations pass
            return true;
        } catch (error) {
            console.error("Error validating form:", error);
            alert("An error occurred while validating the form.");
            return false;
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!window.confirm('Are you sure you want to update the event information?')) {
            return;
        }

        if (validateForm()) {
            try {
                const fd = new FormData();

                // append all non-file fields
                Object.entries(formData).forEach(([key, value]) => {
                    if (key !== 'image') {
                        fd.append(key, value);
                    }
                });

                // append file separately if exists
                if (formData.image && formData.image instanceof File) {
                    fd.append('image', formData.image);
                }
                fd.append('organizer', currentUser._id);

                const response = await fetch(`http://localhost:8800/api/events/${eventId}`, {
                    method: 'PUT',
                    credentials: 'include',
                    body: fd,
                });

                if (!response.ok) {
                    // If response is not in the 200-299 range
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to edit event');
                }

                const data = await response.json();
                console.log('Event edited:', data);
                alert('Event updated successfully!');
                navigate(`/event/${data._id}`); // Redirect to the event page
            } catch (error) {
                console.error('Error updating event:', error.message);
                alert(error.message || 'Failed to edit event');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'startTime' || name === 'endTime') {
            // Store the time in 24-hour format directly
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    }

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setFormData(prev => ({
                    ...prev,
                    image: file
                }));
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please upload an image file');
            }
        }
    };

    const handleImageDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setFormData(prev => ({
                    ...prev,
                    image: file
                }));
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please upload an image file');
            }
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setFormData(prev => ({
            ...prev,
            image: null
        }));
    };

    const handlePrivacyToggle = () => {
        setPrivacy((prev) => {
            const newPrivacy = !prev;

            // Update the publicity field in formData based on the new privacy value
            setFormData((formData) => ({
                ...formData,
                publicity: !newPrivacy, // Publicity is the opposite of privacy
            }));

            return newPrivacy; // Return the new privacy value
        });
    };

    const handleDescriptionChange = (content) => {
        setFormData(prev => ({
            ...prev,
            description: content
        }));
    };

    const handleCancel = () => {
        navigate(`/event/${eventId}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 font-['Poppins']">
                <NavPane />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-[80px] pb-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-['Poppins']">
            {/* Navigation Header */}
            <NavPane />

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-[80px] pb-8">
                {/* Header with responsive layout */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <h1 className="text-[24px] sm:text-[28px] font-semibold">Edit Event</h1>
                    <div className='flex items-center gap-4'>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">
                                {privacy ? 'Private' : 'Public'}
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={privacy}
                                    onChange={handlePrivacyToggle}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#569DBA]"></div>
                            </label>
                        </div>
                        <button
                            type='button'
                            onClick={handleCancel}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                {/* Responsive grid layout that adapts to screen size */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Event Form - Full width on mobile, appropriate size on larger screens */}
                    <form className="md:col-span-1 lg:col-span-5 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                placeholder="Enter title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                About this event
                            </label>
                            <textarea
                                name="summary"
                                value={formData.summary}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                placeholder="Enter summary"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start time
                                </label>

                                <input
                                    type="time"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    step="60"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                />

                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End time
                                </label>

                                <input
                                    type="time"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleChange}
                                    step="60"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                />

                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start date
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End date
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                placeholder="Enter location"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category
                                </label>
                                <select
                                    name="eventType"
                                    value={formData.eventType}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                                >
                                    <option value="">Select event type</option>
                                    <option value="tech">Tech</option>
                                    <option value="business">Business</option>
                                    <option value="game">Game</option>
                                    <option value="music">Music</option>
                                    <option value="sports">Sports</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Capacity
                                </label>
                                <input
                                    type="number"
                                    name="maxAttendees"
                                    value={formData.maxAttendees}
                                    onChange={handleChange}
                                    min="1"
                                    max="1000"
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 ${errors.maxAttendees
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    placeholder="Enter maximum attendees"
                                />
                                {errors.maxAttendees && (
                                    <p className="mt-1 text-sm text-red-500">{errors.maxAttendees}</p>
                                )}
                            </div>
                        </div>
                    </form>

                    {/* Middle Column: Description and Image Upload */}
                    <div className="md:col-span-1 lg:col-span-4 space-y-6">
                        {/* Description Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleDescriptionChange(e.target.value)}
                                placeholder="Enter event description"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                rows="10"
                            ></textarea>
                        </div>

                        {/* Upload Image Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event Image
                            </label>
                            <div
                                onClick={handleImageClick}
                                onDrop={handleImageDrop}
                                onDragOver={(e) => e.preventDefault()}
                                className="w-full h-[200px] md:h-[252px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400"
                            >
                                {imagePreview ? (
                                    <div className="relative w-full h-full">
                                        <img
                                            src={imagePreview}
                                            alt="Event preview"
                                            className="w-full h-full object-contain rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeImage();
                                            }}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <svg
                                            className="w-8 h-8 text-gray-400 mb-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                            />
                                        </svg>
                                        <p className="text-sm text-gray-500">Click to upload an image</p>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-4 sm:mt-8 pb-8 px-4">
                <button
                    type="submit"
                    className="w-full max-w-[350px] h-[46px] bg-[#569DBA] text-white rounded-full hover:bg-opacity-90 transition-colors text-lg font-regular"
                    onClick={handleSubmit}
                >
                    Update
                </button>
            </div>
        </div>
    );
};

export default EditEvent;
