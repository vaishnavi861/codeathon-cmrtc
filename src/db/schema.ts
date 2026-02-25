import { pgTable, serial, text, integer, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  level: integer('level').notNull(), // 1-5 scale
});

export const certifications = pgTable('certifications', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  issuer: text('issuer').notNull(),
  date: timestamp('date').notNull(),
});

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  complexity: integer('complexity').notNull(), // 1-5 scale
});

export const internships = pgTable('internships', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  company: text('company').notNull(),
  role: text('role').notNull(),
  durationMonths: integer('duration_months').notNull(),
});

export const resumeProfiles = pgTable('resume_profiles', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  isComplete: boolean('is_complete').default(false).notNull(),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});
