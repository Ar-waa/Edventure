import mainApi from './mainApi';

export const milestoneApi = {
  // Get milestones for a user
  getMilestones: async (userId) => {
    const response = await mainApi.get(`/milestones/${userId}`);
    return response.data;
  },

  // Create initial milestones
  createMilestone: async (userId) => {
    const response = await mainApi.post(`/milestones/${userId}/create`);
    return response.data;
  },

  // Update progress
  updateMilestone: async (userId, studyData) => {
    const response = await mainApi.put(`/milestones/${userId}/update`, studyData);
    return response.data;
  }
};