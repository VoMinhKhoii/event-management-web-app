import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NavPane from '../../components/NavPane.jsx';
import { useContext } from 'react';
import { AuthContext } from '../../context/authContext.jsx'; // adjust path if needed

const CreateEvent = () => {
  const navigate = useNavigate();

  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { currentUser } = useContext(AuthContext);
  const [errors, setErrors] = useState({});
  const [privacy, setPrivacy] = useState(true); // State for Privacy toggle
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    summary: '',
    startTime: '',
    endTime: '',
    startDate: '',
    endDate: '',
    location: null,
    eventType: '',
    image: null,
    maxAttendees: '',
    publicity: !privacy
  });

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

        const response = await fetch('http://localhost:8800/api/events', {
          method: 'POST',
          credentials: 'include',
          body: fd,
        });

        console.log(formData);

        if (!response.ok) {
          // If response is not in the 200-299 range
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create event');
        }

        const data = await response.json();
        console.log('Event created:', data);
        alert('Event created successfully!');
        // navigate(`/event/${data._id}`); // Redirect to the event page


      } catch (error) {
        console.error('Error creating event:', error.message);
        alert(error.message || 'Failed to create event');
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

  return (
    <div className="min-h-screen bg-gray-50 font-['Poppins']">
      {/* Navigation Header */}
      <NavPane />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-[80px] pb-8">
        {/* Header with responsive layout */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-[24px] sm:text-[28px] font-semibold">New Event</h1>
          {/* Privacy Toggle */}
          <div className="flex items-center space-x-2 self-end sm:self-auto">
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
        </div>

        {/* Responsive grid layout that adapts to screen size */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
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

          {/* Right Column: Invite Participants */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invite Participants
            </label>

            {privacy ? (
              // Public event - Show invitation form
              <div className="bg-[#569DBA] text-white p-4 md:p-6 rounded-lg">
                {/* Invite Form */}
                <form onSubmit={(e) => e.preventDefault()} className="mb-6">
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none text-black"
                  />
                  <button
                    type="submit"
                    className="w-full bg-white text-[#569DBA] py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    Send Invite
                  </button>
                </form>
              </div>
            ) : (
              // Private event - Show message
              <div className="bg-gray-100 text-gray-700 p-4 md:p-6 rounded-lg h-full min-h-[200px] flex items-center">
                <div className="flex flex-col items-center justify-center w-full">
                  <svg
                    className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <p className="text-center font-medium mb-2">Public Event</p>
                  <p className="text-center text-sm text-gray-500">
                    Invitations are disabled for Public events. Switch to private mode to enable invitations.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-4 sm:mt-8 pb-8 px-4">
        <button
          type="submit"
          className="w-full max-w-[350px] h-[46px] bg-[#569DBA] text-white rounded-full hover:bg-opacity-90 transition-colors text-lg font-regular"
          onClick={handleSubmit}
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default CreateEvent;
