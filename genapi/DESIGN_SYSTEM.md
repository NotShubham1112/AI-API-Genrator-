# Frontend Design System

This document outlines the core design rules, color system, component usage, and layout guidelines for the entire project.

## Core Design Rules

- **Visual Style**: Clean, premium, professional, classic, minimal, and business-grade. Rich through spacing and structure, not effects.
- **Strictly Avoid**: Neon colors, glows, gradient backgrounds, glassmorphism, heavy shadows, animated flashy effects, over-rounded cartoon styles, fancy borders, excessive blur, and multi-color UI noise. Keep everything plain, sharp, elegant.

## Color System

Use solid colors only. No gradients anywhere.

- **Background**: `#191919`
- **Surface**: `#111111` or default card dark
- **Card**: Default shadcn card (`#111111`)
- **Text Primary**: `#FFFFFF`
- **Text Secondary**: Muted foreground
- **Accent Blue**: `#0057FF`
- **Border**: Subtle default border (`rgba(255, 255, 255, 0.1)`)
- **Optional Status Colors**: Green standard muted solid (Success), Amber muted solid (Warning), Red standard muted solid (Danger).

## Component Usage

Use **ONLY default shadcn/ui components** across the whole project. Do NOT customize shadcn component internals unless absolutely required for spacing or layout.

- **Allowed Components**: Button, Card, Input, Textarea, Select, Dialog, DropdownMenu, Table, Tabs, Badge, Tooltip, Alert, Skeleton, Sheet, Separator, Avatar, Switch, Checkbox, Progress.
- **Button Rules**: Primary actions use the default shadcn button style. Secondary use outline button. Danger uses destructive button. No glowing or gradient buttons.
- **Card Rules**: Use cards heavily for layout. Cards should feel structured, balanced, spacious, with clear hierarchy. Use `rounded-xl` max, subtle border, very soft shadow only if default. Never dramatic shadows.
- **Tables**: Use default shadcn tables. Simple rows, soft borders, subtle hover, clear spacing. No striped flashy tables.
- **Forms**: Inputs remain default shadcn. Labels above fields, proper spacing, full width fields, error text below field.

## Layout Rules

Use clean dashboard spacing.
- Large padding, clear sections, good whitespace, symmetry, consistent grid.
- **Desktop**: Sidebar + content
- **Mobile**: Drawer + stacked cards

## Typography

- Use default font.
- **Hierarchy**: Page titles (bold large), Section titles (medium), Labels (small muted), Body (clean readable).
- No decorative fonts.

## Animation Rules

Very light only: hover fade, dialog transitions, accordion transitions. No bouncing, no flashy motion.

## Page Design Standard

All pages must follow the same tone:
- **Dashboard**: serious analytics software
- **API Keys**: clean management panel
- **Usage Logs**: data console style
- **Models**: professional infra page
- **Generate**: premium AI workspace
- **Settings**: enterprise admin page

**Visual Reference**: Think Stripe internal dashboard, Linear admin panel, Vercel settings page, GitHub enterprise dashboard. NOT crypto website, gaming UI, or neon SaaS landing page.

## Important Implementation Rule

Use Tailwind **only** for spacing, grid, flex, width, margins, and responsive layout. Do NOT use Tailwind to restyle every component. Let shadcn defaults lead the design. The entire project must look timeless, plain, expensive, and trustworthy.
