import api from "./api";
const getUser = async (token) => {
  console.log("user token is", token);
  try {
    const response = await api.get("/api/user/get-user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Assuming the API returns user data in `response.data`
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export default getUser;
