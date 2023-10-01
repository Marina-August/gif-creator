import json

import os
import re
import subprocess
import shlex
import boto3
import sys

from io import BytesIO

BUCKET = "marina-1"
FFPROBE_PATH = "/opt/bin/ffprobe"
FFMPEG_PATH = "/opt/bin/ffmpeg"
SIGNED_URL_TIMEOUT = 300
UPLOAD_FOLDER = 'upload/'
AWS_REGION = 'eu-central-1'


def build_s3_url (path):
    httpsPrefix = 'https://'
    return httpsPrefix + BUCKET + '.s3.' + AWS_REGION + '.amazonaws.com/' + path
    
def create_preview (s3_source_path, quality):

    # create a direct URL to the source video file
    s3_url = build_s3_url(s3_source_path)
    gifPath = s3_source_path.rsplit( ".", 1 )[0] + '.gif'

    s3_client = boto3.client('s3')
    # ffmpeg -y -i shtusha.mp4 -vf "fps=1/3,settb=1/1,setpts=N" -r 3 preview.gif
    ffmpeg_cmd_preview = FFMPEG_PATH + " -i \"" + s3_url + "\" -vf \"fps=" + quality + ",settb=1/1,setpts=N\" -f gif -r 3 -y -"
    # FFMPEG_PATH + " -i \"" + s3_source_path + "\" -f gif -r 1 -loop 0 -pix_fmt rgb24 -y -"

    command_preview = shlex.split(ffmpeg_cmd_preview)
    p1 = subprocess.run(command_preview, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    resp = s3_client.put_object(Body=p1.stdout, Bucket=BUCKET, Key=gifPath)

    print (p1.stderr)
    return gifPath

# MAIN
def lambda_handler(event, context):

    if 'test' in event:
        return 'this is a test'
    
    if 'path' not in event or 'quality' not in event:
        return {
            'statusCode': 404,
            'body': json.dumps('Can not find file path or quality value!')
        }
    
    destination_key = create_preview(event['path'], event['quality'])

    return {
        'statusCode': 200,
        'body': destination_key
    }