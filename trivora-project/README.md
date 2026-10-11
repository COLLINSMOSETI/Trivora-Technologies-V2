# Trivora Technologies — Full-stack website

A responsive dark-blue technology-company website with scroll-triggered reveals, active section navigation, reading progress, a back-to-top control and an interactive FAQ, plus a separate Node.js/Express backend connected to MySQL. Includes a public project-enquiry form and a password-protected admin dashboard to review, update, and delete enquiries.

## Project layout

```text
trivora-project/
├── frontend/
│   ├── index.html        # Public company website
│   ├── styles.css        # Responsive dark/blue visual system
│   ├── app.js            # Navigation and API-connected contact form
│   ├── admin.html        # Admin login and dashboard UI
│   ├── admin.js          # Admin API interactions
│   └── assets/
│       └── trivora-tech-concept.png
└── backend/
    ├── .env.example
    ├── package.json
    ├── database/schema.sql
    └── src/
        ├── db.js
        ├── init-db.js
        ├── create-admin.js
        └── server.js
```

## Client-supplied brand imagery

The frontend uses the logo image supplied by the client in the header, footer, and admin sign-in page. The homepage hero uses the Westlands reception/office image supplied by the client, with the Trivora logo visible on the wall. A Nairobi skyline image cropped from the supplied company-profile artwork appears in the homepage feature banner. The About section uses a sharper high-resolution professional team-collaboration photo. Supplied logo and skyline/office images were upscaled and carefully sharpened for clearer high-DPI presentation. The original supplied PDF artwork and images are retained as client-provided source material outside the deployable frontend.

## Company details already added

- Brand: **Trivora Technologies**
- Email: `trivoratechnologies1@gmail.com`
- Phone: `0703502267`, `+254 116 918656`, `+254 112 061280`
- Website development: **from KSh 30,000** (final quote depends on requirements)

## Requirements

- Node.js 18 or newer
- MySQL 8.x or compatible MySQL/MariaDB server
- A browser

## 1. Create the MySQL database and database user

In MySQL, run commands similar to these (replace the password with a strong one):

```sql
CREATE DATABASE trivora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'trivora_user'@'localhost' IDENTIFIED BY 'YOUR_STRONG_DB_PASSWORD';
GRANT ALL PRIVILEGES ON trivora_db.* TO 'trivora_user'@'localhost';
FLUSH PRIVILEGES;
```

If your MySQL server uses a different host, configure the user and `DB_HOST` accordingly. Do not expose MySQL directly to the public internet.

## 2. Configure and initialize the backend

Open a terminal in `backend/`:

```bash
# Windows Command Prompt
copy .env.example .env
npm install
```

Edit `.env` and set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and a long random `JWT_SECRET`. For production, use a randomly generated secret of at least 32 characters and set `NODE_ENV=production`. Set `FRONTEND_ORIGIN` to the exact origin(s) that serve the frontend, separated by commas.

Then initialize the tables and starter services:

```bash
npm run db:init
```

The database initialization script connects using the configured database user. That user needs permission to create/use the database when running the included schema; alternatively, create the database first and run `database/schema.sql` with a database administrator.

Create the first admin account interactively:

```bash
npm run admin:create
```

Use a strong password and keep it private. The password is stored as a bcrypt hash, not plain text. Do not put admin credentials in frontend files.

Start the API:

```bash
npm run dev
# or: npm start
```

The API should respond at `http://localhost:5000/api/health` with a status and database connection confirmation.

## 3. Run the frontend

Serve the `frontend/` folder using a local static server rather than opening the HTML as a `file://` URL. For example, if you have VS Code, install/use the Live Server extension and open `frontend/index.html`; it commonly serves on `http://127.0.0.1:5500`.

Make sure that exact frontend origin appears in `FRONTEND_ORIGIN` in `backend/.env`, then restart the API. The frontend defaults to `http://localhost:5000/api`. If your backend is hosted elsewhere, add this before the relevant frontend scripts in `index.html` and `admin.html`, replacing the URL with your API address:

```html
<script>window.TRIVORA_API_BASE = 'https://your-api-domain.example/api';</script>
```

Use the same API base in both pages. Deploy frontend and backend with HTTPS in production.

## Admin dashboard

Visit `http://127.0.0.1:5500/admin.html`, sign in with the account created by `npm run admin:create`, and review enquiries. Admins can change statuses (`New`, `In progress`, `Contacted`, `Completed`, `Archived`) or delete records. The admin token is kept in `sessionStorage` for the current browser tab/session and expires according to `JWT_EXPIRES_IN`.

## API endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | API and database health check |
| GET | `/api/services` | Public | Read active services from MySQL |
| POST | `/api/inquiries` | Public, rate-limited | Validate and store an enquiry |
| POST | `/api/auth/login` | Public, rate-limited | Admin login and JWT issue |
| GET | `/api/admin/inquiries` | Admin JWT | List up to 500 recent enquiries |
| PATCH | `/api/admin/inquiries/:id` | Admin JWT | Update an enquiry status |
| DELETE | `/api/admin/inquiries/:id` | Admin JWT | Delete an enquiry |

## Email notifications (optional)

The contact form always stores valid submissions in MySQL. To also send an email notification when a new enquiry arrives, configure the SMTP variables in `.env` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `NOTIFY_EMAIL`, and `FROM_EMAIL`) with credentials from your email provider. Never commit SMTP passwords to version control. Email delivery is optional and a failed email notification does not discard the database enquiry.

## Before production launch

- Use HTTPS and configure the exact allowed frontend origins.
- Set strong unique MySQL and JWT credentials in your hosting provider's secret/environment settings.
- Use least-privilege database permissions and regular database backups.
- Configure SMTP if you want email alerts, and test delivery.
- Add a privacy policy and ensure your enquiry retention practices fit applicable privacy law.
- Test contact submission, admin login, status updates and deletion before announcing the site.
- The included portfolio visual is a concept illustration, not a claim that the pictured projects are completed client work.

## Interactive experience

- Scroll progress bar at the top of the viewport.
- Header styling changes as the visitor scrolls.
- Navigation highlights the section currently in view.
- Content cards reveal smoothly as they enter the viewport.
- FAQ accordion answers can be opened by click or keyboard.
- Back-to-top control appears after scrolling down.
- Reduced-motion preferences are respected.
