    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const uploadBtn = document.getElementById('uploadBtn');
    const status = document.getElementById('status');

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      
      if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        updateFileInfo();
      }
    });

    fileInput.addEventListener('change', updateFileInfo);

    function updateFileInfo() {
      const file = fileInput.files[0];
      if (file) {
        fileName.textContent = `📄 ${file.name}`;
        fileSize.textContent = `Size: ${formatFileSize(file.size)}`;
        fileInfo.classList.add('show');
        uploadBtn.classList.add('show');
        status.classList.remove('show');
      }
    }

    function formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const file = fileInput.files[0];
      if (!file) {
        showStatus('Please select a file first.', 'error');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      uploadBtn.disabled = true;
      showStatus('<span class="spinner"></span>Uploading...', 'loading');

      try {
        const response = await fetch('/upload', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (response.ok) {
          showStatus(
            `✅ ${result.message}<br><a href="${result.url}" class="download-link" target="_blank">Download: ${result.fileName}</a>`,
            'success'
          );
          fileInput.value = '';
          fileInfo.classList.remove('show');
          uploadBtn.classList.remove('show');
        } else {
          showStatus(`❌ ${result.error || 'Upload failed'}`, 'error');
        }
      } catch (error) {
        showStatus(`❌ Upload failed: ${error.message}`, 'error');
      } finally {
        uploadBtn.disabled = false;
      }
    });

    function showStatus(message, type) {
      status.innerHTML = message;
      status.className = 'status show ' + type;
    }