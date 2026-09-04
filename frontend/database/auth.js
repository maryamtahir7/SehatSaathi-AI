import { account } from "./appwrite";

// --------------------- SIGNUP ---------------------
export async function signup(email, password, name) {
  // Create user
  await account.create("unique()", email, password, name);

  // Auto login after signup
  await account.createEmailPasswordSession(email, password);

  // Return user details
  return await account.get();
}

// --------------------- LOGIN WITH EMAIL/PASSWORD ---------------------
export async function login(email, password) {
  await account.createEmailPasswordSession(email, password);
  return await account.get();
}

// --------------------- LOGIN WITH GOOGLE OAUTH ---------------------
export async function loginWithGoogle() {
  const successRedirect = window.location.origin;
  const failureRedirect = window.location.origin + "/login";

  try {
    await account.createOAuth2Session("google", successRedirect, failureRedirect);
  } catch (error) {
    console.error("Google Login Error:", error);
  }
}

// --------------------- LOGOUT ---------------------
export async function logout() {
  return await account.deleteSession("current");
}

// --------------------- GET CURRENT USER ---------------------
export async function getCurrentUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}
