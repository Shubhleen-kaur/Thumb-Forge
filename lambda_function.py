
import json
import boto3
import uuid
import os
from io import BytesIO

from PIL import Image

s3 = boto3.client("s3")

dynamodb = boto3.resource("dynamodb")

TABLE_NAME = os.environ["TABLE_NAME"]

table = dynamodb.Table(TABLE_NAME)


def lambda_handler(event, context):

    try:

        print(json.dumps(event))

        record = event["Records"][0]

        bucket_name = (
            record["s3"]["bucket"]["name"]
        )

        object_key = (
            record["s3"]["object"]["key"]
        )

        print("OBJECT KEY:", object_key)

        # IGNORE THUMBNAILS
        if object_key.startswith(
            "thumbnails/"
        ):

            return {
                "statusCode": 200
            }

        file_name = (
            object_key.split("/")[-1]
        )

        # DOWNLOAD ORIGINAL IMAGE
        image_obj = s3.get_object(

            Bucket=bucket_name,

            Key=object_key
        )

        image_content = (
            image_obj["Body"].read()
        )

        image = Image.open(
            BytesIO(image_content)
        )

        # DETERMINE SIZE
        if "small" in file_name:

            size = (150, 150)

            quality = 40

            thumbnail_size = "small"

        elif "medium" in file_name:

            size = (300, 300)

            quality = 60

            thumbnail_size = "medium"

        else:

            size = (600, 600)

            quality = 80

            thumbnail_size = "large"

        # CREATE REAL THUMBNAIL
        image.thumbnail(size)

        buffer = BytesIO()

        image.save(

            buffer,

            format="JPEG",

            optimize=True,

            quality=quality
        )

        buffer.seek(0)

        thumbnail_key = (
            f"thumbnails/thumb-{file_name}"
        )

        # UPLOAD REAL COMPRESSED IMAGE
        s3.put_object(

            Bucket=bucket_name,

            Key=thumbnail_key,

            Body=buffer,

            ContentType="image/jpeg"
        )

        # URL
        thumbnail_url = (
            f"https://{bucket_name}"
            f".s3.us-east-1.amazonaws.com/"
            f"{thumbnail_key}"
        )

        print(thumbnail_url)

        # FILE SIZES
        original_size_kb = round(

            record["s3"]["object"]["size"]
            / 1024,

            2
        )

        compressed_size_kb = round(

            len(buffer.getvalue())
            / 1024,

            2
        )

        compression_percent = round(

            (
                (
                    original_size_kb -
                    compressed_size_kb
                )
                / original_size_kb
            ) * 100,

            2
        )

        # SAVE TO DYNAMODB
        table.put_item(

            Item={

                "id": str(uuid.uuid4()),

                "fileName": file_name,

                "thumbnail_url":
                    thumbnail_url,

                "thumbnail_size":
                    thumbnail_size,

                "original_size":
                    str(original_size_kb),

                "compressed_size":
                    str(compressed_size_kb),

                "compression_percent":
                    str(compression_percent)
            }
        )

        return {

            "statusCode": 200,

            "body": json.dumps({

                "thumbnail_url":
                    thumbnail_url
            })
        }

    except Exception as e:

        print(str(e))

        return {

            "statusCode": 500,

            "body": json.dumps({

                "error": str(e)
            })
        }
