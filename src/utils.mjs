const parseJson = (data) => {
  try {
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
};

export { parseJson };
