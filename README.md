# Serverless Image Analysis Pipeline

<img width="1912" height="965" alt="image" src="https://github.com/user-attachments/assets/df39ae2a-94a8-449b-bde3-4fb9db0e7813" />


Core Architecture:

Storage & Hosting: Frontend hosted statically on Amazon S3.

Secure Uploads: API Gateway and Lambda generate pre-signed URLs, allowing direct browser-to-S3 uploads to bypass API payload limits.

Event-Driven Processing: S3 PUT events trigger an asynchronous AWS Lambda function.

AI Vision: The Lambda function orchestrates Amazon Rekognition to extract object and scene labels.

NoSQL Database: Metadata and labels are indexed in DynamoDB for fast frontend retrieval.
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
