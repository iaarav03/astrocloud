# JyotishConnect

JyotishConnect is a comprehensive platform for astrological consultations and services. It offers real-time chat and call consultations with professional astrologers, personalized horoscopes and astrological reports, spiritual product purchases, and a rich library of educational content—all secured with JWT-based authentication.

---

## Base URL Prefix

All endpoints are prefixed with **`/api/v1`**. For example:  
```
http://localhost:7000/api/v1/
```

---

## Endpoints

### **Authentication Endpoints**

| Method | Endpoint                   | Access   | Description                                                         |
|--------|----------------------------|----------|---------------------------------------------------------------------|
| POST   | `/signup`                  | Public   | Register a new regular user                                         |
| POST   | `/signup/astrologer`       | Public   | Register a new astrologer user                                      |
| POST   | `/login`                   | Public   | Log in a user and obtain a JWT token                                |
| POST   | `/google`                  | Public   | Authenticate using Google credentials                               |
| GET    | `/signout`                 | Public   | Sign out by clearing the JWT cookie                                 |

---

### **User Endpoints**

*Requires a valid JWT token (handled via the `verifyToken` middleware).*

| Method | Endpoint              | Access          | Description                                    |
|--------|-----------------------|-----------------|------------------------------------------------|
| GET    | `/users/profile`      | Authenticated   | Retrieve own user details                      |
| PUT    | `/users/update`       | Authenticated   | Update own user details                        |
| DELETE | `/users/delete`       | Authenticated   | Delete own user account                        |
| GET    | `/users/users/search` | Admin Only      | Search across user profiles                    |
| GET    | `/users/users`        | Admin Only      | List all user profiles                         |
| GET    | `/users/users/:id`    | Admin Only      | Retrieve specific user details by ID           |
| DELETE | `/users/users/:id`    | Admin Only      | Delete a user profile by ID                    |

*Note: The admin endpoints are nested under `/users` with additional path segments to differentiate them.*

---

### **Astrologer Endpoints**

| Method | Endpoint                                         | Access                | Description                                                                  |
|--------|--------------------------------------------------|-----------------------|------------------------------------------------------------------------------|
| GET    | `/astrologers/filter-options`                    | Public                | Retrieve dynamic filtering options (languages, specializations, etc.)        |
| GET    | `/astrologers` or `/astrologers/list`            | Public                | Get a list of astrologers with filtering and pagination                      |
| GET    | `/astrologers/:id`                               | Public                | Get detailed profile of an astrologer                                        |
| GET    | `/astrologers/specializations/list`              | Public                | List all available specializations                                           |
| PUT    | `/astrologers/update/:astrologerId`              | Astrologer Protected  | Update own astrologer profile                                                |
| POST   | `/astrologers/specializations/create`            | Admin/Astrologer Only | Create a new specialization (Admin only) or add/update specialization (Astrologer) |
| DELETE | `/astrologers/specializations/:id`               | Admin Only            | Remove a specialization from the system                                      |

---

### **Review Endpoints**

| Method | Endpoint                                                  | Access         | Description                                                                  |
|--------|-----------------------------------------------------------|----------------|------------------------------------------------------------------------------|
| GET    | `/reviews/astrologer/:astrologerId`                       | Public         | Retrieve reviews for a specific astrologer (supports filters and pagination) |
| POST   | `/reviews/create`                                         | Authenticated  | Create a new review for an astrologer                                        |
| PATCH  | `/reviews/:reviewId/edit`                                 | Authenticated  | Edit an existing review (only allowed for the review creator)                |
| POST   | `/reviews/:reviewId/reply`                                | Authenticated  | Add a reply to a review (by the review owner or the astrologer)              |
| PATCH  | `/reviews/:reviewId/reply/:replyId/edit`                  | Authenticated  | Edit an existing reply (only allowed for the reply author)                   |
| PATCH  | `/reviews/:reviewId/helpful`                              | Authenticated  | Mark or unmark a review as helpful                                         |

---

### **Chat Endpoints**

*For real-time consultations and messaging, all chat endpoints require JWT verification.*

| Method | Endpoint                     | Access        | Description                                                        |
|--------|------------------------------|---------------|--------------------------------------------------------------------|
| GET    | `/chat/list`                 | Authenticated | Retrieve all chats for the logged-in user (or astrologer)          |
| GET    | `/chat/:chatId`              | Authenticated | Get messages from a specific chat                                  |
| DELETE | `/chat/:chatId`              | Authenticated | Delete a specific chat and its messages                            |
| POST   | `/chat/init`                 | Authenticated | Initialize a new chat session with user details                    |
| PUT    | `/chat/:chatId/read`         | Authenticated | Mark a chat as read                                                |

---

### **Horoscope (AstroCalculation) Endpoints**

| Method | Endpoint           | Access   | Description                                                             |
|--------|--------------------|----------|-------------------------------------------------------------------------|
| POST   | `/horoscope`       | Public   | Proxy request to the VedAstro API to retrieve horoscope predictions     |

---

## Additional Features and Services

### Consultation Services

- **Chat with Astrologer:** Real-time text consultations via the integrated chat system.
- **Talk to Astrologer:** Voice call consultations for personalized guidance.
- **Live Video Consultations:** Face-to-face sessions with astrologers for in-depth discussions.

### Astrological Reports and Tools

- **Free Kundli:** Generate personalized birth charts.
- **Kundli Matching:** Compatibility analysis for marriage prospects.
- **Horoscopes:** Daily, weekly, monthly, and yearly zodiac predictions.
- **Chinese Horoscope:** Detailed insights based on Chinese astrology.

### Additional Services

- **Book a Pooja:** Schedule and book religious ceremonies.
- **Astromall:** Purchase spiritual products including gemstones, rudraksha, and yantras.
- **Today Panchang:** Daily Panchang details with auspicious timings.

### Educational Content

- **Blog:** Articles and guides covering various astrological topics.
- **Free Live Astrology Sessions:** Interactive sessions for real-time astrological insights.
- **Personalized Notifications:** Alerts and updates on sessions, horoscopes, and special offers.

---

## Technologies Used

- **Backend:** Node.js, Express.js, and Socket.IO for real-time communication.
- **Database:** MongoDB for data storage.
- **Authentication:** JWT-based authentication with role-based access control.
- **AI Integration:** Uses external AI APIs (e.g., Google’s Gemini API for chat summaries) to enhance user experience.
- **Astro Calculation:** Integration with the VedAstro API for horoscope generation.

---

## Getting Started

1. **Repository:**

   ```bash
   cd JyotishConnect/server
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables:**

   Create a `.env` file in the root directory with the following (adjust values as needed):

   ```env
   PORT=7000
   MONGODB_URL="your_mongodb_connection_string"
   JWT_SECRET="your_jwt_secret"
   VEDASTRO_API_BASE_URL="http://localhost:3001"
   AI_API_KEY="your_ai_api_key"
   ```

4. **Run the Server:**

   ```bash
   npm start
   ```

   The server will be accessible at:  
   `http://localhost:7000/api/v1/`

---

## Socket.io Integration

Real-time functionalities are enabled using Socket.IO. The socket configuration supports:
- **Real-time Chat:** Join rooms, send/edit/delete messages, and manage typing indicators.
- **Call Functionality:** Initiate, answer, reject, or end calls between users.
- **AI-Driven Summaries:** Generate chat summaries using integrated AI services.

---
