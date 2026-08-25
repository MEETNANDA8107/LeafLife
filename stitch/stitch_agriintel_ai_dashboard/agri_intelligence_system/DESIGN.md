---
name: Agri-Intelligence System
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#414844'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#3f6653'
  primary: '#012d1d'
  on-primary: '#ffffff'
  primary-container: '#1b4332'
  on-primary-container: '#86af99'
  inverse-primary: '#a5d0b9'
  secondary: '#7a5649'
  on-secondary: '#ffffff'
  secondary-container: '#fdcdbc'
  on-secondary-container: '#795548'
  tertiary: '#002842'
  on-tertiary: '#ffffff'
  tertiary-container: '#003f63'
  on-tertiary-container: '#59adef'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1ecd4'
  primary-fixed-dim: '#a5d0b9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#274e3d'
  secondary-fixed: '#ffdbcf'
  secondary-fixed-dim: '#ebbcac'
  on-secondary-fixed: '#2e150b'
  on-secondary-fixed-variant: '#603f33'
  tertiary-fixed: '#cde5ff'
  tertiary-fixed-dim: '#94ccff'
  on-tertiary-fixed: '#001d32'
  on-tertiary-fixed-variant: '#004b74'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The design system is centered on the persona of an **Intelligent Agricultural Assistant**. It bridges the gap between traditional farming wisdom and cutting-edge data science. The brand personality is rooted in reliability, foresight, and natural stewardship.

The visual style follows a **Modern Corporate** aesthetic with **Tactile** influences. It avoids the coldness of typical SaaS by utilizing organic color palettes and soft-edged geometry, ensuring the interface feels grounded and "of the earth" while maintaining the precision required for data-driven decision-making. High-quality whitespace and clear visual hierarchies convey a sense of calm and clarity amidst complex agricultural datasets.

## Colors

This design system utilizes a palette inspired by a thriving ecosystem:

*   **Primary (Deep Earthy Green):** Used for main navigation, primary actions, and branding. It represents stability and growth.
*   **Secondary (Fertile Brown):** Used for structural accents, categorizing soil-related data, and providing a warm, grounded contrast to the green.
*   **Tertiary (Sky Blue):** Specifically reserved for weather patterns, water management indicators, and secondary informational highlights.
*   **Accent (Sun Gold):** Used sparingly for market highlights, high-priority alerts, and "Harvest-Ready" status indicators.
*   **Neutral (High-Contrast Grays):** Backgrounds use a very light "Seedling Gray" to keep the interface feeling airy, while text uses deep charcoal for maximum legibility.

## Typography

The design system employs **Inter** for its exceptional legibility and systematic character. The hierarchy is designed for "glanceability"—farmers in the field need to digest complex information quickly under varying light conditions.

- **Headlines:** Use tighter letter spacing and heavier weights to anchor sections.
- **Body:** Standardized at 16px to ensure readability for a broad demographic.
- **Labels:** Small caps or medium weights are used for data descriptors to distinguish metadata from content.

## Layout & Spacing

The system follows a **12-column fluid grid** for desktop and a **4-column grid** for mobile. The layout philosophy emphasizes "Spacious Information Density"—maximizing data visibility without causing cognitive overload.

- **Grid:** Use a 24px gutter to provide significant breathing room between data cards.
- **Margins:** Desktop views should maintain generous 48px margins to focus the user's eye on the central dashboard content.
- **Rhythm:** All spacing must be a multiple of the 4px base unit. Vertical rhythm should prioritize 24px (md) gaps between unrelated sections and 16px (sm) gaps between related elements.

## Elevation & Depth

Depth is used purposefully to separate the "field" (the background) from the "tools" (the UI elements).

- **Surface Layers:** The background is a flat neutral. Primary data containers use a white surface with a "Subtle Earth Shadow"—a soft, diffused drop shadow (Y: 4, Blur: 12) with a tiny hint of the primary green color in the shadow's tint to maintain warmth.
- **Interaction:** Hover states on cards should increase elevation (Y: 8, Blur: 20) and slightly shift the border color to the primary green.
- **Modals:** Use a heavy backdrop blur (20px) to maintain context of the farm map or data behind the active task.

## Shapes

The shape language reflects organic growth but with professional precision. All main UI containers (cards, modals) utilize a **16px (rounded-xl)** corner radius. 

- **Buttons & Inputs:** Use **12px (rounded-lg)** to provide a slightly more structured look for interactive components.
- **Status Indicators:** Chips and badges use **Pill-shaped** rounding for maximum contrast against rectangular data cards.

## Components

### Buttons
- **Primary:** Solid Primary Green background, white text. 12px border radius. Heavy focus on high-contrast iconography.
- **Secondary:** Transparent background with a 1px Primary Green border.
- **Tertiary/Ghost:** No border, Primary Green text, used for less critical actions like "Cancel" or "View Less."

### Farmer-Friendly Cards
The core of the system. Cards feature a 16px radius, a subtle 1px border (#E9ECEF), and a soft shadow. They should include a clear header area for a "Field Name" or "Metric Title" and a dedicated footer for "Last Updated" timestamps.

### Inputs & Selects
Large tap targets (minimum 48px height) for ease of use in outdoor conditions. Labels are always visible above the field, never hidden as placeholders.

### Data Visualization
Charts should use a custom-tined palette derived from the brand colors:
- **Success/Growth:** Primary Green.
- **Warnings:** Accent Gold.
- **Critical/Alerts:** A muted Terracotta (extension of Secondary Brown).
- **Moisture/Weather:** Tertiary Blue.

### Chips & Status Badges
Used for crop types or field health status. Use a semi-transparent version of the status color as a background with solid text in the same hue for a premium, integrated look.