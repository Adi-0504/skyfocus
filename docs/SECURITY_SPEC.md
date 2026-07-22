---
title: Skyfocus Security Specification
version: 1.0
priority: high
status: active
---

# Skyfocus Security Specification

## Purpose

Define security requirements for Skyfocus.

Skyfocus is intended for public release.

Security must be considered throughout development.

Do not treat security as an optional improvement.

---

# Security Principles

Follow:

- Least privilege
- Secure defaults
- User data isolation
- Safe error handling
- Protection of sensitive information


---

# Authentication Security

## Authentication Provider

Use:

Supabase Authentication


Supported:

- Google OAuth
- Email and password


---

# Authentication Requirements

Implement:

- Secure session handling
- Session persistence
- Protected routes
- Logout handling
- Password recovery


Do not create:

- Custom password storage
- Custom insecure authentication
- Client-only authentication checks


---

# Authorization

Authentication does not equal authorization.

Every protected action must verify:

- User identity
- User ownership
- Permission


Users must only access their own resources.


---

# Supabase Security

## Row Level Security

RLS must be enabled on all user-owned tables.


Required:

Every query must respect user ownership.


Example:

A user can access:

- Their own tasks
- Their own reminders
- Their own focus records


A user cannot access:

- Other users' data
- Other users' profiles
- Other users' notifications


---

# Environment Variables

Never expose:

- Service role keys
- Private API keys
- Secret tokens
- Passwords


Allowed:

Public client configuration only.


---

# Git Security

Never commit:

- .env files
- Secrets
- Private credentials
- Personal information
- Local configuration files containing sensitive data


Before public release:

Review Git history for accidental secrets.


---

# Frontend Security

Implement:

- Input validation
- Safe rendering
- Error boundaries
- Secure storage practices


Prevent:

- XSS
- Injection attacks
- Unsafe HTML rendering


---

# User Input Handling

All user input must be validated.

Validate:

- Task titles
- Notes
- Tags
- Profile information


Handle:

- Empty values
- Invalid formats
- Excessively large input


---

# API Security

Requirements:

- Validate requests
- Handle failed requests safely
- Avoid exposing internal errors


Do not expose:

- Database structure
- Sensitive backend information
- Internal debugging data


---

# Error Handling

User-facing errors should be:

- Clear
- Helpful
- Safe


Do not display:

- Stack traces
- Database errors
- Internal system details


---

# Dependency Security

Before release:

Check:

- Vulnerable dependencies
- Unused packages
- Outdated packages


Avoid installing unnecessary dependencies.


---

# PWA Security

Ensure:

- Secure service worker behavior
- HTTPS deployment
- Safe caching rules


Do not cache:

- Private user data
- Authentication secrets


---

# Notification Security

Push notifications must:

- Require user permission
- Store subscriptions securely
- Validate notification ownership


---

# Database Security Checklist

Verify:

✓ RLS enabled

✓ Policies tested

✓ User isolation works

✓ No public sensitive tables

✓ No exposed secrets


---

# Production Security Checklist

Before release:

Verify:

✓ No API keys exposed

✓ No .env files committed

✓ Authentication is secure

✓ Database access is protected

✓ User data isolation works

✓ Error messages are safe

✓ Dependencies are reviewed


---

# Security Definition of Done

Security is complete when:

✓ Authentication is implemented securely

✓ Authorization rules work

✓ Supabase RLS is verified

✓ Secrets are protected

✓ Public repository is safe

✓ Production deployment is secure