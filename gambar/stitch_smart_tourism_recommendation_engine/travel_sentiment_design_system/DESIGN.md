---
name: Travel Sentiment Design System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#59413a'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#8d7168'
  outline-variant: '#e1bfb5'
  surface-tint: '#ac3400'
  primary: '#9b2f00'
  on-primary: '#ffffff'
  primary-container: '#c2410c'
  on-primary-container: '#ffece7'
  inverse-primary: '#ffb59d'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006058'
  on-tertiary: '#ffffff'
  tertiary-container: '#007b71'
  on-tertiary-container: '#b2fff3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59d'
  on-primary-fixed: '#390c00'
  on-primary-fixed-variant: '#832600'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-xl:
    fontFamily: notoSerif
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: notoSerif
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: notoSerif
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: plusJakartaSans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: plusJakartaSans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: spaceGrotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  data-point:
    fontFamily: spaceGrotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-margin: 32px
  gutter: 20px
---

## Brand & Style

This design system is built to bridge the gap between emotional human experience and cold data precision. It targets the "Intentional Traveler"—individuals who seek depth and authenticity rather than just popular landmarks. The brand personality is **sophisticated, insightful, and evocative.**

The visual style employs a **Modern Minimalist** foundation with **Glassmorphic** accents. It prioritizes content through high-quality, full-width photography that captures the "vibe" of a location, while using precise, data-driven overlays to communicate sentiment analysis and topic modeling. The interface should feel like a premium editorial magazine that has been enhanced with invisible intelligence. High contrast is used not just for accessibility, but as a stylistic choice to create a sense of luxury and clarity.

## Colors

The palette balances "Natural Earth" with "Digital Precision." 
- **Primary (Earthy Ochre):** Used for calls to action and highlighting key travel destinations, pulling directly from the warmth of natural landscapes.
- **Secondary (Midnight Slate):** Represents the tech and data aspect. Used for deep-contrast backgrounds, typography, and complex data visualizations.
- **Sentiment Tones:** A specialized sub-palette for topic modeling (Positive/Neutral/Negative) using refined, less-saturated versions of traffic light colors to maintain the premium feel.

Maintain high contrast by using Midnight Slate for text on light backgrounds and pure white for text on immersive imagery or dark cards.

## Typography

This design system uses a tri-font pairing strategy to differentiate between narrative, interface, and data:
1. **Noto Serif:** Used for large display titles and destination names. It evokes a timeless, literary, and premium travel feel.
2. **Plus Jakarta Sans:** The workhorse for body copy and general UI. It is approachable and highly readable, softening the edges of the technical data.
3. **Space Grotesk:** Reserved for "Tech/Data" elements—sentiment scores, topic tags, and metadata. Its geometric, slightly futuristic nature signals to the user that they are looking at analyzed data.

Always ensure a clear hierarchy where Serif headlines command the most attention, followed by functional sans-serif descriptions.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** with generous, editorial-style margins. 
- Use a 12-column grid for desktop and a 4-column grid for mobile. 
- **Immersive Imagery:** Primary destination headers should always be full-bleed (edge-to-edge) to create maximum emotional impact.
- **Negative Space:** Use "xl" spacing (80px) between major sections to allow the content to breathe, emphasizing the premium nature of the app.
- **Alignment:** Use a mix of centered typography for hero sections and left-aligned layouts for data-heavy sentiment breakdowns to maintain readability.

## Elevation & Depth

Depth is created through **Glassmorphism** and **Tonal Layering** rather than traditional heavy shadows.
- **Surface Layering:** Use semi-transparent white (80% opacity) with a 16px background blur for cards that sit on top of imagery. This allows the colors of the travel photos to bleed through while keeping text legible.
- **Ambient Shadows:** When shadows are necessary for buttons or floating action elements, use an extremely diffused (32px blur), low-opacity (8%) shadow tinted with the Secondary color (#0F172A).
- **Interactive Depth:** On hover, cards should subtly scale (1.02x) and increase their background blur intensity rather than simply getting darker.

## Shapes

The design system utilizes **Rounded** corners to feel modern and welcoming.
- **Standard Cards:** Use `rounded-lg` (1rem/16px) to create a soft, contained look for destination cards and sentiment panels.
- **Buttons & Chips:** Use `rounded-xl` (1.5rem/24px) or full pill-shapes for interactive elements to make them touch-friendly and distinct from content containers.
- **Image Containers:** Large hero images should remain sharp or have a very subtle `rounded-sm` (4px) to maintain a professional, architectural feel.

## Components

### Buttons
- **Primary:** Solid Ochre (#C2410C) with white text. High-contrast, bold, and pill-shaped.
- **Ghost:** Transparent background with a 1px border of the Secondary color. Used for secondary actions like "View Source" or "Read Reviews."

### Sentiment Chips
- Small, pill-shaped tags using the `data-point` type style. 
- Backgrounds should be very light tints of the sentiment colors (e.g., 10% opacity) with high-saturation text for readability.

### Recommendation Cards
- Features a full-width image background.
- Content (Destination name and Sentiment Score) is housed in a glassmorphic footer overlay at the bottom of the card.
- Incorporate a "Topic Cloud" component: small, subtle text tags that represent the most discussed features of a location (e.g., #quiet, #authentic, #vibrant).

### Sentiment Visualizers
- Use thin, elegant "Donut" charts or simple bar scales for topic modeling results.
- Avoid bulky charts; favor minimalist lines and the `label-caps` typography for axis titles.

### Input Fields
- Underlined style or very subtle light-grey fills. 
- Focus states should be indicated by a transition to the Primary Ochre color for the border.