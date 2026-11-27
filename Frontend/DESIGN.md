---
name: Empify
description: A private music library with a mixtape J-card visual language.
colors:
  ballpoint-blue: "#1E3A8A"
  deep-ballpoint-blue: "#172F6F"
  tdk-red: "#D32F2F"
  tdk-red-ink: "#8E2323"
  inlay-paper: "#FCFBF7"
  faded-blue-paper: "#EEF1F7"
  surface-white: "#FFFFFF"
  track-copy: "#344866"
  muted-copy: "#59697F"
  pencil-rule: "#A6A6A6"
typography:
  display:
    fontFamily: "Amatic SC, sans-serif"
    fontSize: "clamp(3rem, 4vw, 4rem)"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "0.025em"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
rounded:
  control: "3px"
  circular: "50%"
components:
  button-primary:
    backgroundColor: "{colors.ballpoint-blue}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.control}"
    padding: "0 17px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.deep-ballpoint-blue}"
  search-field:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.track-copy}"
    height: "43px"
---

# Design System: Empify

## Overview

**Creative North Star: "The J-Card Library"**

Empify borrows the human mark-making of a mixtape inlay card and applies it to
a private music library. Ballpoint blue carries structure and reading order;
warm inlay paper keeps the workspace light; TDK red is a compact catalog mark
for selection and playback. The interface stays a practical music tool rather
than imitating a storefront or a commercial streaming catalog.

Amatic SC gives page titles a hand-lettered voice. A native system sans-serif
keeps track metadata, forms, and controls fast to scan. Fine rules and clear
spacing organize the interface; surfaces stay flat instead of simulating
paper grain or cassette plastic.

**Key Characteristics:**
- Ballpoint-blue navigation and ink on warm inlay paper.
- Red marks reserved for selection, favorites, and playback progress.
- Hand-lettered display titles with workhorse sans-serif controls and metadata.
- Fine rules, square covers, and compact catalog numbering.

## Colors

The palette pairs the mixtape card's inlay white and ballpoint blue with a
small, high-contrast TDK-red signal.

### Primary
- **Ballpoint Blue** (#1E3A8A): Navigation rail, primary actions, headings, and
  player controls.
- **Deep Ballpoint Blue** (#172F6F): Hover state for primary actions.

### Secondary
- **TDK Red** (#D32F2F): Active navigation, favorite state, demo marker, and
  active-track progress.
- **TDK Red Ink** (#8E2323): Small red labels that need extra contrast.

### Neutral
- **Inlay Paper** (#FCFBF7): Main workspace ground.
- **Faded Blue Paper** (#EEF1F7): Quiet selected-row and placeholder surfaces.
- **Surface White** (#FFFFFF): Inputs and player surface.
- **Track Copy** (#344866): Supporting track and form text.
- **Muted Copy** (#59697F): Secondary labels and metadata.
- **Pencil Rule** (#A6A6A6): Strong table and form dividers.

### Named Rules
**The Red Catalog Mark Rule.** Red identifies a state or catalog mark; do not
use it as a large decorative field.

## Typography

**Display Font:** Amatic SC (self-hosted, with sans-serif fallback)  
**Body Font:** system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif  
**Label Font:** Body family; compact uppercase labels use increased tracking.

**Character:** The display voice is human and hand-lettered. The body voice is
neutral and utilitarian, so the expressive titles never slow down library work.

### Hierarchy
- **Display** (700, `clamp(3rem, 4vw, 4rem)`, 0.9 line-height): Uppercase page
  titles.
- **Body** (system weight, inherited size): Track names, artist and album
  metadata, form copy, and controls.
- **Label** (700–800, 0.55–0.68rem, tracked uppercase): Table headers, group
  labels, and catalog codes.

### Named Rules
**The One Hand-Lettered Voice Rule.** Use Amatic SC for page titles only.
Keep controls and track metadata in the body family.

## Layout

The desktop shell uses a fixed 228px navigation rail, a 64px top bar, and an
88px persistent player. Main content is capped at 1160px and scrolls above the
player. At 760px and below, the rail becomes a 61px bottom navigation; the
88px player stays below it, and content scrolls in the remaining viewport.
At 1050px, the desktop rail and player controls tighten. The library uses
56px desktop side padding, 28px tablet padding, and 18px mobile padding.

Keep controls and related metadata grouped closely, then separate the track
table with a clear rule. Hide album and play-count columns on narrower screens
before shrinking track names or action targets.

## Elevation & Depth

The system is flat by default and has no decorative shadows. Hierarchy comes
from the ballpoint-blue rail, warm paper ground, quieter blue surfaces, and
thin dividers. Focus uses a visible 3px TDK-red outline.

## Shapes

Most surfaces and cover artwork are square. Primary buttons use a 3px corner;
the central play control is circular. Prefer thin full borders and rules over
decorative side stripes or faux-printed effects.

## Components

### Buttons
- **Shape:** 3px corners for primary actions; circular play control.
- **Primary:** Ballpoint blue with white text, 44px minimum height, and 17px
  horizontal padding.
- **Hover / Focus:** Deep blue hover; 3px red focus outline with a 3px offset.
- **Secondary / Ghost:** Transparent or white surfaces with a pencil-gray
  border; blue text on hover.

### Chips
- **Style:** Demo state uses a small red dot and a plain-language label.
- **State:** Active or favorite state uses red; neutral state stays blue-gray.

### Cards / Containers
- **Corner Style:** Square.
- **Background:** Inlay paper or faded-blue paper.
- **Shadow Strategy:** None; separate content with rules.
- **Border:** Thin pencil-gray or pale-blue rule.

### Inputs / Fields
- **Style:** White surface with a one-pixel pencil-gray border and square
  corners.
- **Focus:** Blue border plus the global red focus outline.
- **Error / Disabled:** Errors use a pale red surface and dark-red text;
  disabled controls remain visibly muted.

### Navigation
- **Style:** Ballpoint-blue desktop rail with white labels and a full red
  active row. Mobile navigation is a fixed white bottom bar with blue active
  icon and label.

### Catalog Progress
- **Style:** A small catalog code and a thin red progress rule in the active
  track row, repeated by the player timeline.
- **Behavior:** The mark follows the current audio position and never replaces
  the standard player controls.

## Do's and Don'ts

### Do:
- **Do** keep Amatic SC to page titles and use the system sans-serif for
  controls and metadata.
- **Do** reserve TDK red for meaningful state and catalog marks.
- **Do** use thin rules and paper-toned surfaces to organize dense lists.
- **Do** keep the demo label visible anywhere synthetic library content is
  presented.

### Don't:
- **Don't** use TDK red as a large decorative field.
- **Don't** simulate paper fiber, cassette plastic, or ink texture with CSS.
- **Don't** add commercial-catalog language or artwork to the personal library.
- **Don't** hide track names or action controls to preserve desktop columns on
  mobile.
