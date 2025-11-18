/**
 * Family Members Configuration
 * 
 * This file contains the list of family members for task assignment.
 * Update this file to add/remove/modify family members without changing component code.
 * 
 * Future: Move to external config service (LaunchDarkly, ConfigCat, Firebase Remote Config)
 */

export const FAMILY_MEMBERS = [
  { email: 'sudhanshu@example.com', name: 'Sudhanshu' },
  { email: 'maneesha@example.com', name: 'Maneesha' },
  { email: 'shreya@example.com', name: 'Shreya' },
  { email: 'shyla@example.com', name: 'Shyla' },
  { email: 'milo@example.com', name: 'Milo' },
];

// Helper to get member by email
export const getMemberByEmail = (email) => {
  return FAMILY_MEMBERS.find(m => m.email === email);
};

// Helper to get member by name
export const getMemberByName = (name) => {
  return FAMILY_MEMBERS.find(m => m.name === name);
};
