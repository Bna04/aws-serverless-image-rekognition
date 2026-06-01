import json
import urllib.parse
import boto3

s3_client = boto3.client('s3')
rekog_client = boto3.client('rekognition')
db_resource = boto3.resource('dynamodb')

table_name = 'ImageMetaData' 
metadata_table = db_resource.Table(table_name)

def lambda_handler(event, context):
    try:
        record = event['Records'][0]
        s3_bucket = record['s3']['bucket']['name']
        
        raw_key = record['s3']['object']['key']
        filename = urllib.parse.unquote_plus(raw_key, encoding='utf-8')
        
        print(f"Started processing for file: {filename}")

        rekog_response = rekog_client.detect_labels(
            Image={
                'S3Object': {
                    'Bucket': s3_bucket, 
                    'Name': filename
                }
            },
            MaxLabels=10,
            MinConfidence=75
        )
        
        detected_tags = []
        if 'Labels' in rekog_response:
            for label in rekog_response['Labels']:
                detected_tags.append(label['Name'])
        
        print(f"Analysis complete. Detected: {detected_tags}")

        metadata_table.put_item(
            Item={
                'image_name': filename,
                'labels': detected_tags,
                'timestamp': str(context.aws_request_id) # Optional: helps with tracing logs later
            }
        )
        
        return {
            'statusCode': 200, 
            'body': json.dumps(f"Successfully processed {filename}")
        }
        
    except Exception as e:
        print(f"FAILED to process image. Error: {str(e)}")
        return {
            'statusCode': 500, 
            'body': json.dumps("Internal Server Error")
        }
