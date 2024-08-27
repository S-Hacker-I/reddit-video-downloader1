const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/download', (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).send('No URL provided.');
    }

    const outputFileName = 'downloaded_video.mp4';

    // Use yt-dlp to download the video
    const ytDlpCommand = `yt-dlp -f bestvideo+bestaudio --merge-output-format mp4 "${videoUrl}" -o -`;
    const ytDlpProcess = exec(ytDlpCommand, { encoding: 'binary', maxBuffer: 1024 * 1024 * 1024 }); // Adjust buffer size as needed

    res.setHeader('Content-Disposition', `attachment; filename=${outputFileName}`);
    res.setHeader('Content-Type', 'video/mp4');

    ytDlpProcess.stdout.pipe(res);

    ytDlpProcess.on('error', (error) => {
        console.error(`Error executing yt-dlp: ${error.message}`);
        return res.status(500).send('Internal Server Error');
    });

    ytDlpProcess.stderr.on('data', (data) => {
        console.error(`yt-dlp stderr: ${data}`);
    });

    ytDlpProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`yt-dlp process exited with code ${code}`);
            return res.status(500).send('Failed to download video.');
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
