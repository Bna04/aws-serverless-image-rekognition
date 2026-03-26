# Serverless Image Analysis Pipeline

<img width="1912" height="965" alt="image" src="https://github.com/user-attachments/assets/df39ae2a-94a8-449b-bde3-4fb9db0e7813" />


I built this project because I wanted to get some hands-on experience connecting different AWS services without managing any servers, so the initial goal was to create a system that automatically tags images as soon as I upload them via a web interface.

I made sure it used an **Event-Driven Architecture**, which means the system is completely idle, as it doesn't cost anything until a file is actually uploaded.

## Architecture

**Frontend -> S3 (Upload) -> Lambda (Trigger) -> Rekognition (AI) -> DynamoDB (Save)**



- **Frontend** I use a simple sleek web page to select and upload the image.
- **Trigger** The file lands in an S3 bucket.
- **The Code:** This fires an event that wakes up my Lambda function.
- **Brains** Lambda sends the image to Amazon Rekognition to detect labels (like "insect", "Car", "Beach").
- **Database** The results are then saved into a DynamoDB table so I can have a look at them later.
- **Display** The frontend asks **API Gateway** for the results to show them on the screen.

> **Security** I implemented a secure upload pattern, so instead of sending the image file through the API Gateway, which can be expensive and slow, I created a second Lambda function that generates S3 Presigned URLs, Thus allowing the frontend to upload directly to the S3 bucket securely without exposing my AWS credentials.

## Tech Stack

* **Frontend:** HTML5, CSS3, JavaScript (Single-file implementation hosted on S3)
* **AWS Services:** Lambda, S3, DynamoDB, Rekognition, IAM, API Gateway
* **Language:** Python 3.12
* **Libraries:** Boto3 (AWS SDK)

## 💡 How it works

The backend code (`lambda_function.py`) is relatively short, but it handles a few key tasks such as:

1. **Event Parsing** It grabs the bucket name and file key from the specific event JSON that S3 sends.

2. **The "Space" Bug** I ran into an issue where files with spaces, like `my dog.jpg`, were causing errors because S3 sends them as `my%20dog.jpg`, so I used `urllib.parse` to decode the filenames before processing, which resolved the issue.

3. **Confidence Thresholds** I set Rekognition to only return labels with >75% confidence to avoid getting irrelevant tags.

4. **NoSQL Storage** Finally, it pushes the clean list of tags to DynamoDB using the filename as the Primary Key.



## What I learned

- **Connecting the UI** I learned how to use **API Gateway** to let my frontend talk to the database securely, so the tags can appear on the website.

- **Case Sensitivity:** I spent some time debugging why my data wasn't saving, only to realize that DynamoDB table names are case-sensitive (`ImageMetaData` vs `ImageMetadata`). It was a small typo that broke the pipeline, but it taught me to be precise with AWS resource names.

- **"Ghost Image" Fix:** I noticed that if I deleted a file from the S3 bucket, the website would try to load it and show a "broken image" icon because the metadata still existed in the database, which I fixed by adding a `onerror` event handler to the image tags in my HTML, so if an image fails to load, it automatically hides itself from the gallery.

- **Frontend Polish:** To give the site a professional feel, I implemented a **Masonry Grid layout** using CSS columns, a real-time **Dark Mode toggle**, and custom **Skeleton Loading** animations. *Note: For this project, I kept the CSS and JS embedded within the HTML for simpler S3 deployment, though in a larger production environment, I would separate these concerns into distinct files.*

## 📂 Project Structure

```text
.
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/
│   └── lambda_function.py
└── README.md
