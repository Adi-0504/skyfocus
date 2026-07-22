---
title: Skyfocus Database Specification
version: 1.0
priority: high
status: active
---

# Skyfocus Database Specification

## Purpose

Define the backend data architecture for Skyfocus.

The application must use a real Supabase database.

No mock database.

No local-only fake storage for production features.

---

# Backend Platform

Use:

Supabase


Required services:

- Authentication
- PostgreSQL Database
- Row Level Security
- Realtime when needed
- Storage when needed


---

# Database Principles

Requirements:

- Secure user data isolation
- Clear relationships
- Scalable structure
- Production-ready schema


Every user-owned table must include:

- id
- user_id
- created_at
- updated_at


---

# Authentication Database

Supabase Auth handles authentication.

User profile data is stored separately.

---

# Table: profiles

## Purpose

Store user profile information.


Columns:

id

- uuid
- Primary key
- References auth.users(id)


display_name

- text


avatar_url

- text
- nullable


language

- text
- Default: zh-TW


timezone

- text


created_at

- timestamp


updated_at

- timestamp


---

# Table: task_lists

## Purpose

Store user-created task groups.


Columns:

id

- uuid
- Primary key


user_id

- uuid
- References profiles(id)


name

- text


icon

- text
- nullable


color

- text
- nullable


position

- integer


created_at

- timestamp


updated_at

- timestamp


---

# Table: tasks

## Purpose

Main task storage.


Columns:

id

- uuid
- Primary key


user_id

- uuid


list_id

- uuid
- References task_lists(id)
- nullable


title

- text


description

- text
- nullable


priority

- text

Values:

- low
- medium
- high


status

- text

Values:

- pending
- completed


due_date

- date
- nullable


due_time

- time
- nullable


completed_at

- timestamp
- nullable


created_at

- timestamp


updated_at

- timestamp


---

# Table: subtasks

## Purpose

Store task breakdown items.


Columns:

id

- uuid
- Primary key


task_id

- uuid
- References tasks(id)


title

- text


is_completed

- boolean


position

- integer


created_at

- timestamp


updated_at

- timestamp


---

# Table: tags

## Purpose

Store reusable task tags.


Columns:

id

- uuid
- Primary key


user_id

- uuid


name

- text


created_at

- timestamp


---

# Table: task_tags

## Purpose

Many-to-many relationship between tasks and tags.


Columns:

id

- uuid
- Primary key


task_id

- uuid


tag_id

- uuid


created_at

- timestamp


---

# Table: reminders

## Purpose

Store task reminder settings.


Columns:

id

- uuid
- Primary key


task_id

- uuid


user_id

- uuid


reminder_time

- timestamp


repeat_type

- text


Values:

- none
- daily
- weekly
- monthly


enabled

- boolean


created_at

- timestamp


updated_at

- timestamp


---

# Table: notifications

## Purpose

Store notification records.


Columns:

id

- uuid
- Primary key


user_id

- uuid


title

- text


message

- text


type

- text


is_read

- boolean


created_at

- timestamp


---

# Table: push_subscriptions

## Purpose

Store PWA push notification subscriptions.


Columns:

id

- uuid
- Primary key


user_id

- uuid


endpoint

- text


p256dh

- text


auth

- text


created_at

- timestamp


---

# Table: focus_sessions

## Purpose

Store focus mode records.


Columns:

id

- uuid
- Primary key


user_id

- uuid


task_id

- uuid
- nullable


duration

- integer


started_at

- timestamp


ended_at

- timestamp


completed

- boolean


created_at

- timestamp


---

# Relationships

Required relationships:

profiles

↓

task_lists

↓

tasks

↓

subtasks


tasks

↓

reminders


tasks

↓

tags

↓

task_tags


users

↓

focus_sessions


users

↓

notifications


users

↓

push_subscriptions


---

# Index Requirements

Create indexes for:

tasks.user_id

tasks.status

tasks.due_date

tasks.priority

reminders.reminder_time

focus_sessions.user_id


---

# Row Level Security

RLS must be enabled.

Every user can only access their own data.


Rules:

A user can:

- Read their own data
- Create their own data
- Update their own data
- Delete their own data


A user cannot:

- Access another user's tasks
- Access another user's reminders
- Access another user's profile data


---

# Database Migration

All schema changes must use migrations.

Do not manually modify production databases without migration files.


Store migrations in:

supabase/migrations/


---

# Error Handling

Frontend must handle:

- Connection failure
- Permission failure
- Invalid data
- Missing records


---

# Database Completion Definition

Database implementation is complete when:

✓ All required tables exist

✓ Relationships work

✓ Migrations exist

✓ RLS is enabled

✓ User isolation is verified

✓ Real Supabase connection works

✓ No mock database exists