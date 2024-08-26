const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/download', (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).send('No video URL provided');
    }

    const ytdlpPath = path.join(__dirname, 'yt-dlp.exe');
    const command = ['-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4', '-o', '-', videoUrl];

    // Stream video directly to response
    const ytDlpProcess = spawn(ytdlpPath, command, { stdio: ['pipe', 'pipe', 'inherit'] });

    ytDlpProcess.stdout.on('data', (data) => {
        res.write(data); // Write data to the response stream
    });

    ytDlpProcess.stdout.on('end', () => {
        res.end(); // End the response stream when process ends
    });

    ytDlpProcess.on('error', (error) => {
        console.error(`Error executing yt-dlp: ${error.message}`);
        res.status(500).send('Failed to download video');
    });

    ytDlpProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`yt-dlp process exited with code ${code}`);
            res.status(500).send('Failed to download video');
        }
    });

    res.setHeader('Content-Disposition', `attachment; filename="${getOriginalFileName(videoUrl)}.mp4"`);
    res.setHeader('Content-Type', 'video/mp4');
});

function getOriginalFileName(url) {
    // Extract and sanitize the original file name from the URL if possible
    // This is a placeholder; implement your own logic if needed
    return 'downloaded_video';
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
