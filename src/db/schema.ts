import type { InferSelectModel } from 'drizzle-orm';
import { boolean, date, timestamp } from 'drizzle-orm/pg-core';
import { pgTable, integer, varchar, } from 'drizzle-orm/pg-core';
import { bytea } from './custom-types';

export const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 100 }),
  role: varchar({ length: 30 }).notNull().default('user'),
  emailVerified: boolean('email_verified').default(false),
  recoveryCode: bytea('recovery_code'),
  created: date({ mode: 'date' }).notNull().defaultNow(),
  updated: date({ mode: 'date' }).notNull().defaultNow(),
});

export const userProfiles = pgTable('user_profiles', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  created: date({ mode: 'date' }).notNull().defaultNow(),
  updated: date({ mode: 'date' }).notNull().defaultNow(),
});

export const totpCredentials = pgTable('totp_credentials', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id),
  secret: bytea('secret'),
  created: date({ mode: 'date' }).notNull().defaultNow(),
  updated: date({ mode: 'date' }).notNull().defaultNow(),
});

export const passkeyCredentials = pgTable('passkey_credentials', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id),
  credentialId: bytea('credential_id').notNull().unique(),
  name: varchar('name', { length: 255 }),
  algorithmId: integer('algorithm_id'),
  publicKey: bytea('public_key'),
  created: date({ mode: 'date' }).notNull().defaultNow(),
  updated: date({ mode: 'date' }).notNull().defaultNow(),
});

export const securityKeyCredentials = pgTable('security_key_credentials', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id),
  credentialId: bytea('credential_id').notNull().unique(),
  name: varchar('name', { length: 255 }),
  algorithmId: integer('algorithm_id'),
  publicKey: bytea('public_key'),
  created: date({ mode: 'date' }).notNull().defaultNow(),
  updated: date({ mode: 'date' }).notNull().defaultNow(),
});

export const sessions = pgTable("session", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date"
	}).notNull(),
  mfaVerified: boolean('mfa_verified'),
});

export const passwordResets = pgTable('password_resets', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id),
  resetId: varchar('session_id', { length: 255 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull(),
  code: varchar({ length: 255 }).notNull(),
  emailVerified: boolean('email_verified').default(false),
  mfaVerified: boolean('mfa_verified').default(false),
  expiresAt: timestamp("expires_at", {
    mode: 'date',
    withTimezone: true,
  }),
});

export const emailVerificationRequest = pgTable('email_verification_request', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  requestId: varchar('request_id', { length: 255 }).notNull().unique(),
  userId: integer('user_id').notNull().references(() => users.id),
  email: varchar({ length: 255 }).notNull(),
  code: varchar({ length: 255 }).notNull(),
  expiresAt: timestamp("expires_at", {
    mode: 'date',
    withTimezone: true,
  }),
})

export type User = InferSelectModel<typeof users>;
export type TOTPCredentials = InferSelectModel<typeof totpCredentials>;
export type PasskeyCredentials = InferSelectModel<typeof passkeyCredentials>;
export type SecurityKeyCredentials = InferSelectModel<typeof securityKeyCredentials>;
export type UserProfile = InferSelectModel<typeof userProfiles>;
export type Session = InferSelectModel<typeof sessions>;
export type PasswordReset = InferSelectModel<typeof passwordResets>;
export type EmailVerificationRequest = InferSelectModel<typeof emailVerificationRequest>;

export interface AuthUser extends User {
  registeredTOTP: boolean;
  registeredSecurityKey: boolean;
  registeredPasskey: boolean;
  registered2FA: boolean;
}