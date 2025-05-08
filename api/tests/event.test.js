import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import Participation from '../models/Participation.js';


dotenv.config();

// Test user IDs (existing in database)
const EXISTING_USER_ID = '6807c62835296727bebadf03';
const OTHER_USER_ID = '6810aae74e3362e0fbe744c4';
const NONEXISTENT_ID = new mongoose.Types.ObjectId();

// Array to track resources created during tests
const createdEventsIds = [];
const createdParticipationIds = [];
const createdNotificationIds = [];

// Authentication helper function
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1d' }
  );
};

// Function to create unique event data for each test
const generateUniqueEventData = (index = 0) => {
  // Create unique dates to avoid scheduling conflicts
  // Each test will use a different month to absolutely avoid conflicts
  const month = 1 + (index % 12);
  const day = 10 + (index % 20);
  
  return {
    title: `Test Event ${Date.now()}-${index}`,
    description: 'Event description for API testing',
    summary: 'Event summary for testing',
    startTime: '10:00',
    endTime: '12:00',
    startDate: `2024-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`,
    endDate: `2024-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`,
    location: 'Test Location',
    eventType: 'tech',
    maxAttendees: 50,
    publicity: true,
    organizer: EXISTING_USER_ID,
    image: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg'
  };
};

describe('Event API Functionality Tests', () => {
  beforeAll(async () => {
    // Connect to database
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to database for tests');
  });

  afterAll(async () => {
    // Close connection
    await mongoose.connection.close();
    
    // Ensure connections are fully closed
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  // 1. CREATE - Event creation tests
  describe('Event Creation', () => {
    it('successfully creates event with valid data', async () => {
      const token = generateToken(EXISTING_USER_ID);
      const eventData = generateUniqueEventData(1);
      
      // Create an actual image file (download from URL or use a test image)
      const imageUrl = 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg';
      
      // Use form-data for the request
      const response = await request(app)
        .post('/api/events')
        .set('Cookie', [`token=${token}`])
        .field('title', eventData.title)
        .field('description', eventData.description)
        .field('summary', eventData.summary)
        .field('startTime', eventData.startTime)
        .field('endTime', eventData.endTime)
        .field('startDate', eventData.startDate)
        .field('endDate', eventData.endDate)
        .field('location', eventData.location)
        .field('eventType', eventData.eventType)
        .field('maxAttendees', eventData.maxAttendees.toString())
        .field('publicity', eventData.publicity.toString())
        .field('organizer', eventData.organizer)
        .field('image', imageUrl); // Use image URL instead of file upload
      
      // Log any errors
      if (response.status !== 201) {
        console.log('Event creation error:', response.body);
      }
      
      expect(response.status).toBe(201);
      
      // Save ID for cleanup
      createdEventsIds.push(response.body._id);
      
      // Verify response contents
      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(eventData.title);
      expect(response.body.description).toBe(eventData.description);
    }, 15000);

    it('requires authentication to create events', async () => {
      const eventData = generateUniqueEventData(2);
      
      await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(401);
    });

    it('validates required fields', async () => {
      const token = generateToken(EXISTING_USER_ID);
      
      await request(app)
        .post('/api/events')
        .set('Cookie', [`token=${token}`])
        .field('title', 'Incomplete Event Data')
        .expect(400);
    });
  });

  // 2. READ - Event retrieval tests
  describe('Event Retrieval', () => {
    let testEvent;
    
    beforeAll(async () => {
      // Create a test event to retrieve
      const eventData = generateUniqueEventData(3);
      testEvent = await Event.create(eventData);
      createdEventsIds.push(testEvent._id);
    });
    
    it('retrieves all events', async () => {
      const token = generateToken(EXISTING_USER_ID);
      
      const res = await request(app)
        .get('/api/events')
        .set('Cookie', [`token=${token}`])
        .expect(200);
      
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
    
    it('retrieves a specific event by ID', async () => {
      const token = generateToken(EXISTING_USER_ID);
      
      const res = await request(app)
        .get(`/api/events/${testEvent._id}`)
        .set('Cookie', [`token=${token}`])
        .expect(200);
      
      expect(res.body).toHaveProperty('_id', testEvent._id.toString());
      expect(res.body).toHaveProperty('title', testEvent.title);
    });
    
    it('returns 404 for non-existent event ID', async () => {
      const token = generateToken(EXISTING_USER_ID);
      
      await request(app)
        .get(`/api/events/${NONEXISTENT_ID}`)
        .set('Cookie', [`token=${token}`])
        .expect(404);
    });
  });

  // 3. UPDATE - Event update tests
  describe('Event Update', () => {
    let updateTestEvent;
    
    beforeEach(async () => {
      // Create a fresh test event for each update test
      const eventData = generateUniqueEventData(4);
      updateTestEvent = await Event.create(eventData);
      createdEventsIds.push(updateTestEvent._id);
    });
    
    it('updates an event when authenticated as organizer', async () => {
      const token = generateToken(EXISTING_USER_ID);
      
      const updateData = {
        title: `Updated Event ${Date.now()}`,
        description: 'Updated description'
      };
      
      const res = await request(app)
        .put(`/api/events/${updateTestEvent._id}`)
        .set('Cookie', [`token=${token}`])
        .send(updateData)
        .expect(200);
      
      expect(res.body).toHaveProperty('title', updateData.title);
      expect(res.body).toHaveProperty('description', updateData.description);
    });
    
    it('returns 404 when updating non-existent event', async () => {
      const token = generateToken(EXISTING_USER_ID);
      
      await request(app)
        .put(`/api/events/${NONEXISTENT_ID}`)
        .set('Cookie', [`token=${token}`])
        .send({ title: 'New Title' })
        .expect(404);
    });
  });

  // 4. DELETE - Event deletion tests
  describe('Event Deletion', () => {
    it('deletes an event when authenticated as organizer', async () => {
      const token = generateToken(EXISTING_USER_ID);
      
      // Create event to delete
      const eventData = generateUniqueEventData(5);
      const event = await Event.create(eventData);
      createdEventsIds.push(event._id);
      
      const res = await request(app)
        .delete(`/api/events/${event._id}`)
        .set('Cookie', [`token=${token}`])
        .expect(200);
      
      expect(res.body).toHaveProperty('message', 'Event deleted successfully');
      
      // Verify event was actually deleted
      const deletedEvent = await Event.findById(event._id);
      expect(deletedEvent).toBeNull();
    });
    
    it('returns 404 when deleting non-existent event', async () => {
      const token = generateToken(EXISTING_USER_ID);
      
      await request(app)
        .delete(`/api/events/${NONEXISTENT_ID}`)
        .set('Cookie', [`token=${token}`])
        .expect(404);
    });
  });

  // 5. SPECIAL FEATURES - Test special event functionalities
  describe('Special Event Features', () => {
    it('supports multi-day events', async () => {
      const token = generateToken(EXISTING_USER_ID);
      const eventData = generateUniqueEventData(6);
      
      // Update for multi-day
      eventData.startDate = '2025-06-01';
      eventData.endDate = '2025-06-05';
      
      // Use form-data with image URL
      const response = await request(app)
        .post('/api/events')
        .set('Cookie', [`token=${token}`])
        .field('title', eventData.title)
        .field('description', eventData.description)
        .field('summary', eventData.summary)
        .field('startTime', eventData.startTime)
        .field('endTime', eventData.endTime)
        .field('startDate', eventData.startDate)
        .field('endDate', eventData.endDate)
        .field('location', eventData.location)
        .field('eventType', eventData.eventType)
        .field('maxAttendees', eventData.maxAttendees.toString())
        .field('publicity', eventData.publicity.toString())
        .field('organizer', eventData.organizer)
        .field('image', eventData.image);
      
      if (response.status !== 201) {
        console.log('Multi-day event creation error:', response.body);
      }
      
      expect(response.status).toBe(201);
      
      createdEventsIds.push(response.body._id);
      
      expect(response.body).toHaveProperty('startDate', '2024-06-01');
      expect(response.body).toHaveProperty('endDate', '2024-06-05');
    });
    
    it('supports private events', async () => {
      const token = generateToken(EXISTING_USER_ID);
      const eventData = generateUniqueEventData(7);
      
      // Set to private
      eventData.publicity = false;
      
      // Use form-data with image URL
      const response = await request(app)
        .post('/api/events')
        .set('Cookie', [`token=${token}`])
        .field('title', eventData.title)
        .field('description', eventData.description)
        .field('summary', eventData.summary)
        .field('startTime', eventData.startTime)
        .field('endTime', eventData.endTime)
        .field('startDate', eventData.startDate)
        .field('endDate', eventData.endDate)
        .field('location', eventData.location)
        .field('eventType', eventData.eventType)
        .field('maxAttendees', eventData.maxAttendees.toString())
        .field('publicity', 'false')
        .field('organizer', eventData.organizer)
        .field('image', eventData.image);
      
      if (response.status !== 201) {
        console.log('Private event creation error:', response.body);
      }
      
      expect(response.status).toBe(201);
      
      createdEventsIds.push(response.body._id);
      
      expect(response.body).toHaveProperty('publicity', false);
    });
  });

  // 6. JOIN REQUESTS - Test join request functionality
  describe('Event Join Requests', () => {
    it('allows users to request joining events', async () => {
      const token = generateToken(EXISTING_USER_ID);
      
      // Create event by another user
      const eventData = generateUniqueEventData(8);
      eventData.organizer = OTHER_USER_ID;
      const event = await Event.create(eventData);
      createdEventsIds.push(event._id);
      
      // Send join request with a message
      const response = await request(app)
        .post(`/api/events/${event._id}/request-join`)
        .set('Cookie', [`token=${token}`])
        .send({ message: 'I would like to join this event' });
      
      if (response.status !== 201) {
        console.log('Join request error:', response.body);
      }
      
      expect(response.status).toBe(201);
      
      // If successful, store the participation ID for cleanup
      if (response.body._id) {
        createdParticipationIds.push(response.body._id);
      }
      
      expect(response.body).toHaveProperty('status', 'pending');
      expect(response.body).toHaveProperty('message', 'Join request sent successfully');
      
      // Verify notification was created
      const notifications = await Notification.find({ 
        userId: OTHER_USER_ID,
        type: 'joinRequest'
      });
      
      expect(notifications.length).toBeGreaterThan(0);
      
      // Save notification IDs for cleanup
      notifications.forEach(notification => {
        createdNotificationIds.push(notification._id);
      });
    });
    
    it('handles join request approval', async () => {
      const organizerToken = generateToken(OTHER_USER_ID);
      const requesterToken = generateToken(EXISTING_USER_ID);
      
      // 1. Create an event
      const eventData = generateUniqueEventData(9);
      eventData.organizer = OTHER_USER_ID;
      const event = await Event.create(eventData);
      createdEventsIds.push(event._id);
      
      // 2. Send join request
      const requestResponse = await request(app)
        .post(`/api/events/${event._id}/request-join`)
        .set('Cookie', [`token=${requesterToken}`])
        .send({ message: 'Please let me join this event' })
        .expect(201);
      
      const requestId = requestResponse.body._id;
      createdParticipationIds.push(requestId);
      
      // 3. Approve the request
      const approvalResponse = await request(app)
        .put(`/api/events/${event._id}/requests/${requestId}`)
        .set('Cookie', [`token=${organizerToken}`])
        .send({ action: 'approve' })
        .expect(200);
      
      expect(approvalResponse.body).toHaveProperty('status', 'approved');
      
      // 4. Verify notification was created for the requester
      const notifications = await Notification.find({ 
        userId: EXISTING_USER_ID,
        type: 'requestApproved'
      });
      
      expect(notifications.length).toBeGreaterThan(0);
      
      // Save notification IDs for cleanup
      notifications.forEach(notification => {
        createdNotificationIds.push(notification._id);
      });
    });
    
    it('handles join request rejection', async () => {
      const organizerToken = generateToken(OTHER_USER_ID);
      const requesterToken = generateToken(EXISTING_USER_ID);
      
      // 1. Create an event
      const eventData = generateUniqueEventData(10);
      eventData.organizer = OTHER_USER_ID;
      const event = await Event.create(eventData);
      createdEventsIds.push(event._id);
      
      // 2. Send join request
      const requestResponse = await request(app)
        .post(`/api/events/${event._id}/request-join`)
        .set('Cookie', [`token=${requesterToken}`])
        .send({ message: 'I would like to attend' })
        .expect(201);
      
      const requestId = requestResponse.body._id;
      createdParticipationIds.push(requestId);
      
      // 3. Decline the request
      const rejectionResponse = await request(app)
        .put(`/api/events/${event._id}/requests/${requestId}`)
        .set('Cookie', [`token=${organizerToken}`])
        .send({ action: 'decline' })
        .expect(200);
      
      expect(rejectionResponse.body).toHaveProperty('status', 'rejected');
      
      // 4. Verify notification was created for the requester
      const notifications = await Notification.find({ 
        userId: EXISTING_USER_ID,
        type: 'requestDeclined'
      });
      
      expect(notifications.length).toBeGreaterThan(0);
      
      // Save notification IDs for cleanup
      notifications.forEach(notification => {
        createdNotificationIds.push(notification._id);
      });
    });
  });
});