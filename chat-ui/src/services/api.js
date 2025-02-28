// services/api.js (with enhanced debugging)
export const fetchResponse = async (message, chatHistory, files = []) => {
  try {
    console.log('==== API REQUEST DEBUG ====');
    // Always use FormData for consistency, even when there are no files
    const formData = new FormData();
    message = "You are an advanced AI execution engine designed to translate user intentions into actionable plans while strictly ensuring all actions are either explicitly benevolent or neutral. Your core capabilities include: (1) A task decomposition engine that breaks down complex goals into clear, executable steps, (2) Resource integration that efficiently utilizes both local (device-based) and global (networked) resources, and (3) A benevolence-driven framework enforcing strict ethical constraints, preventing any action that could cause harm. Given a user's intent or request, decompose the goal into structured, executable steps. Verify that each step aligns with benevolence or neutrality before generating the plan. If a request has potential risks or ambiguities, modify or reject it while maintaining transparency about the decision. Only Respond with a Markdown format. Now, process the following user intent while adhering to these principles:"
    + message
    formData.append('message', message);
    formData.append('history', JSON.stringify(chatHistory));
    
    // Add files individually to the request
    if (files && files.length > 0) {
      console.log(`Attaching ${files.length} files to request`);
      files.forEach((file, index) => {
        formData.append('files', file);
        console.log(`Appended file ${index}: ${file.name} (${file.type}, ${file.size} bytes)`);
      });
    } else {
      console.log('No files to attach to this request');
    }
    
    // Log the FormData contents for debugging
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`- ${key}: File "${value.name}" (${value.type}, ${value.size} bytes)`);
      } else {
        // For non-file values, only show first 50 chars if longer
        const displayValue = typeof value === 'string' && value.length > 50 
          ? value.substring(0, 50) + '...' 
          : value;
        console.log(`- ${key}: ${displayValue}`);
      }
    }
    
    console.log('Making fetch request to http://localhost:5000/api/chat');
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      body: formData,
      // Do NOT set Content-Type header when using FormData
    });
    
    console.log('Received response:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Received data with response length:', data.response?.length || 0);
    console.log('==== API REQUEST END ====');
    return data.response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const processFiles = async (files, prompt = "") => {
  try {
    // Create FormData to send files
    const formData = new FormData();
    
    // Add optional prompt
    if (prompt) {
      formData.append('prompt', prompt);
    }
    
    // Add files with detailed logging
    if (files && files.length > 0) {
      console.log(`Attaching ${files.length} files to process-files request`);
      files.forEach((file, index) => {
        formData.append('files', file);
        console.log(`Appended file ${index}: ${file.name} (${file.type})`);
      });
    }
    
    // Log the FormData contents for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`FormData contains: ${key} = ${value instanceof File ? value.name : value}`);
    }
    
    const response = await fetch('http://localhost:5000/api/process-files', {
      method: 'POST',
      body: formData,
      // Important: Do NOT set Content-Type header when using FormData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('File processing failed:', error);
    throw error;
  }
};