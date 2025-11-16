# 📁 File Upload Service

A lightweight, modern file upload service built with Node.js. Features a beautiful drag-and-drop interface with support for all file types up to 50MB.

## ✨ Features

- 🎨 **Modern UI** - Beautiful gradient design with smooth animations
- 📤 **Drag & Drop** - Intuitive drag-and-drop file upload
- 🔄 **Real-time Feedback** - Loading states and progress indicators
- 📁 **Universal Support** - Accepts any file type
- 📊 **File Preview** - Shows file name and size before upload
- 🔗 **Direct Links** - Get download URLs immediately after upload
- 📅 **Organized Storage** - Files stored in date-based directory structure (YYYY/MM/DD)
- 🔒 **Secure** - Path traversal protection and file validation

## 🚀 Getting Started

### Prerequisites

- Node.js (v14.21.3 or higher, or v16+)
- npm

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## 📂 Project Structure

```
file-upload-service/
├── node_modules/          # Dependencies
├── public/
│   └── index.html        # Frontend UI (includes CSS & JS)
├── uploads/              # Uploaded files (auto-created)
│   └── YYYY/MM/DD/       # Date-based folder structure
├── .gitignore
├── package.json
├── package-lock.json
├── server.js             # Main server file
└── README.md
```

## 🛠️ Configuration

### Change Port

Edit `server.js` and modify the PORT constant:
```javascript
const PORT = 3000; // Change to your desired port
```

### File Size Limit

Edit `server.js` in the `handleUpload` function:
```javascript
const form = formidable({
  maxFileSize: 50 * 1024 * 1024, // 50MB (change as needed)
  // ...
});
```

### Upload Directory

Edit `server.js` to change where files are stored:
```javascript
const uploadRoot = path.join(__dirname, 'uploads'); // Change path
```

## 📡 API Endpoints

### `GET /`
Serves the main upload interface

### `POST /upload`
Upload a file

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with file field

**Response (Success):**
```json
{
  "message": "Upload successful",
  "fileName": "2024/11/16/abc123def456.png",
  "url": "/files/2024/11/16/abc123def456.png",
  "size": 1234567,
  "originalName": "photo.png"
}
```

**Response (Error):**
```json
{
  "error": "Error message here"
}
```

### `GET /files/:path`
Download an uploaded file

**Example:**
```
GET /files/2024/11/16/abc123def456.png
```

## 🔧 How It Works

1. **File Upload**: Files are uploaded via multipart/form-data
2. **Unique Naming**: Each file gets a unique hex name with original extension
3. **Date Organization**: Files stored in `uploads/YYYY/MM/DD/` structure
4. **Immediate Access**: Get a download URL instantly after upload

## 📝 Usage Example

### Web Interface
1. Click the upload area or drag a file onto it
2. See file preview with name and size
3. Click "Upload File" button
4. Get download link on success

### cURL Example
```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@/path/to/your/file.jpg"
```

## 🎨 Supported File Types

All file types are supported! Common MIME types are automatically detected for downloads:
- Images: `.png`, `.jpg`, `.jpeg`, `.gif`
- Documents: `.pdf`, `.txt`, `.json`
- Archives: `.zip`
- And any other file type

## 🔐 Security Features

- Path traversal protection
- File size limits
- Secure file naming (prevents overwriting)
- Input validation
- Safe path resolution

## 📦 Dependencies

- **formidable** (^2.1.5) - Multipart form parsing for file uploads

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change the PORT in server.js or kill the process using port 3000
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows
```

### Upload Fails
- Check file size is under 50MB
- Ensure `uploads/` directory is writable
- Check server logs in console

### Files Not Accessible
- Verify the file path in the URL matches the actual file location
- Check file permissions in the `uploads/` directory

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📧 Support

For support, please open an issue in the repository or contact the maintainer.

---

Made with ❤️ using Node.js