# RANAHINSIGHT Design System

This document outlines the visual identity and interaction rules for the RANAHINSIGHT application, pivoting to a **Modern Minimalist & Joy Vibes** aesthetic.

## 1. Brand Register & Tone
- **Category**: Product UI with strong Brand Elements.
- **Tone**: Playful, Airy, Bright, Welcoming, and Joyful.
- **Scene**: "A traveler enthusiastically booking a trip to West Sumatra on a sunny afternoon from a bright, airy cafe."

## 2. Logo & Visual Identity
The RANAHINSIGHT logo is the foundation of our brand, blending cultural heritage with advanced technology.

- **Symbol Elements**:
  - **Rumah Gadang**: Represents the deep cultural roots and tourism of West Sumatra.
  - **Mountain & Sun**: Depicts the beautiful natural landscapes and outdoor adventures.
  - **Data Trend Line (Nodes)**: Symbolizes "AI Tourism Intelligence" — data-driven insights, recommendations, and analytics.
- **Tagline**: "AI TOURISM INTELLIGENCE SUMATERA BARAT". Always use the tagline for horizontal and full-logo applications to reinforce the platform's core value.
- **Color Usage**: The logo predominantly uses the **Tropical Orange** gradient to convey energy, warmth, and joy.

## 3. Color Strategy
**Strategy: Committed (Light Mode)**
The UI relies on generous whitespace, high-contrast dark text, and vibrant accent colors to convey joy and energy without overwhelming the user.

- **Primary Accent**: Tropical Orange (`#FF7B54`) - Represents the sun, warmth, and joy. Used for primary CTAs and active states.
- **Secondary Accent**: Ocean Blue (`#2D82B5`) - Represents the Mentawai seas and clear skies. Used for secondary buttons, links, and informational states.
- **Background**: Soft White (`#FFFFFF`) to `Slate-50` (`#F8FAFC`). Generous whitespace is critical.
- **Surface**: `White` with very subtle borders (`slate-200`) or exceptionally soft, diffuse shadows. Glassmorphism is strictly forbidden.
- **Text (High Emphasis)**: `Slate-900` (`#0F172A`). Never pure `#000`.
- **Text (Low Emphasis)**: `Slate-500` (`#64748B`) to `Slate-600` (`#475569`).

## 4. Typography
- **Font Family**: **Plus Jakarta Sans** (Primary for both Headings and Body). It provides excellent geometric clarity with a friendly, humanist touch.
- **Headings**: High contrast in weight (Bold/ExtraBold) combined with tight tracking (`tracking-tight`).
- **Body**: Generous line height (1.6 - 1.75) for readability. Cap line length at 65-75ch.

## 5. Components & Layout
- **Auth Tunnel (Login/Register)**: Split-screen layout. 50% for the functional minimal form on a pure white background, 50% for an edge-to-edge vibrant, high-quality photograph of West Sumatra tourism.
- **Inputs**: Solid backgrounds (`bg-slate-50`), clearly defined borders (`border-slate-200`), transitioning to a vibrant primary color border on focus. No floating labels inside glass.
- **Buttons**: Pill-shaped (`rounded-full`) or highly rounded corners (`rounded-xl`). They should feature a subtle hover lift (`hover:-translate-y-0.5 hover:shadow-lg`) and a quick active scale-down (`active:scale-95`).
- **Cards**: Flat design. Rely on `border-slate-200` rather than heavy drop shadows. If shadows are used, they must be large, diffuse, and low opacity (e.g., `shadow-xl shadow-slate-200/50`).

## 6. Anti-Patterns (BANNED)
- ❌ **Glassmorphism**: Do not use blur backgrounds or semi-transparent white/black cards. They reduce contrast and feel generic.
- ❌ **Dark Mode Default**: This is a joyful holiday app. It defaults to, and heavily optimizes for, Light Mode.
- ❌ **Pure Black/White Texts**: Always tint neutrals.
- ❌ **Gradient Text**: Hard to read and feels dated. Use solid vibrant colors for emphasis.
- ❌ **Complex Navigation in Auth**: The login/register screens must remain focused (no distracting headers/footers).
