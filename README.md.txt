# Thumb Forge

A fully serverless AI-powered Thumbnail Generator built using AWS cloud services and React.js.
This application allows users to upload single or multiple images, automatically generate compressed thumbnails in different sizes, and store thumbnail history with compression details.



## Live Demo

🔗 https://d2n0jh9p7mwrtk.cloudfront.net/



## Features

* Upload single or multiple images
* Generate real compressed thumbnails
* Multiple thumbnail sizes:

  * Small
  * Medium
  * Large
* Real-time thumbnail preview
* Download generated thumbnails
* View recently generated thumbnails
* Compression statistics:

  * Original Size
  * Compressed Size
  * Compression Percentage
* Serverless AWS Architecture
* Responsive modern UI



## Tech Stack

### Frontend

* React.js
* JavaScript
* CSS
* React Icons

### Backend / Cloud

* AWS Lambda
* Amazon S3
* Amazon DynamoDB
* Amazon API Gateway



## AWS Services Used

### AWS Lambda

Handles image upload requests, thumbnail generation, image compression, and metadata storage.

### Amazon S3

Stores:

* Original uploaded images
* Generated thumbnails

### Amazon DynamoDB

Stores thumbnail history and metadata:

* Thumbnail URL
* Compression details
* Thumbnail size
* Original image size

### API Gateway

Provides REST API endpoints for frontend-backend communication.



## Project Workflow

1. User uploads image(s)
2. React frontend converts images to Base64
3. API Gateway sends request to AWS Lambda
4. Lambda:

   * Decodes image
   * Compresses image
   * Generates thumbnail
   * Uploads thumbnail to S3
   * Saves metadata in DynamoDB
5. Frontend displays generated thumbnails
6. Thumbnail history is fetched from DynamoDB



## Folder Structure


thumbnail-project/
│
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   └── index.js
│
├── lambda/
│   └── lambda_function.py
│
├── README.md
└── package.json




## Installation

### Clone Repository


git clone https://github.com/Shubhleen-kaur/Thumb-Forge.git


### Navigate to Project


cd Thumb-Forge


### Install Dependencies


npm install


### Run Frontend


npm start




## API Endpoints

### Upload API

http
POST /upload


### History API

http
GET /history




## Future Enhancements

* AI-based smart image optimization
* Face-aware thumbnail generation
* User authentication
* Dark/Light mode
* Bulk ZIP download
* Drag & Drop Upload
* CloudFront CDN integration



## Screenshots

Added screenshots of:

* Upload page
* Generated thumbnails
* Thumbnail history
* Compression statistics



## Author

Shubhleen Kaur

Aspiring AI/ML & Cloud Engineer passionate about building scalable serverless applications using AWS and modern web technologies.



## License

This project is licensed under the MIT License.
