export const getUser = async (params) => {
  // If no params or no id provided, fetch all users
  const url = params?.id 
    ? `https://jsonplaceholder.typicode.com/users/${params.id}`
    : 'https://jsonplaceholder.typicode.com/users';
    
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};