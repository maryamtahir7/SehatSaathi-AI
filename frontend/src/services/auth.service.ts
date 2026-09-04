import { account, ID, OAuthProvider } from '../lib/appwrite';

export const authService = {
  // Signup
  async signup(email: string, password: string, name: string) {
    try {
      await account.create(ID.unique(), email, password, name);
      // Auto login after signup
      return await this.login(email, password);
    } catch (error: any) {
      console.error("Signup Error:", error);
      throw error;
    }
  },

  // Login
  async login(email: string, password: string) {
    try {
      await account.createEmailPasswordSession(email, password);
      return await account.get();
    } catch (error: any) {
      console.error("Login Error:", error);
      throw error;
    }
  },

  // Google OAuth
  async loginWithGoogle() {
    const successRedirect = window.location.origin;
    const failureRedirect = window.location.origin + "/login";

    try {
      await account.createOAuth2Session(OAuthProvider.Google, successRedirect, failureRedirect);
    } catch (error: any) {
      console.error("Google Login Error:", error);
      throw error;
    }
  },

  // Logout
  async logout() {
    try {
      return await account.deleteSession("current");
    } catch (error: any) {
      console.error("Logout Error:", error);
      throw error;
    }
  },

  // Get Current User
  async getCurrentUser() {
    try {
      return await account.get();
    } catch (error) {
      return null;
    }
  }
};
