# TarotLog — Technical Specification

## Project overview
TarotLog is a mobile-first tarot journaling app where users create entries containing a spread of cards and notes. Key features:
- Create and manage journal entries.
- Build visual spreads: drag & drop cards on a canvas/grid.
- Look up card meanings/artwork (card catalog) and attach them to placements.
- Save spreads + notes, support offline editing and background sync with a hosted backend.
- Authentication and per-user data separation.

Target platforms: iOS and Android using React Native (Expo-managed where possible).

---

## Chosen stack (proposed)
Frontend
- React Native (Expo) — fast iteration and cross-platform capability.
- Expo SDK + EAS for native builds when needed.
- React Navigation for app navigation.
- Zustand for local UI state and ephemeral state.
- Reanimated 2 + react-native-gesture-handler for gestures and drag-and-drop.
- react-native-draggable-flatlist or custom pan/gesture + Reanimated for spread builder.

Backend
- Supabase (hosted Postgres + Auth + Storage + Realtime) as the main backend.
- Supabase client libraries on the app to read/write user data and file storage.

Local/offline
- Local persistence via SQLite (Expo SQLite) as the canonical offline store.
- Consider WatermelonDB (SQLite-backed) or Realm if project complexity requires advanced queries and performance. For an Expo-managed app, SQLite (with a small sync layer) is the least friction path.

Why this stack
- Supabase gives GitHub-style Postgres, Auth, Storage, and realtime updates with minimal server code.
- Expo speeds iteration; EAS lets us add native deps later (e.g., Reanimated, fast-image) with manageable overhead.
- Zustand is simple and performant for local state; complex persisted lists are kept in the local DB.

---

## High-level architecture
1. App UI (React Native + Zustand) interacts with local DB (SQLite).  
2. Local DB is the offline cache and source for the UI.  
3. Sync layer syncs local changes to Supabase Postgres and pulls remote changes.  
4. Supabase Storage hosts card images and attachments; the app caches downloads locally.

Diagram (text):

[React Native UI] <-> [Zustand (ephemeral state)] <-> [Local SQLite DB] <-> [Sync Engine] <-> [Supabase Postgres & Storage]

Auth: Supabase Auth (OAuth, email/password). Each user has their own journals and spreads stored in the DB; access controlled by Supabase RLS (Row Level Security).

---

## Data model (Postgres)
Below are the basic tables. Use UUIDs and timestamps. Supabase uses Postgres SQL.

Users (managed by Supabase Auth; reference with `auth.uid()` in RLS)

Journals (a top-level grouping, optional)
- id uuid primary key
- user_id uuid references auth.users
- title text
- created_at timestamptz
- updated_at timestamptz

Entries (journal entries)
- id uuid primary key
- user_id uuid (owner)
- journal_id uuid nullable
- title text
- notes text
- created_at timestamptz
- updated_at timestamptz
- last_synced_at timestamptz (optional)

Spreads (a saved spread layout attached to an entry)
- id uuid primary key
- entry_id uuid references entries.id
- name text (optional)
- metadata jsonb (layout metadata: canvas size, grid size, background)
- created_at, updated_at

SpreadCards (cards placed in a spread)
- id uuid primary key
- spread_id uuid
- card_catalog_id uuid -- reference to the catalog of tarot cards
- position jsonb -- {x, y} or gridRow/gridCol and rotation/scale
- order integer (z-index)
- flipped boolean (if card is reversed)
- notes text (card-specific note)
- created_at, updated_at

CardCatalog (one row per tarot card)
- id uuid primary key
- name text
- keywords text[]
- meaning_short text
- meaning_long text
- image_path text (Supabase Storage path) or external URL
- metadata jsonb (suits, numbers, archetypes)

Attachments (images/audio attached to entries)
- id uuid
- entry_id uuid
- storage_path text
- mime text
- size int
- created_at

Indexes: index by user_id, entry_id, and updated_at for efficient sync.

---

## Local DB schema (SQLite)
Mirror the Postgres tables with the same columns; store timestamps as ISO strings or epoch ints. Important: store a `dirty` flag and `last_modified` timestamp per row for sync.

Example local table fields for `entries`:
- id TEXT PRIMARY KEY
- user_id TEXT
- title TEXT
- notes TEXT
- created_at TEXT
- updated_at TEXT
- last_modified INTEGER -- epoch ms
- dirty INTEGER -- 0/1 (true if local change not pushed)

Same for `spread_cards`, `spreads`, and `card_catalog`.

---

## Sync strategy (push/pull)
Goal: reliable, simple syncing that handles offline edits.

1. Each row has `last_modified` and `sync_status` (clean/dirty/conflict).  
2. On network available, background job:
   - Push: send local dirty rows to Supabase via client calls (or PostgREST endpoints). On success, clear dirty flag and update `last_modified` with server timestamp.
   - Pull: query Supabase for rows with `updated_at > last_pulled_at` for the current user and upsert into SQLite.
3. Conflict resolution: last-write-wins by default, using timestamps; for more safety, present merge UI for entries/spreads when a conflict is detected (e.g., concurrent edits to the same entry on multiple devices).
4. Use batched uploads for attachments (images) and store `storage_path` (or signed URL) in the row after upload.

Supabase notes: use RLS policies to ensure users can only READ/WRITE their rows; enable `updated_at` triggers to keep server timestamps.

---

## Authentication
- Use Supabase Auth (magic links, email/password).  
- On login, fetch user metadata and user-specific card catalog subset.  
- Secure Supabase keys: put only anon keys in the mobile app (as Supabase expects). Use RLS to secure rows.

---

## Spread builder UI and interactions
Core UX:
- A canvas where cards can be placed freely or snapped to a grid.
- Card library (bottom sheet) to pick a card and drag onto canvas.
- Drag to reposition, pinch to scale, rotate gestures (optional), long-press to show card options (flip, delete, add note).
- Tap a placed card to view card details (meaning, image) and add a per-card note.
- Save spread into an entry; the spread (positions, rotations, flipped states) persist.

Implementation details:
- Use `react-native-gesture-handler` + Reanimated to implement fluid drag/pinch/rotate.
- For lists of cards, `react-native-draggable-flatlist` is a quick off-the-shelf option; for a free-form canvas, use PanGestureHandler + Reanimated.
- Persist position as normalized coordinates (0..1 relative to canvas width/height) so the layout is resolution independent.

Accessibility: ensure gestures have alternatives (long-press context menu) and provide readable labels for cards.

---

## Card lookup
- Store a `card_catalog` table in Supabase with the full card data and image paths.
- Provide a search UI (local-first) that queries local catalog (SQLite) for instant results and falls back to Supabase if needed.
- Cache catalog updates during sync; the catalog is fairly static (78 cards) so syncing is lightweight.

Card images
- Place images in Supabase Storage (organized by card id). Use public (or signed) URLs, and cache in app.
- Use a performant image component; with Expo consider `expo-fast-image` equivalent or `expo-image`/`Image` API. For high performance in bare workflow, `react-native-fast-image` is a good choice.

---

## Attachments & media
- Upload attachments (photos of spreads) to Supabase Storage and link by `storage_path` in `attachments`.
- For large media, upload using resumable or chunked approach if needed; start with direct upload.
- Keep a local thumbnail cache to show entries offline.

---

## UI component breakdown
- App shell & navigation (React Navigation)
- Auth screens (login / register)
- Journal list / Entry list
- Entry editor (title, notes, attachments)
- Spread builder (canvas, card library, drag/drop)
- Card detail modal (meaning, keywords, flip)
- Settings (sync controls, backup/export)

---

## Libraries & npm packages (recommended)
- expo
- react-native
- @react-navigation/native, @react-navigation/stack
- zustand
- @supabase/supabase-js (JS client)
- expo-sqlite (local DB) or WatermelonDB / Realm (optional)
- react-native-gesture-handler
- react-native-reanimated
- react-native-draggable-flatlist (for list-based drags)
- react-native-svg (if you need vector card graphics or overlays)
- axios or fetch (networking fallback)
- jest & @testing-library/react-native (testing)

Notes: some packages require native builds (Reanimated, native FastImage). With Expo managed workflow you'll use EAS Builds to add them.

---

## Contracts (2–4 bullets each)
Spread save API (client -> server)
- Input: spread object { id, entry_id, metadata, cards: [{card_catalog_id, position, flipped, notes, order}], last_modified }
- Output: success + authoritative updated_at timestamp or conflict info.
- Errors: validation errors, auth error, storage full.

Card lookup API
- Input: optional search term & filters
- Output: list of card records with id, name, meaning_short, image_url

---

## Edge cases and considerations
- Offline edits on multiple devices -> conflicts. Start with last-write-wins; add conflict UI later for important fields.
- Large attachments -> watch device storage and network. Offer optional low-res compression before upload.
- Users with many entries -> paginate and index queries by updated_at.
- Data export -> provide an export (JSON + media) feature.

---

## Testing & CI
- Unit tests: Jest for reducers, small logic components (Zustand selectors, sync logic).
- Component tests: @testing-library/react-native for key UI.
- E2E: Detox or Playwright + device farm for critical flows (create entry, place cards, save, sync).
- CI: GitHub Actions to run lint, tests, and optionally build with EAS for preview.

---

## Deployment, hosting & cost
- Supabase free tier is sufficient for early development and up to moderate usage. Monitor storage (images) costs.
- Expo with EAS: free to start; EAS builds may require a paid plan for priority features.

---

## Security & privacy
- Use Supabase RLS to ensure each user only sees their data.
- Encrypt/safeguard any locally stored sensitive data (notes) if required.
- Provide data export & delete options for GDPR/CCPA compliance.

---

## Roadmap & milestones (suggested)
1. MVP: Expo app with auth, create entry, simple spread builder (drag in cards from library), save locally. (2-4 weeks)
2. Sync: implement SQLite local persistence and push/pull sync with Supabase. (1-2 weeks)
3. Media & storage: add image attachments and Supabase Storage upload. (1 week)
4. Polish: card detail, search, export, conflict resolution UI, tests. (2-4 weeks)

---

## Next steps (how I can help now)
- I can scaffold an Expo app with the basic folder structure and example screens (auth + spread builder prototype).
- Or I can implement the data model SQL for Supabase and an initial seed of the `card_catalog` (78 cards) entries.
- Or I can help you pick the exact local DB (SQLite + WatermelonDB vs Realm) based on whether you need complex queries and performance.

Tell me which of the next steps you'd like me to take and I'll create the code scaffold or SQL as the next task.

---

## Appendix: Example POSTGRES table SQL (starter)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  journal_id uuid,
  title text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE spreads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id uuid REFERENCES entries(id) ON DELETE CASCADE,
  name text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE spread_cards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  spread_id uuid REFERENCES spreads(id) ON DELETE CASCADE,
  card_catalog_id uuid,
  position jsonb,
  order_index integer,
  flipped boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE card_catalog (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text,
  keywords text[],
  meaning_short text,
  meaning_long text,
  image_path text,
  metadata jsonb
);

-- Add RLS policies per Supabase docs restricting rows to auth.uid() = user_id

---

End of tech spec.
