import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve the frontend.html file at the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend.html'));
});

// Handle image verification
app.post('/verify-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const form = new FormData();
        form.append('media', fs.createReadStream(req.file.path));
        form.append('models', 'genai');
        form.append('api_user', '26851975');
        form.append('api_secret', 'Fqo7gvQodWPzkLbg7XF7drou7GKXF56N');

        const response = await axios({
            method: 'post',
            url: 'https://api.sightengine.com/1.0/check.json',
            data: form,
            headers: form.getHeaders()
        });

        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);

        res.json(response.data);
    } catch (error) {
        console.error('Error processing image:', error);
        if (error.response) {
            res.status(500).json({ error: error.response.data });
        } else {
            res.status(500).json({ error: 'Error processing image' });
        }
    }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
