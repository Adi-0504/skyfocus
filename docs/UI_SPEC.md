---
title: Skyfocus UI Specification
version: 1.0
priority: high
status: active
---

# Skyfocus UI Specification

## Purpose

Define the complete visual identity and interaction design of Skyfocus.

The goal is to create a premium native-app-like experience inspired by Apple's design philosophy.

Skyfocus should feel like a carefully designed App Store application.

It must NOT feel like:

- Generic website
- Dashboard
- Admin panel
- Template application

---

# Design Philosophy

Create:

"A premium native-app-like experience with Apple-inspired typography, spacing, hierarchy, and interaction design."

The experience should feel:

- Calm
- Elegant
- Refined
- Minimal
- Professional
- Comfortable


---

# Design Priority

When making UI decisions:

1. Visual quality
2. User experience
3. Consistency
4. Engineering convenience


Never sacrifice design quality for faster implementation.

---

# Color System

## Primary Background

Color:

#427692


Usage:

- Main application background
- Large visual areas


---

## Surface / Card Color

Color:

#F1EEDC


Usage:

- Cards
- Sheets
- Containers
- Group sections


---

## Primary Text

Color:

#475A61


Usage:

- Titles
- Body text
- Important information


---

# Color Rules

Do not use:

- Pure white backgrounds
- Random colors
- Excessive colors
- Unnecessary gradients


All colors must follow this design system.

---

# Typography

Use Apple-inspired system typography.

Primary fonts:

SF Pro Display

SF Pro Text


Traditional Chinese:

PingFang TC


Fallback:

system-ui

Noto Sans TC

sans-serif


Typography requirements:

- Clear hierarchy
- Comfortable spacing
- Easy reading
- Premium feeling


Do not use:

- Decorative fonts
- Gaming fonts
- Handwritten fonts

---

# Layout System

Skyfocus must be a full-screen application.

Primary target:

Mobile devices.


The interface should provide:

- Large breathing space
- Clear hierarchy
- Comfortable touch areas
- Natural scrolling


Avoid:

- Desktop website layout
- Sidebar navigation
- Dense information grids

---

# Corner Radius System

No sharp corners.

All components must use rounded corners.


Small elements:

12px


Cards:

20px


Large containers:

28px+


Apply rounded corners to:

- Cards
- Buttons
- Inputs
- Dialogs
- Sheets
- Navigation containers

---

# Icon System

Use:

Lucide Icons only.


Style:

Linear outline icons.


Requirements:

- Consistent stroke width
- Rounded line caps
- Rounded line joins


Forbidden:

- Emoji
- Unicode symbols
- Filled icons
- Random SVG icons
- Mixed icon libraries

---

# Navigation Design

Use a floating bottom navigation system.

Style:

- Rounded container
- Surface background
- Soft shadow
- Floating above content


Navigation items:

- Today
- Tasks
- Focus
- History
- Settings


Display:

Icons only.

No text labels.


Icons:

Today:
Calendar


Tasks:
ListTodo


Focus:
Timer


History:
ChartLine


Settings:
Settings


---

# Component Design

## Cards

Style:

Background:

#F1EEDC


Radius:

20px


Padding:

20px


Use for:

- Tasks
- Summaries
- Settings groups


---

## Buttons

Requirements:

- Rounded
- Comfortable touch size
- Clear feedback


Avoid:

- Sharp rectangular buttons


---

## Floating Action Button

Purpose:

Create actions.


Example:

Create task


Rules:

- Icon only
- Rounded
- Easy thumb reach
- Clear visual priority


---

# Interaction Design

Every interaction should provide feedback.

Include:

- Button press feedback
- Smooth transitions
- Loading feedback
- Completion feedback
- Modal transitions


Interactions should feel:

- Natural
- Smooth
- Responsive

---

# Animation System

Use:

GSAP


Animation style:

- Subtle
- Smooth
- Natural
- Premium


Required animations:

- Page transitions
- Card appearance
- Modal presentation
- Task completion


Avoid:

- Flashy effects
- Excessive movement
- Unnecessary animation

---

# Screen Design

## Login Screen

Purpose:

Simple and elegant entry.


Requirements:

- Full-screen layout
- Skyfocus identity
- Google login
- Email login


Avoid:

- Complex forms
- Excessive text

---

# Today Screen

Purpose:

Daily overview.


Include:

- Greeting
- User name
- Date
- Daily progress
- Today's tasks


Task cards include:

- Completion status
- Task title
- Time
- Priority


---

# Tasks Screen

Purpose:

Complete task management.


Include:

- Search
- Filter
- Task list
- Create action


---

# Task Detail Screen

Use:

Native-style sheet/modal.


Include:

- Title
- Notes
- Due date
- Due time
- Priority
- Reminder
- Subtasks
- Tags


Avoid:

Large web forms.

---

# Focus Screen

Purpose:

Deep concentration.


Prioritize:

- Large timer
- Current task
- Minimal distraction


Include:

- Start
- Pause
- Resume
- Complete


---

# History Screen

Include:

- Completed tasks
- Focus sessions
- Activity summary


Avoid:

Complex analytics dashboards.

---

# Settings Screen

Style:

Inspired by iOS Settings.


Include:

- Profile
- Account
- Language
- Notifications
- Preferences


---

# State Design

Every screen must include:

## Loading State

Use elegant skeleton/loading animation.


## Empty State

Include:

- Lucide icon
- Short explanation
- Clear action


## Error State

Include:

- Simple message
- Recovery action


---

# Responsive Rules

Mobile:

Primary experience.


Desktop/tablet:

Maintain native-app feeling.


Do not transform into:

- Dashboard
- Sidebar application
- Website layout


---

# UI Definition of Done

The UI is complete only when:

✓ Design system is followed

✓ No default browser styling remains

✓ No random colors exist

✓ No emoji icons exist

✓ Components are consistent

✓ Animations are polished

✓ Mobile experience feels native

✓ Application feels premium and intentional