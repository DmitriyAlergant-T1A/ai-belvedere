export interface OIDCUserProfile {
    sub: string; // Subject - Unique identifier for the user
    name: string; // Full name of the user
    given_name: string; // First name of the user
    family_name: string; // Last name of the user
    email: string; // Email address of the user
    picture: string; // URL of the user's profile picture
    locale: string; // User's locale
    updated_at: number; // Timestamp when the user's profile was last updated
  }
  