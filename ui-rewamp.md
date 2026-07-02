# CynexCloud Frontend Rewrite Master Plan
## Complete Frontend Rebuild using shadcn/ui

> **Status:** Planned
>
> **Type:** Complete Rewrite
>
> **Scope:** Frontend Only
>
> **Backend Changes:** None
>
> **Database Changes:** None

---

# Overview

This project is **NOT** a redesign.

This project is **NOT** a refactor.

This project is **NOT** an improvement of the existing frontend.

The existing frontend should be considered **legacy**.

It must **NOT** be used as the foundation for the new application.

The frontend will be **rebuilt completely from scratch** using the official **shadcn/ui** design system while keeping the existing backend, APIs, routing, authentication logic, and business logic intact.

---

# Objectives

Build a frontend that feels comparable to enterprise SaaS products such as:

- Vercel
- GitHub
- Stripe
- Railway
- Linear
- Airlink

The interface must be:

- Clean
- Modern
- Minimal
- Professional
- Fast
- Accessible
- Responsive

---

# Design Rules

## Keep

- Existing brand colors
- Existing backend
- Existing APIs
- Existing authentication
- Existing routes
- Existing payment logic
- Existing business logic

## Remove

- Legacy layouts
- Legacy pages
- Legacy components
- Legacy CSS
- Legacy Tailwind utilities
- Legacy navigation
- Legacy forms
- Legacy cards
- Legacy tables

Nothing from the previous UI should remain except backend communication.

---

# Technology Stack

## Framework

- React
- TypeScript
- Vite

## Styling

- Tailwind CSS

## Component Library

- Official shadcn/ui

Reference:

https://ui.shadcn.com/docs/components

## Primitives

- Radix UI

## Icons

- Lucide React

## Forms

- React Hook Form
- Zod

## Data Fetching

- TanStack Query

## State

- Zustand

## Tables

- TanStack Table

## Charts

- shadcn Charts

## Notifications

- Sonner

## Animations

Minimal only.

No Framer Motion unless necessary.

---

# Project Structure

```text
src/

app/
    providers/
    router/
    config/

components/
    ui/
    layout/
    forms/
    shared/
    tables/
    dialogs/
    cards/
    charts/
    navigation/
    loaders/
    empty/

pages/
    public/
    auth/
    dashboard/
    admin/
    checkout/

services/
    api/

hooks/

stores/

lib/

styles/

types/

utils/
```

---

# App Architecture

## Providers

Create:

- ThemeProvider
- QueryProvider
- AuthProvider
- SocketProvider
- TooltipProvider

---

# Router

Create:

```
app/router/routes.tsx

app/router/router.tsx
```

Support:

- lazy loading
- protected routes
- admin routes
- error boundaries

---

# State Management

Use Zustand.

Stores:

```
auth.store.ts

checkout.store.ts

notification.store.ts

instance.store.ts

theme.store.ts

settings.store.ts

sidebar.store.ts
```

Never use Context for application state.

---

# API Layer

Create a dedicated API layer.

```
services/api/

plans.api.ts

instances.api.ts

checkout.api.ts

notifications.api.ts

tickets.api.ts

users.api.ts

billing.api.ts

auth.api.ts

settings.api.ts
```

No fetch() inside components.

---

# Query Hooks

Every API must have a custom hook.

Examples:

```
usePlans()

useInstances()

useInstance()

useNodes()

useNotifications()

useInvoices()

useTickets()

useProfile()

useCheckout()
```

---

# Design System

Every UI element must come from shadcn.

Required components:

- Button
- Card
- Badge
- Input
- Textarea
- Label
- Tabs
- Switch
- Checkbox
- Select
- Combobox
- Popover
- Sheet
- Dialog
- AlertDialog
- DropdownMenu
- NavigationMenu
- Sidebar
- Tooltip
- HoverCard
- ScrollArea
- Separator
- Avatar
- Calendar
- Skeleton
- Table
- Pagination
- Accordion
- Progress
- Sonner

Never recreate existing shadcn components manually.

---

# Typography

Use one font.

Recommended:

- General Sans
- Geist
- Inter

Hierarchy:

Display

H1

H2

H3

H4

Body

Small

Caption

Code

---

# Design Tokens

Create:

```
styles/

colors.ts

spacing.ts

radius.ts

typography.ts

sizes.ts

shadows.ts
```

No magic numbers.

---

# Layout System

Reusable layouts:

- PublicLayout
- DashboardLayout
- AuthLayout
- CheckoutLayout
- AdminLayout

Reusable wrappers:

- PageContainer
- Section
- DashboardGrid
- CardGrid
- PageActions

---

# Navigation

Rebuild completely.

Include:

- Desktop sidebar
- Mobile drawer
- Top navigation
- Breadcrumbs
- User menu
- Notification bell
- Command palette

---

# Command Palette

Implement Ctrl + K.

Search:

- Pages
- Services
- Tickets
- Invoices
- Users
- Settings

---

# Authentication

Split-screen layout.

Image on one side.

Form on one side.

Forms:

- Login
- Register
- Forgot Password
- Reset Password

---

# Public Pages

Create:

Home

Minecraft Plans

VPS Plans

Discord Bot Plans

Features

Support

Knowledge Base

About

Contact

Terms

Privacy

---

# Landing Page

Sections:

Hero

Features

Pricing

Locations

Testimonials

FAQ

Status

CTA

Footer

---

# Dashboard

Widgets:

Quick Actions

Statistics

Recent Activity

Notifications

Invoices

Services

Announcements

System Status

Usage

Pinned Services

---

# Client Area

Pages:

Dashboard

Services

Service Details

Backups

Databases

Schedules

Sub-users

Invoices

Payments

Tickets

Announcements

Knowledge Base

Profile

Security

API Keys

Settings

---

# Admin Panel

Pages:

Dashboard

Users

Plans

Orders

Coupons

Tickets

Nodes

Announcements

Settings

Logs

Statistics

---

# Checkout

Completely rebuild.

Flow:

Plan

↓

Configuration

↓

Location

↓

Software

↓

Billing Cycle

↓

Review

↓

Payment

↓

Confirmation

Support:

Coupons

Taxes

Add-ons

OxaPay

Validation

Order Summary

---

# Forms

Every form uses:

React Hook Form

+

Zod

+

shadcn Form

Never use useState forms.

---

# Tables

Use TanStack Table.

Support:

Sorting

Filtering

Pagination

Search

Column Visibility

Bulk Actions

CSV Export

Virtualization

---

# Charts

Use official shadcn charts.

Dashboard charts:

Revenue

Deployments

Orders

CPU

RAM

Network

Instances

---

# Notification System

Create:

NotificationBell

NotificationDrawer

NotificationCenter

NotificationSettings

Socket.IO integration.

---

# Loading States

Reusable:

PageSkeleton

TableSkeleton

CardSkeleton

ChartSkeleton

FormSkeleton

SidebarSkeleton

---

# Empty States

Create reusable:

No Services

No Tickets

No Notifications

No Orders

No Backups

No Results

---

# Error Pages

Create:

404

403

401

500

Offline

Maintenance

ErrorBoundary

---

# File Upload

Reusable upload component.

Support:

Drag & Drop

Progress

Retry

Cancel

Resume

---

# Accessibility

Support:

Keyboard Navigation

ARIA

Screen Readers

Focus Trap

Skip Navigation

Semantic HTML

---

# Responsive Design

Support:

Desktop

Laptop

Tablet

Mobile

Ultra-wide

No broken layouts.

---

# Performance

Implement:

Code Splitting

React.lazy

Suspense

Tree Shaking

React.memo

useMemo

useCallback

Optimized Imports

Image Optimization

SVG Optimization

Lazy Images

Intersection Observer

Virtualized Lists

Bundle Splitting

No unnecessary re-renders.

---

# SEO

Public pages only.

Implement:

OpenGraph

Twitter Cards

Canonical URLs

JSON-LD

Meta Tags

React Helmet

---

# Animation Rules

Allowed:

Fade

Slide

Scale

150–200ms

Forbidden:

Glow

Particles

Glass

Bounce

Elastic

Heavy Shadows

Gradients

---

# Permissions

Create:

PermissionGuard

RoleGuard

AdminGuard

FeatureProvider

---

# Toasts

Use Sonner everywhere.

No custom toast system.

---

# Testing

Use:

Vitest

React Testing Library

Playwright

---

# Migration Rules

## NEVER

- Modify legacy UI
- Copy JSX
- Copy layouts
- Copy CSS
- Wrap old components

## ALWAYS

- Create new files
- Build new layouts
- Build new components
- Reconnect backend APIs
- Use official shadcn/ui components

---

# Success Criteria

The rewrite is complete only if:

- Legacy frontend is completely removed
- Every page has been rebuilt
- Every component uses shadcn/ui
- Backend works unchanged
- APIs remain unchanged
- Performance improves
- Lighthouse score improves
- Accessibility passes
- Responsive layouts work
- No duplicated UI code exists
- No legacy UI code remains

The resulting application should feel like a polished, production-ready enterprise SaaS platform built from the ground up, with a cohesive design system, excellent performance, and maintainable architecture.