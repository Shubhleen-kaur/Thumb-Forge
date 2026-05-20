import boto3
from PIL import Image
import os

s3 = boto3.client('s3')

def lambda_handler(event, context):

    bucket_name = event['Records'][0]['s3']['bucket']['name']

    object_key = event['Records'][0]['s3']['object']['key']

    download_path = '/tmp/input-image.jpg'

    upload_path = '/tmp/output-image.jpg'

    s3.download_file(bucket_name, object_key, download_path)

    image = Image.open(download_path)

    filename = object_key.split("/")[-1]

    # DETECT SIZE

    if filename.startswith("small-"):
        size = (150, 150)

    elif filename.startswith("medium-"):
        size = (300, 300)

    elif filename.startswith("large-"):
        size = (600, 600)

    else:
        size = (300, 300)

    # HIGH QUALITY THUMBNAIL

    image.thumbnail(size, Image.LANCZOS)

    image.save(
        upload_path,
        optimize=True,
        quality=95
    )

    thumbnail_key = f"thumbnails/thumb-{filename}"

    s3.upload_file(
        upload_path,
        bucket_name,
        thumbnail_key,
        ExtraArgs={
            "ContentType": "image/jpeg"
        }
    )

    return {
        'statusCode': 200,
        'body': 'Thumbnail created successfully'
    }