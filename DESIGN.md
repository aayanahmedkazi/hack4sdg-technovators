# MediFlow Design System (DESIGN.md)

This document defines the visual style, colors, typography, components, and UX rules for MediFlow. All screens, portals, and module components must follow these principles.

---

## 1. Core Principles

- **Calm and Minimalist**: Healthcare can be stressful. The UI must feel peaceful, airy, uncluttered, and trustworthy.
- **One Main Action Per Screen**: Every view focuses on one clear, primary task. Avoid secondary distractions.
- **Plain Words (No Medical Jargon)**: Especially on patient screens, use simple, friendly everyday language (e.g., "See your queue number" instead of "Triage outpatient status").
- **No Fluff**: No gradients, no heavy drop shadows, no distracting animations. Only subtle hover transitions.
- **Mobile Friendly**: Designed to fit comfortably on phones with large, easy-to-tap targets (minimum 44px height).

---

## 2. Color Palette

| Token | Hex Value | Role / Usage |
| :--- | :--- | :--- |
| **Background** | `#FFFFFF` | Main canvas, pure white for clean contrast |
| **Card / Surface** | `#F6F8F8` | Very light grey-tinted surface for cards & panels |
| **Border / Divider** | `#E2E8F0` | Subtle, clean 1px borders |
| **Accent Teal** | `#0B5D5E` | Primary buttons, active tabs, key highlights |
| **Teal Hover** | `#08494A` | Darker teal for button hover states |
| **Teal Light** | `#E6F2F2` | Subtle teal background tint for active badges |
| **Warning / Alert Coral**| `#F26B5B` | **Only** for urgent alerts, errors, and cancellation |
| **Coral Light** | `#FDF0EE` | Background for alert banners and warning badges |
| **Text Primary** | `#1E293B` | High-contrast dark charcoal for headings and body text |
| **Text Muted** | `#64748B` | Secondary labels, descriptions, and timestamps |

---

## 3. Typography & Layout

- **Font Family**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
- **Base Size**: 16px (`text-base`) for comfortable reading.
- **Headings**: Clearly larger and distinct:
  - `h1`: 28px - 32px (`text-2xl` to `text-3xl`), bold, tight line height.
  - `h2`: 20px - 24px (`text-xl` to `text-2xl`), semibold.
  - `h3`: 18px (`text-lg`), font-medium.
- **Max Width**: Centered content with a max width of **960px** (`max-w-[960px] mx-auto`).
- **Spacing**: Generous padding (`p-6` to `p-8` on cards, `py-8` on pages).
- **Corners**: Rounded corners across cards and buttons (`rounded-xl` or `rounded-2xl`).

---

## 4. Iconography

- **Library**: `lucide-react` (simple outline icons only).
- **Stroke Width**: `1.75` or `2` for clean, crisp outlines.
- **Size**: 18px to 24px for buttons/tabs; 32px to 40px for empty states.
- No colorful emoji icons or filled cartoon graphics.

---

## 5. Navigation & Layout Structure

1. **Top Bar**:
   - Left: "MediFlow" logo brand name.
   - Right: Current role badge (Patient, Receptionist, Doctor) and a "Logout" button.
2. **Sub-Nav Tabs**:
   - Placed directly under the top bar.
   - Clean horizontal tabs with teal accent line and text for active tab.
3. **Main Content**:
   - Max width `960px`, centered.
   - `PageHeader` at the top with clear title and optional single primary action button.
   - Cards container displaying the single focused workflow.

---

## 6. Shared Component Specifications

All portals and modules should import and use these shared components located in `src/shared`:

1. **`Button`**: Large, easy to tap (min 44px height), rounded corners, variants:
   - `primary`: Teal background (`#0B5D5E`), white text.
   - `secondary`: White background, border `#E2E8F0`, dark text.
   - `danger`: Coral background (`#F26B5B`), white text.
   - `ghost`: Transparent, hover tint.
2. **`Card`**: Background `#F6F8F8`, 1px border `#E2E8F0`, rounded corners, generous padding.
3. **`PageHeader`**: Clear page title, concise subtitle, optional primary action button.
4. **`Tabs`**: Clean tab navigation with teal underline indicator.
5. **`StatusBadge`**: Subtle pill badge for status (`default`, `teal`, `coral`, `warning`).
6. **`EmptyState`**: Minimalist icon, plain-language message, optional button.
