self.onmessage = async (e) => {
  try {
    const file = e.data;
    const response = await fetch(URL.createObjectURL(file));
    const blob = await response.blob();
    self.postMessage({ blob });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};

export {}; 