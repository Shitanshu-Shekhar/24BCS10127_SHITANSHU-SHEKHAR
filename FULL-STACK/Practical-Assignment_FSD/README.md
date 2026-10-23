# Campus Event Registration API

A Node.js, Express, and MongoDB REST API built for the Campus Event Registration practical assignment.

## Requirements
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection string

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and set `MONGODB_URI` if your database connection differs from the local default.

```bash
npm run dev
```

The API starts at `http://localhost:5000` by default. The root endpoint (`GET /`) returns a health message.

## Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/registrations` | Create a registration |
| GET | `/api/registrations` | List registrations |
| GET | `/api/registrations?eventType=ROBOTICS` | Filter by event type |
| GET | `/api/registrations?status=CONFIRMED` | Filter by status |
| GET | `/api/registrations/:id` | Get one registration |
| PUT | `/api/registrations/:id` | Update a registration |
| DELETE | `/api/registrations/:id` | Delete a registration |

## Sample create request

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

## Implemented rules
- Student name is trimmed and must be 3–50 characters.
- College email must end in `.edu` or `.ac.in`; emails are normalized to lowercase and unique.
- Roll number is normalized to uppercase and must be 8–10 alphanumeric characters.
- Supported events: `CODING_HACKATHON`, `AI_WORKSHOP`, `ROBOTICS`, `GAMING`.
- Team size must be an integer from 1 to 4; `AI_WORKSHOP` requires team size 1.
- Ticket price cannot be negative.
- `CAMPUS50` applies 50% off; `EARLYBIRD` subtracts 100 (floor 0); any other non-empty code is rejected.
- Status defaults to `PENDING`; allowed values are `PENDING`, `CONFIRMED`, and `CANCELLED`.
- Registration date defaults to the current time and cannot be in the future.
- Duplicate emails return `409`; validation errors return `400`; invalid IDs return `400`; missing records return `404`.
- PUT loads the document and calls `save()`, which executes schema validators on the updated document, including the event/team-size rule.

## Push to GitHub

1. Extract this ZIP file.
2. Open a terminal inside the extracted `campus-event-registration-api` folder.
3. Run `git init`, `git add .`, `git commit -m "Add campus event registration API"`.
4. Create an empty repository on GitHub, then follow GitHub's instructions to add the remote and push.

Do not commit your real `.env` file or database credentials.
