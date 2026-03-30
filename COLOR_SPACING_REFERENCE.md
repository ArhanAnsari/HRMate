# 🎨 PREMIUM UI COLOR & SPACING QUICK REFERENCE

## COLOR PALETTE - Copy & Use!

### Primary Blue (Professional)

```
Primary:       #2563EB  ← Use this for main actions
Primary Dark:  #1E40AF  ← Dark mode, darker backgrounds
Primary Light: #DBEAFE  ← Light backgrounds, disabled states
```

### Status Colors

```
Success:       #10B981  (Green)  ← Positive, approved, ready
Warning:       #F59E0B  (Amber)  ← Caution, pending, attention
Danger:        #EF4444  (Red)    ← Error, critical, destructive
Info:          #06B6D4  (Cyan)   ← Informational, neutral
```

### Text Colors (Light Mode)

```
Text Primary:    #0F172A  (Slate-900)   ← Main text
Text Secondary:  #475569  (Slate-600)   ← Secondary text
Text Tertiary:   #94A3B8  (Slate-400)   ← Disabled, hint text
```

### Text Colors (Dark Mode)

```
Text Primary:    #F1F5F9  (Slate-100)   ← Main text
Text Secondary:  #CBD5E1  (Slate-300)   ← Secondary text
Text Tertiary:   #94A3B8  (Slate-400)   ← Disabled, hint text
```

### Backgrounds (Light Mode)

```
Main:      #FFFFFF  (White)      ← Primary background
Alt:       #F8FAFC  (Slate-50)   ← Secondary backgrounds
Tertiary:  #EFF6FF  (Blue-50)    ← Interactive backgrounds
```

### Backgrounds (Dark Mode)

```
Main:      #0F172A  (Slate-900)  ← Primary background
Alt:       #1E293B  (Slate-800)  ← Secondary backgrounds
Tertiary:  #334155  (Slate-700)  ← Interactive backgrounds
```

### Borders & Dividers

```
Border:   #E2E8F0  (Light)  / #334155  (Dark)
Divider:  #F1F5F9  (Light)  / #1E293B  (Dark)
```

### Shadows

```
Light Mode:
  Default:  rgba(15, 23, 42, 0.08)      ← Most elements
  Strong:   rgba(15, 23, 42, 0.12)      ← Interactive

Dark Mode:
  Default:  rgba(0, 0, 0, 0.3)          ← Most elements
  Strong:   rgba(0, 0, 0, 0.5)          ← Interactive
```

---

## TYPOGRAPHY SCALE

### Headings

```
H1: 32px / 700 / 40px line-height (Screen titles)
H2: 28px / 700 / 36px line-height (Section headers)
H3: 24px / 600 / 32px line-height (Card titles)
H4: 20px / 600 / 28px line-height (Subsections)
H5: 18px / 600 / 26px line-height (Labels)
H6: 16px / 600 / 24px line-height (Small titles)
```

### Body Text

```
Body:    16px / 400 / 24px line-height (Main text)
BodySm:  14px / 400 / 20px line-height (Secondary text)
BodyXs:  12px / 400 / 18px line-height (Captions)
```

### Special Text

```
Label:    14px / 500 / 20px line-height (Form labels)
LabelSm:  12px / 500 / 16px line-height (Small labels)
Caption:  12px / 500 / 16px line-height (Metadata)
```

---

## SPACING GRID (8pt System)

### Individual Values

```
xs:   4px    (Minor adjustments, icons, gaps)
sm:   8px    (Component spacing, padding)
md:   16px   (Card padding, component gaps)
lg:   24px   (Section padding, major gaps)
xl:   32px   (Large sections, main padding)
2xl:  48px   (Extra large sections)
3xl:  64px   (Screen-level spacing)
```

### Common Combinations

```
Card Padding:         16px (md)
Button Padding:       12px vertical / 16px horizontal
Button Large:         14px vertical / 20px horizontal
Input Padding:        12px horizontal / 10px vertical
Section Margin:       24px (lg)
Component Gap:        8px (sm)
Card Border Radius:   12px
Input Border Radius:  8px
Button Border Radius: 8px
FAB Size:             56px
Avatar Large:         56px
Icon Large:           32px
Icon Medium:          24px
Icon Small:           20px
Tab Bar Height:       64px
```

---

## COMPONENT SIZES

### Button Sizes

```
Small:  Height 36px  / Padding 8px horizontal
Medium: Height 44px  / Padding 24px horizontal   ← DEFAULT
Large:  Height 52px  / Padding 32px horizontal
```

### Input Height

```
All Inputs: 44px (standard mobile-friendly)
```

### Icon Sizes

```
xs: 16px  (Tiny)
sm: 20px  (Small)
md: 24px  (Standard)
lg: 32px  (Large)
xl: 48px  (Extra large)
```

### Avatar Sizes

```
xs: 24px  (Tiny)
sm: 32px  (Small)
md: 40px  (Medium)
lg: 56px  (Large)
xl: 80px  (Extra large)
```

### FAB

```
Size: 56x56px
Icon: 24px
Shadow: Elevation 8
Position: Bottom-right (16px from edges)
```

### Border Radius

```
xs:   4px
sm:   6px
md:   8px   ← Buttons, inputs
lg:   12px  ← Cards, modals, prominent elements
xl:   16px
full: 9999px (Circles, pills)
```

---

## SHADOW SYSTEM (Elevation Levels)

### Xs (Subtle - Small elements)

```
shadowOpacity: 0.08
shadowRadius: 2px
elevation: 1
```

### Sm (Light - Cards, buttons)

```
shadowOpacity: 0.08
shadowRadius: 4px
elevation: 2
```

### Md (Standard - Default cards) ← MOST COMMON

```
shadowOpacity: 0.08
shadowRadius: 6px
elevation: 4
```

### Lg (Strong - Interactive elements)

```
shadowOpacity: 0.1
shadowRadius: 12px
elevation: 8
```

### Xl (Very Strong - Modals, floating elements)

```
shadowOpacity: 0.1
shadowRadius: 16px
elevation: 12
```

---

## ANIMATION TIMINGS

```
Quick:      100ms   (Fast feedback)
Standard:   200ms   ← MOST COMMON (button press, fade)
Slow:       300ms   (Deliberate, modal entry)
Entrance:   400ms   (Screen transitions)
Exit:       200ms   (Exiting elements)
Hold:       3000ms  (Toast notification dwell time)
```

### Easing Functions

```
quick:       Instant
standard:    cubic-bezier(0.4, 0, 0.2, 1)
smooth:      cubic-bezier(0.25, 0.46, 0.45, 0.94)
ease-out:    cubic-bezier(0.4, 0, 0.2, 1)
ease-in:     cubic-bezier(0.6, 0.6, 0, 1)
spring:      Natural spring animation (iOS-style)
```

---

## COMPONENT VARIANTS

### Button Variants

```
Primary:   Blue gradient background, white text
Secondary: Transparent, blue border, blue text
Tertiary:  Transparent, black text, no border
Danger:    Red background, white text
```

### Status Badge Variants

```
Success:   Green background, darker green text
Warning:   Amber background, darker amber text
Danger:    Red background, darker red text
Info:      Cyan background, darker cyan text
```

### Card Styles

```
Default:     Soft shadow (md), 12px radius
Interactive: Light shadow (sm), press feedback
Highlight:   2px blue border, blue glow
Actionable:  Medium shadow (md), hover lift
```

---

## QUICK COPY-PASTE VALUES

### Import Theme

```typescript
import { THEME } from '@/src/theme';

// Use anywhere:
backgroundColor: THEME.colors.primary
fontSize: THEME.typography.h3.fontSize
padding: THEME.spacing.lg
borderRadius: THEME.borderRadius.lg
...THEME.shadows.md
```

### Common Styles

```typescript
// Card
{
  padding: THEME.spacing.md,
  borderRadius: THEME.borderRadius.lg,
  ...THEME.shadows.md,
}

// Button
{
  height: THEME.componentSizes.button.md.height,
  paddingHorizontal: THEME.spacing.lg,
  borderRadius: THEME.borderRadius.md,
  backgroundColor: THEME.colors.primary,
}

// Input
{
  height: THEME.componentSizes.input.height,
  paddingHorizontal: THEME.spacing.sm,
  borderRadius: THEME.borderRadius.md,
}

// Heading
{
  ...THEME.typography.h3,
  color: theme.text,
}

// Body Text
{
  ...THEME.typography.body,
  color: theme.textSecondary,
}
```

---

## DARK MODE REFERENCE

### When to use `isDark` check:

```
✅ Text colors (different in dark)
✅ Background colors (different in dark)
✅ Border colors (different in dark)
❌ Primary colors (SAME in both modes)
❌ Status colors (SAME in both modes)
```

### Correct Pattern:

```typescript
const isDark = colorScheme === 'dark';
const theme = isDark ? THEME.dark : THEME.light;

<View style={{
  backgroundColor: isDark
    ? THEME.dark.background
    : THEME.colors.background.main,
}}>
  <Text style={{ color: theme.text }}>
    Text that changes
  </Text>
</View>
```

---

## COLOR HEX REFERENCE

### All Colors in One Place

```
#2563EB  Primary Blue
#1E40AF  Primary Dark Blue
#DBEAFE  Primary Light Blue

#10B981  Success Green
#D1FAE5  Success Light

#F59E0B  Warning Amber
#FEF3C7  Warning Light

#EF4444  Danger Red
#FEE2E2  Danger Light

#06B6D4  Info Cyan
#CFFAFE  Info Light

#0F172A  Text Primary (Light)
#475569  Text Secondary (Light)
#94A3B8  Text Tertiary (Light)

#FFFFFF  Bg Main (Light)
#F8FAFC  Bg Alt (Light)
#EFF6FF  Bg Tertiary (Light)

#E2E8F0  Border (Light)
#F1F5F9  Divider (Light)

#F1F5F9  Text Primary (Dark)
#CBD5E1  Text Secondary (Dark)
#94A3B8  Text Tertiary (Dark)

#0F172A  Bg Main (Dark)
#1E293B  Bg Alt (Dark)
#334155  Bg Tertiary (Dark)

#334155  Border (Dark)
#1E293B  Divider (Dark)
```

---

## CHEAT SHEET - Most Used Values

```
Primary Action:     #2563EB (Blue primary)
Success Feedback:   #10B981 (Green)
Warning Alert:      #F59E0B (Amber)
Error Message:      #EF4444 (Red)

Main Text:          #0F172A (Light) / #F1F5F9 (Dark)
Secondary Text:     #475569 (Light) / #CBD5E1 (Dark)
Disabled Text:      #94A3B8 (Both modes)

Card Padding:       16px (md)
Section Padding:    24px (lg)
Button Height:      44px
Input Height:       44px
Icon Size:          24px
Avatar Size:        56px

Card Shadow:        md level
Button Click:       100ms animation + haptic
Modal Enter:        300ms + blur
Empty State:        24px icon + H4 title + body text
Loading:            Skeleton shimmer (2s loop)
```

---

## REFERENCE IMAGES

For visual reference, see:

- BEFORE_AFTER_COMPARISON.md (visual comparison)
- PREMIUM_REDESIGN_SYSTEM.md (detailed specs with examples)
- Component files in src/components/ui/ (implementation)

---

## DESIGNER'S FINAL REMINDERS

✅ **Always use THEME** - Never hardcode colors/spacing  
✅ **Consistent spacing** - Use grid multiples  
✅ **Dark mode** - Test every screen  
✅ **Touch targets** - 40x40px minimum  
✅ **Text contrast** - WCAG AA compliant  
✅ **Animations** - 60fps target  
✅ **Components** - Reuse before creating new

---

**This is your color & spacing bible. 📖**
Bookmark this file. Reference often. Build consistently.

Let's make HRMate the most beautiful HR SaaS! 🚀
