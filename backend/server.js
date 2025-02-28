const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

console.log('Initializing server...');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log('GoogleGenerativeAI initialized.');

// Helper function to convert file to base64
function fileToGenerativePart(filePath, mimeType) {
  try {
    const fileData = fs.readFileSync(filePath);
    console.log(`Processing file for conversion: ${filePath}`);
    return {
      inlineData: {
        data: Buffer.from(fileData).toString('base64'),
        mimeType
      }
    };
  } catch (error) {
    console.error(`Error reading file: ${filePath}`, error);
    return null;
  }
}
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use a more reliable filename with original extension
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${path.basename(file.originalname, fileExt)}${fileExt}`;
    cb(null, fileName);
  }
});

// Log all files being processed
const fileFilter = (req, file, cb) => {
  console.log(`Multer processing file: ${file.originalname} (${file.mimetype})`);
  cb(null, true);
};

// Use more detailed multer configuration
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Add a debugging middleware to log multipart form details
app.use((req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    console.log('Received multipart request to:', req.path);
    console.log('Content-Type:', req.headers['content-type']);
  }
  next();
});

// Modified chat endpoint with better file handling
app.post('/api/chat', (req, res, next) => {
  console.log('====== CHAT REQUEST START ======');
  console.log('Processing a new chat request with potential files');
  
  // Use the upload middleware directly in the route handler
  upload.array('files')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: 'File upload error', details: err.message });
    }
    
    try {
      console.log('Request body keys:', Object.keys(req.body));
      const { message } = req.body;
      console.log('Message:', message);
      
      // Safely parse history
      let history = [];
      try {
        history = JSON.parse(req.body.history || '[]');
      } catch (parseError) {
        console.error('Error parsing history JSON:', parseError);
        console.log('Raw history value:', req.body.history);
      }
      
      // Check for files
      const files = req.files || [];
      console.log(`Number of files uploaded: ${files.length}`);
      
      if (files.length > 0) {
        files.forEach((file, index) => {
          console.log(`File ${index}: ${file.originalname} (${file.mimetype}) - Size: ${file.size} bytes`);
        });
      } else {
        console.log('No files were uploaded with this request');
        // Check if there were supposed to be files
        if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
          console.log('Request was multipart/form-data but no files were received');
          console.log('Content-Type:', req.headers['content-type']);
        }
      }
      
      // Rest of your code to process the request...
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      console.log('Chat model initialized.');

      const formattedHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const chat = model.startChat({
        history: formattedHistory,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      // Start with the user's message
      const contentParts = [message];
      
      // Add content from files
      for (const file of files) {
        console.log(`Processing file: ${file.originalname} (${file.mimetype})`);
        const filePath = file.path;
        const fileType = file.mimetype;
        
        if (fileType.includes('image') || fileType.includes('audio')) {
          try {
            console.log(`Converting file to generative part: ${filePath}`);
            const filePart = fileToGenerativePart(filePath, fileType);
            if (filePart) {
              console.log('File successfully converted to generative part');
              contentParts.push(filePart);
            } else {
              console.error('Failed to convert file to generative part');
            }
          } catch (fileError) {
            console.error(`Error processing ${fileType} file:`, fileError);
          }
        }
        else if (fileType.includes('image') || fileType.includes('audio') || fileType.includes('video') || fileType.includes('pdf')) {
          try {
            console.log(`Converting file to generative part: ${filePath}`);
            const filePart = fileToGenerativePart(filePath, fileType);
            if (filePart) {
              console.log('File successfully converted to generative part');
              contentParts.push(filePart);
            } else {
              console.error('Failed to convert file to generative part');
            }
          } catch (fileError) {
            console.error(`Error processing ${fileType} file:`, fileError);
          }
        }
      }
      
      console.log(`Sending message with ${contentParts.length} parts to AI model...`);
      console.log('Content parts types:', contentParts.map(part => typeof part === 'string' ? 'text' : 'binary data'));
      
      const result = await chat.sendMessage(contentParts);
      const response = result.response.text();
      console.log('AI response received. Length:', response.length);
      console.log('====== CHAT REQUEST END ======');
      
      res.json({ response });
    } catch (error) {
      console.error('Error in /api/chat:', error);
      res.status(500).json({ 
        error: 'Failed to process request', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
});

// Process files endpoint - updated with Google's approach
app.post('/api/process-files', upload.array('files'), async (req, res) => {
  try {
    const files = req.files;
    const processedFiles = [];
    
    // Add the prompt if available
    const prompt = req.body.prompt || "Analyze the following content:";
    const contentParts = [prompt];
    
    // Process each file based on type
    for (const file of files) {
      const filePath = file.path;
      const fileType = file.mimetype;
      let extractedText = '';
      console.log(filePath, fileType);
      // Image and audio processing - add as generative part
      if (fileType.includes('image') || fileType.includes('audio')) {
        contentParts.push(fileToGenerativePart(filePath, fileType));
        processedFiles.push({
          name: file.originalname,
          type: fileType.includes('image') ? 'image' : 'audio',
          path: filePath
        });
      } 
      // PDF processing - extract text
      else if (fileType === 'application/pdf') {
        try {
          const fileBuffer = fs.readFileSync(filePath);
          const pdfData = await pdfParse(fileBuffer);
          extractedText = pdfData.text;
          contentParts.push(`\n\nContent from PDF (${file.originalname}):\n${extractedText}`);
        } catch (err) {
          console.error('Error parsing PDF:', err);
          extractedText = `[Error extracting PDF content: ${err.message}]`;
          contentParts.push(`\n\nUnable to extract content from PDF: ${file.originalname}`);
        }
        
        processedFiles.push({
          name: file.originalname,
          type: 'pdf',
          path: filePath,
          extractedText
        });
      } 
      // Word document processing
      else if (fileType.includes('word') || fileType.includes('openxmlformats')) {
        try {
          const fileBuffer = fs.readFileSync(filePath);
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          extractedText = result.value;
          contentParts.push(`\n\nContent from document (${file.originalname}):\n${extractedText}`);
        } catch (err) {
          console.error('Error parsing document:', err);
          extractedText = `[Error extracting document content: ${err.message}]`;
          contentParts.push(`\n\nUnable to extract content from document: ${file.originalname}`);
        }
        
        processedFiles.push({
          name: file.originalname,
          type: 'document',
          path: filePath,
          extractedText
        });
      } 
      // Text file processing
      else if (fileType === 'text/plain') {
        extractedText = fs.readFileSync(filePath, 'utf8');
        contentParts.push(`\n\nContent from text file (${file.originalname}):\n${extractedText}`);
        
        processedFiles.push({
          name: file.originalname,
          type: 'text',
          path: filePath,
          extractedText
        });
      }
    }
    
    // Generate AI response
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const generatedContent = await model.generateContent(contentParts);
    const aiResponse = generatedContent.response.text();
    
    // Send the response
    res.json({
      success: true,
      files: processedFiles,
      aiResponse
    });
  } catch (error) {
    console.error('Error processing files:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing files',
      error: error.message
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});