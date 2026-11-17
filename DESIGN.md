---
name: TinyClone
description: Workbench monochrome for a 253-tool file catalogue, with one accent per file family
colors:
  paper: "#f7f5f0"
  white: "#ffffff"
  bone: "#eeeae1"
  ink: "#14130f"
  ink-soft: "#211f19"
  grey: "#5f5c54"
  grey-light: "#8c887e"
  line: "#ddd8cc"
  accent-pdf: "#b03a2e"
  accent-image: "#2a6f97"
  accent-video: "#6a4c93"
  accent-write: "#9c6b16"
  accent-converter: "#24735f"
  accent-other: "#46566e"
typography:
  display:
    fontFamily: Archivo
    fontSize: clamp(2.75rem, 5.2vw, 4.3rem)
    fontWeight: "700"
    lineHeight: "0.96"
    letterSpacing: "-0.035em"
  headline:
    fontFamily: Archivo
    fontSize: clamp(2rem, 4.4vw, 3.4rem)
    fontWeight: "700"
    lineHeight: "1.05"
    letterSpacing: "-0.03em"
  section:
    fontFamily: Archivo
    fontSize: clamp(1.75rem, 2.6vw, 2.25rem)
    fontWeight: "700"
    lineHeight: "1.15"
    letterSpacing: "-0.03em"
  body:
    fontFamily: Archivo
    fontSize: 1rem
    fontWeight: "400"
    lineHeight: "1.6"
  lede:
    fontFamily: Archivo
    fontSize: 1.125rem
    fontWeight: "400"
    lineHeight: "1.6"
  label:
    fontFamily: Archivo
    fontSize: 0.75rem
    fontWeight: "600"
    letterSpacing: "0.08em"
    textTransform: uppercase
rounded:
  none: 0px
spacing:
  xs: 8px
  sm: 14px
  md: 22px
  lg: 34px
  xl: 56px
  section: clamp(40px, 5vw, 72px)
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    borderRadius: "{rounded.none}"
    padding: 14px 24px
  search-panel:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    borderRadius: "{rounded.none}"
    padding: 18px 20px 20px
  category-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    borderRadius: "{rounded.none}"
    padding: 20px 20px 18px
---

# Design System: TinyClone

## Overview

**Creative North Star: "The Workbench Lookbook"**

A working catalogue that carries itself like a well-set catalogue. The page opens with a statement
big enough to be read across a desk, and directly beside it the actual search field and drop target —
the promise and the tool in one viewport. Below that, six category cards each show how many tools
are ready and three named examples, so a visitor never has to guess what "Converters" means.

The tone is editorial, not decorative: one typeface, sharp corners, hairlines everywhere, and type
sized to be read rather than admired. Colour appears in exactly one role — a family accent per file
type, at low saturation, on rules, icons, tints and counts. Nothing else is coloured.

**Key Characteristics:**
- Paper ground (#f7f5f0) with a faint 26px document grid across the hero.
- Six family accents used as 3px rules, tinted plates, icons and counts — never as text colour on
  body copy.
- One typeface at two widths: condensed 62 for labels, 100 for headings.
- Every box is a rectangle separated by a 1px rule; the only shadow is on working surfaces.
- Body copy is 16px, labels 12px. Nothing ships below 12px.

## Colors

Warm paper, near-black ink, and one desaturated accent per file family. The base is deliberately
low-contrast so the accents read as information rather than decoration.

### Primary
- **Workbench Ink** (#14130f): all display type, primary buttons, the utility bar and the footer.
- **Paper** (#f7f5f0): the page ground. **White** (#ffffff): every panel, card and input surface.
  **Bone** (#eeeae1): the category band, hover fills, disabled controls.

### Accents (one per family, informational only)
- **PDF brick** (#b03a2e), **Image steel** (#2a6f97), **Video plum** (#6a4c93),
  **Write ochre** (#9c6b16), **Converter teal** (#24735f), **Utilities slate** (#46566e).
- Each accent appears as: a 3px rule on top of its category card, the stroke of its icon, a
  10% tint (`--tint`) behind icons and on feature plates, its status chip, and the card's link colour.
- Tint must be computed on the element that sets the accent (`--tint: color-mix(in srgb, var(--accent)
  10%, #fff)`), never inherited from `:root`, or every tint collapses to the root ink.

### Neutrals
- **Ink grey** (#5f5c54): all secondary copy. **Faint** (#8c887e): placeholders and meta only.
- **Hairline** (#ddd8cc): every divider. **Structural ink** (#2c2a24): dividers on black.

### Named Rules
**The Accent-Is-Information Rule.** A family accent marks which family something belongs to. It is
never used for emphasis, alerts, hover states or decoration, and never as body text.

## Typography

**Display & Body Font:** Archivo (self-hosted variable, `wdth` 62–125, `wght` 100–900)

**Character:** One neutral grotesque doing both jobs by width. At 62% it reads as shop labelling —
small, tracked, factual. At 100% and 700 weight with slight negative tracking it becomes a heading.
Navigation and buttons are set in normal case at 15px; only genuine labels are uppercase.

### Hierarchy
- **Display** (700, `clamp(2.75rem, 5.2vw, 4.3rem)`, 0.96, -0.035em): the home statement, two lines.
- **Headline** (700, `clamp(2rem, 4.4vw, 3.4rem)`, 1.05): page titles — Directory, tool names, 404.
- **Section** (700, `clamp(1.75rem, 2.6vw, 2.25rem)`, 1.15, -0.03em, sentence case): section heads.
- **Card title** (700, 1.5rem, 1.1, -0.025em): category names.
- **Body** (400, 1rem, 1.6): descriptions and panel copy, measure held to 44–60ch.
- **Lede** (400, 1.125rem, 1.6): the hero paragraph only.
- **Label** (600, 0.75rem, 0.08em, uppercase, `wdth` 62): chips, counts, spec cells, field labels.

### Named Rules
**The Readable Floor Rule.** Nothing ships below 12px, and no text on black sits below 75% white.
Labels may be condensed and tracked; navigation, buttons and links may not.

## Layout

Container is `min(1440px, 100% − 2 × gutter)`, gutter 18→56px. The masthead is a single flex row —
wordmark left, six categories beside it, black "All tools" button right — sticky at 72px tall. Below
920px the categories become a horizontally scrollable row inside the same sticky header, so every
category stays one tap away without a menu.

The hero is a two-column grid, copy left (1fr) and the 470px finder panel right; it collapses to one
column at 1100px with the finder capped at 640px. The category grid is 3 columns, 2 at 1100px, 1 at
640px. Index and tool lists are 2 columns above 1100px. Rhythm is 40–72px between sections.

## Elevation & Depth

Flat by rule, with one exception: a working surface may carry `0 1px 2px rgba(20,19,15,.05),
0 16px 36px -18px rgba(20,19,15,.24)`. That is the finder panel at rest, the category card on hover,
and the active step in a tool. Static content never lifts; hovering a card raises it 2px and colours
its border with its own accent.

Texture replaces gradient: the hero carries a 26×26px hairline grid, masked radially, plus two
whisper-thin colour washes (brick top-left, steel top-right) at 7–9% opacity. No other section is
textured.

## Shapes

Rectangles, radius 0, on every element. Icons are 1.5px stroke line drawings on a 24px grid inside a
40px square, tinted with the family accent. Arrows are 1px rules that grow on hover, not glyphs.

## Components

### Search panel (signature)
The hero's right column: a bordered white panel with a title row ("Find a tool" + "210 ready now"),
a 56px search box (magnifier, 17px field, black Search button), a Popular chip row, a dashed drop
row (36px icon tile, bold filename line, one line of explanation), a live count line and four result
rows. It is the product's only first-viewport demo and may not be replaced by a static field.

### Buttons
- **Primary:** ink fill, white 15px/600 text, 14px 24px padding, inverts to transparent with ink text
  and ink border on hover. Full width inside a work sheet.
- **Ghost:** transparent with ink border, inverts to ink fill.
- **Download:** ink fill at 0.875rem, inverts on hover.

### Category card
White card, 1px hairline, 3px accent rule across the top, 40px tinted icon tile, accent "N ready"
chip, 1.5rem name, one-line description, three example tools divided by hairlines, and an accent
"All N pdf tools" link. The name carries a stretched link so the whole card is clickable while the
examples stay independently clickable.

### Icons
Font Awesome solid glyphs, rendered as plain `<svg>` (never the context-based React wrapper, which
can't run in a server component) at 14px in list rows, 21px in category cards, 26px on a tool page,
54px on a feature plate. Each sits in an `.icon-tile`: tinted square, 1px accent border, sized 30/40/
56px. Glyphs come from `iconFor()` — keyword rules first (merge → layered squares, split → scissors,
compress → compress, sign → signature, qr → qr, pdf/csv/json → file glyphs), then the family glyph as
fallback. Planned tools always use the clock.

### Result preview
Every finished output is previewed before it is downloaded: images as a contained `<img>`, video and
audio with controls, PDF in a 440px iframe (`#view=FitH`), text/CSV/JSON/XML as the first 2,000
characters fetched from the signed URL. Other types get the file tile only. Under each preview sit
**Download**, **Open** (new tab) and **Copy link**; the sheet also offers **Download all**, **Start
over with another file** and a link to swap tools. Uploaded images show a 34px thumbnail in the file
list so the input is visible before the run.

### Chips
Bordered 1px hairline rectangles, 13px text, no radius; hover darkens the border and fills paper.
Used for popular searches and directory filters (the active filter keeps a 2px ink underline).

### Inputs
Underlined single-line fields (1px ink rule, 2px on focus) inside work sheets; boxed inputs only in
the search panel, where the box is the affordance. Textareas keep a hairline box.

### Navigation
Sentence-case 15px items with 9px 12px hit areas, bone hover fill. Wordmark 21px/700 with a 10px ink
square before it. The utility bar above carries the persistent facts at 12px/66% white.

## Do's and Don'ts

### Do:
- **Do** keep body at 16px and labels at 12px; set navigation and buttons in sentence case.
- **Do** compute tints on the element that owns the accent.
- **Do** sell a category with a count and three real, ready tool names.
- **Do** separate surfaces with 1px rules and keep radius at 0.
- **Do** reserve the lift shadow for the finder panel, hovered cards, and the active step.

### Don't:
- **Don't** colour body copy with a family accent.
- **Don't** use an accent to mean "error" or "success" — both live in the ink scale.
- **Don't** add a second typeface, emoji icons, or an eyebrow above a heading.
- **Don't** fill a plate with a gradient or stock photo; plates carry the format word in the
  family accent.
- **Don't** put a required interaction behind a menu on mobile — categories stay in the header row.
