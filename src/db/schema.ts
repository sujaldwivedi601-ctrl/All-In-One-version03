import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Users table (synced from Firebase Authentication)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email'),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Farmer Profiles (The Core: Slide 7)
export const farmerProfiles = pgTable('farmer_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  village: text('village').default(''),
  district: text('district').default(''),
  state: text('state').default(''),
  latitude: text('latitude'),
  longitude: text('longitude'),
  landAreaAcres: text('land_area_acres').default('1.0'),
  soilType: text('soil_type').default('Loamy Soil'),
  primaryCrop: text('primary_crop').default(''),
  cropStage: text('crop_stage').default(''),
  waterSource: text('water_source').default('Well / Borewell'),
  irrigationType: text('irrigation_type').default('Flood / Furrow'),
  farmerCategory: text('farmer_category').default('Small Farmer'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 3. AI Crop Analysis Records (Slide 3)
export const cropAnalyses = pgTable('crop_analyses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  cropName: text('crop_name').notNull(),
  imageUrl: text('image_url'),
  identifiedCrop: text('identified_crop').notNull(),
  condition: text('condition').notNull(),
  severity: text('severity').notNull(),
  confidencePercentage: integer('confidence_percentage').notNull(),
  symptomsJson: text('symptoms_json'),
  remediesJson: text('remedies_json'),
  summary: text('summary'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Local Farmer Marketplace & Waste Exchange Listings (Slide 6)
export const marketplaceListings = pgTable('marketplace_listings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  category: text('category').notNull(), // 'Waste Exchange' | 'Equipment' | 'Produce'
  price: text('price').notNull(),
  unit: text('unit').notNull(),
  quantity: text('quantity'),
  description: text('description'),
  imageUrl: text('image_url'),
  sellerName: text('seller_name'),
  sellerPhone: text('seller_phone'),
  sellerVillage: text('seller_village'),
  latitude: text('latitude'),
  longitude: text('longitude'),
  tagsJson: text('tags_json'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(farmerProfiles, {
    fields: [users.id],
    references: [farmerProfiles.userId],
  }),
  cropAnalyses: many(cropAnalyses),
  marketplaceListings: many(marketplaceListings),
}));

export const farmerProfilesRelations = relations(farmerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [farmerProfiles.userId],
    references: [users.id],
  }),
}));

export const cropAnalysesRelations = relations(cropAnalyses, ({ one }) => ({
  user: one(users, {
    fields: [cropAnalyses.userId],
    references: [users.id],
  }),
}));

export const marketplaceListingsRelations = relations(marketplaceListings, ({ one }) => ({
  user: one(users, {
    fields: [marketplaceListings.userId],
    references: [users.id],
  }),
}));
