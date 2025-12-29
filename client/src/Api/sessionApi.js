export const saveSession = async (sessionData) => {
  try {
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData)
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error saving session:', error);
    return { success: false, message: error.message };
  }
};