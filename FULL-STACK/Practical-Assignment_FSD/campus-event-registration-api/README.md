# Campus Event Registration API

A complete Node.js + Express + MongoDB/Mongoose REST API for the Campus Event Registration assignment.

## Requirements
- Node.js 18 or newer
- MongoDB local server **or** a MongoDB Atlas connection string
- Visual Studio Code

## Run in VS Code
1. Extract this ZIP and open the `campus-event-registration-api` folder in VS Code.
2. Open **Terminal → New Terminal**.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy `.env.example` to a new file named `.env` and set `MONGODB_URI`.
   - Local MongoDB: `mongodb://127.0.0.1:27017/campus_event_registration`
   - Atlas: paste your own connection string (keep `.env` private).
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Visit `http://localhost:5000` or `http://localhost:5000/health`.

The server starts only after it successfully connects to MongoDB. If MongoDB is not running locally, use MongoDB Atlas or start your local MongoDB service.

## API endpoints
Base URL: `http://localhost:5000`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/registrations` | Create registration |
| GET | `/api/registrations` | List registrations |
| GET | `/api/registrations?eventType=ROBOTICS` | Filter by event |
| GET | `/api/registrations?status=CONFIRMED` | Filter by status |
| GET | `/api/registrations/:id` | Get one registration |
| PUT | `/api/registrations/:id` | Update registration |
| DELETE | `/api/registrations/:id` | Delete registration |

## Example POST body
```json
{
  "studentName": "Aarav Sharma",
  "collegeEmail": "aarav.cs24@institute.ac.in",
  "rollNumber": "24CSB102",
  "eventType": "CODING_HACKATHON",
  "teamSize": 3,
  "ticketPrice": 600,
  "discountCode": "CAMPUS50"
}
```
Expected `finalAmount`: `300`.

## Assignment rules implemented
- College email must end with `.edu` or `.ac.in`; duplicate email returns HTTP 409.
- Roll number is uppercase and 8–10 alphanumeric characters.
- Event values: `CODING_HACKATHON`, `AI_WORKSHOP`, `ROBOTICS`, `GAMING`.
- Team size must be an integer from 1 to 4; `AI_WORKSHOP` requires team size 1.
- `CAMPUS50` gives 50% off; `EARLYBIRD` takes 100 off (minimum final amount 0); other discount codes are rejected.
- `finalAmount` is recalculated when ticket price or discount code changes.
- Registration date defaults to now and cannot be in the future.
- Invalid Mongo IDs return HTTP 400; missing registrations return HTTP 404.
- PUT update validates the merged document and explicitly uses `runValidators: true`.

## Test with Postman
Import `Campus-Event-Registration.postman_collection.json` into Postman. Create a registration first, copy its `_id`, then set the collection variable `registrationId` to that ID before trying GET-by-ID, PUT, or DELETE.

## Notes
- `.env` and `node_modules` are excluded from Git by `.gitignore`.
- Do not commit database passwords or secrets.
- `npm test` runs the included lightweight model tests where applicable; database integration testing requires MongoDB.
