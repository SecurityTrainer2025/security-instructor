# SECURITY INSTRUCTOR — Course Statistics API

Persistent statistics for the public course pages.

Tracks, per course:
- Views
- Course entries
- Positive ratings (4 or 5 stars)
- Average rating
- Rating count

The API stores the values in MongoDB and exposes only the three course slugs used by the PPTX materials:
- traffic-management-vehicle-control
- crowd-management-event-security
- fire-safety-emergency-response

## Deploy
Set `MONGODB_URI` and `FRONTEND_URL`, then run `npm install` and `npm start` on a Node.js host such as Render or Railway.

After deployment, put the API base URL in `frontend/config.js` as `window.APP_CONFIG={API_BASE:'https://YOUR-API-URL'};`.
