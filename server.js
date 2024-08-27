const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static('public'));

// Route to handle video download
app.get('/download', (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).send('No URL provided.');
    }

    const outputFileName = 'downloaded_video.mp4';
    const ytDlpCommand = `yt-dlp -f bestvideo+bestaudio --merge-output-format mp4 "${videoUrl}" -o "${outputFileName}"`;

    // Execute yt-dlp command
    exec(ytDlpCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing yt-dlp: ${error.message}`);
            return res.status(500).send('Internal Server Error');
        }
        if (stderr) {
            console.error(`yt-dlp stderr: ${stderr}`);
        }
        
        // Check if the video file exists and send it
        fs.access(outputFileName, fs.constants.F_OK, (err) => {
            if (err) {
                return res.status(500).send('File not found');
            }
            
            res.download(outputFileName, (err) => {
                if (err) {
                    console.error(`Download error: ${err.message}`);
                }

                // Clean up the file after sending
                fs.unlink(outputFileName, (unlinkErr) => {
                    if (unlinkErr) console.error(`Error deleting file: ${unlinkErr.message}`);
                });
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
