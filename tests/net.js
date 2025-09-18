async function testGoogleOAuth() {
  try {
    const response = await fetch(
      'https://accounts.google.com/.well-known/openid-configuration'
    );
    console.log('Google OAuth Config:', await response.json());
  } catch (error) {
    console.error('Fetch Google OAuth failed:', error);
  }
}
testGoogleOAuth();
