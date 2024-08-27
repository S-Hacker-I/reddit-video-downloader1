import sys
from yt_dlp import YoutubeDL

def download_video(url, output_file):
    ydl_opts = {
        'format': 'bestvideo+bestaudio',
        'outtmpl': output_file,
        'merge_output_format': 'mp4'
    }

    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

if __name__ == "__main__":
    video_url = sys.argv[1]
    output_file_name = sys.argv[2]
    download_video(video_url, output_file_name)
