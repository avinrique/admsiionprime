# Predictor Backend

Backend API and dashboard for the College Rank Predictor leads.

## Deployment on Vercel

1. **Push to GitHub**
   ```bash
   cd predictor-backend
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/predictor-backend.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Deploy (Vercel auto-detects the configuration)

3. **Set up Vercel KV (Redis) Storage**
   - In Vercel Dashboard, go to your project
   - Click "Storage" tab
   - Create a new KV Database
   - Link it to your project
   - The environment variables are automatically set

4. **Update Frontend**
   - After deployment, copy your Vercel URL (e.g., `https://predictor-backend.vercel.app`)
   - Update `API_URL` in `collegerankpredictor/script.js`:
     ```javascript
     const API_URL = "https://your-backend.vercel.app/api/leads";
     ```

## API Endpoints

### POST /api/leads
Save a new lead.

**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "state": "Karnataka",
  "exam": "JEE Main",
  "inputType": "marks",
  "inputValue": 250,
  "totalMarks": 300,
  "category": "OPEN",
  "branch": "Computer Science",
  "predictedRank": { "best": 5000, "worst": 8000 }
}
```

### GET /api/leads
Get all leads (sorted by most recent first).

## Dashboard

Access the dashboard at your Vercel URL root (e.g., `https://predictor-backend.vercel.app/`)

Features:
- View all leads
- Search by name, phone, email, state, exam
- Export to CSV
- Today's leads count

## Local Development

```bash
npm install
vercel dev
```

Access at http://localhost:3000
# admissionprime
