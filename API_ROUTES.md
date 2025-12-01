# API Routes Documentation

The application now supports the following routes:

## Routes

### 1. Main Page
**Route:** `/`

Shows the main page with the CVE search interface, including the header with Vulnx logo and light/dark theme toggle.

**Example:**
```
https://your-domain.com/
```

---

### 2. CVE Detail Page
**Route:** `/{CVEID}`

Displays a comprehensive detail page for a specific CVE by fetching data from the ProjectDiscovery API. The page includes all vulnerability information such as CVSS score, severity, description, affected products, weaknesses, PoC links, references, and more.

**Features:**
- Fetches CVE data from the API using the CVE ID
- Displays complete vulnerability information
- Shows loading state while fetching data
- Handles errors gracefully (404, rate limits, etc.)
- Updates browser tab title with CVE ID and name
- Uses stored API key from localStorage if available
- Clickable from the CVE ID column in the main search results table

**Example:**
```
https://your-domain.com/CVE-2023-1234
https://your-domain.com/CVE-2024-5678
```

**Parameters:**
- `CVEID` - The CVE identifier (e.g., CVE-2023-1234)

**Displayed Information:**
- CVE ID, name, and description
- CVSS score and severity badge
- Impact, remediation, and requirements
- Vendor, product, and vulnerability type
- Published and updated dates
- Age in days
- Security attributes (patch available, exploit seen, remote, auth, template)
- Attack vector (CVSS metrics)
- Weaknesses (CWE)
- Proof of Concept URLs
- References (limited to first 5)
- Nuclei template link (if applicable)

---

### 3. Search with Query Parameter
**Route:** `/?q={base64}`

Loads the main page with a pre-populated search query and automatically triggers the search. The query parameter `q` should contain a base64-encoded search string. This allows you to share direct links to specific searches.

**Features:**
- Automatically decodes the base64 query parameter
- Pre-populates the search input field
- Auto-triggers the search on page load
- URL is updated when performing a search from the UI

**Example:**
```
https://your-domain.com/?q=cHJvZHVjdD1teXNxbA==
```

**Parameters:**
- `q` - Base64-encoded search query

**How to create a shareable search link:**

1. Encode your search query to base64:
   ```javascript
   const query = "product=mysql";
   const encoded = btoa(query);
   console.log(encoded); // cHJvZHVjdD1teXNxbA==
   ```

2. Append to the URL:
   ```
   /?q=cHJvZHVjdD1teXNxbA==
   ```

**Note:** When you enter a search query in the UI and click "Search", the URL is automatically updated with the base64-encoded query. You can then copy the URL from your browser to share the search with others.

---

## Shared Components

### Header
All pages include a consistent header with:
- **Vulnx** logo (clickable, returns to home)
- Light/Dark theme toggle
- Responsive design
- Theme preference stored in localStorage

The header component is located at `src/components/header.tsx` and is shared across all routes.

### Footer
All pages include a consistent footer with:
- Link to ProjectDiscovery Vulnerability API
- Link to GitHub repository
- Responsive design

The footer component is located at `src/components/footer.tsx` and is shared across all routes.

---

## Implementation Details

### File Structure
```
src/
├── app/
│   ├── [cveId]/
│   │   └── page.tsx          # Dynamic CVE detail route (client component)
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Main page wrapper (with Suspense)
│   └── home.tsx               # Main page implementation (client component)
├── components/
│   ├── header.tsx             # Shared header component
│   ├── footer.tsx             # Shared footer component
│   ├── cve-columns.tsx        # Table column definitions with clickable CVE IDs
│   ├── data-table.tsx         # Reusable data table component
│   └── ui/                    # UI components (shadcn/ui)
└── models/
    └── CVERecord.ts           # CVE data model
```

### Technologies Used
- **Next.js 16** with App Router
- **React 19**
- **TypeScript**
- **ProjectDiscovery Vulnerability API** for CVE data
- Dynamic routing with `[cveId]` folder structure
- URL search params with `useSearchParams` hook
- Base64 encoding/decoding for shareable search links
- Client-side API fetching with loading and error states
- localStorage for API key storage and theme persistence

### Key Features
- **Shareable Search Links**: Search queries are encoded in the URL for easy sharing
- **Clickable CVE IDs**: Each CVE ID in the search results table is a link with an external link icon
- **Dynamic CVE Pages**: Individual CVE pages fetch and display complete vulnerability details
- **Theme Toggle**: Light/dark mode with preference persistence
- **API Key Support**: Optional API key configuration for higher rate limits
- **Responsive Design**: Mobile-friendly interface
- **Error Handling**: Graceful error messages for API failures, rate limits, and 404s
