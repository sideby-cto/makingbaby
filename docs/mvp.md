# MVP Specification

## Audit of Existing Code

### Backend (`babymakin/app-master/src`)
- **Auth module** – NestJS module providing authentication services, JWT strategy, magic links, and email notifications.
- **User module** – User CRUD operations exported for other modules.
- **Dashboard module** – Aggregates stories and configuration data to drive metrics.
- **Story module** – Manages story creation, file uploads, and reactions.
- **Core utilities** – Base entity class, helper functions, and event definitions.
- **Shared types** – Reusable pagination utilities for list endpoints.

### Frontend (`babymakin/frontend-master/src`)
- **API layer** – Centralized HTTP client with query and mutation helpers.
- **Application services** – Dashboard and story logic such as filter transforms and story form builders.
- **Component library** – Reusable UI components, modals, inputs, and wrappers.
- **Design system** – Theme tokens and component primitives for consistent styling.
- **Hooks & contexts** – Custom hooks and React contexts for global state and data fetching.
- **Infrastructure** – Client-side storage, query client configuration, and global state helpers.

## MVP Features
1. **Authentication**
   - Login with email and magic links.
   - Issue and verify JWT tokens for API requests.
2. **User Management**
   - Register and edit users.
   - Associate users with districts, schools, and teams.
3. **Dashboard**
   - Display story metrics and trends.
   - Filter by goal, success sign, promising practice, characteristic, location, and date range.
4. **Stories**
   - Create, edit, and view stories with file attachments.
   - Tag users and categorize stories by type.
5. **Pagination & Sharing**
   - Paginated list endpoints using shared pagination input.
6. **Consistent UI**
   - Utilize design system and component library for responsive interface.

## Decisions
- Reuse existing backend modules (Auth, User, Dashboard, Story) to accelerate development.
- Leverage frontend API layer, hooks, and design system for rapid UI construction.
- Maintain pagination and filtering conventions across modules for a cohesive experience.
- Centralize state management through provided contexts and infrastructure utilities.
