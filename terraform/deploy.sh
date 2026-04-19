#!/bin/bash

set -e
echo "Deploying the frontend application to AWS S3 and CloudFront..."

echo "Building the Angular application..."
cd ../app
npm install
npm run build -- --configuration=production
cd ../terraform

echo "Initializing Terraform..."
terraform apply -auto-approve

echo "Getting details"
BUCKET_NAME=$(terraform output -raw s3_bucket_name)
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
DOMAIN_NAME=$(terraform output -raw cloudfront_domain_name)

echo "S3 Bucket: $BUCKET_NAME"
echo "CloudFront Distribution ID: $DISTRIBUTION_ID"
echo "CloudFront Domain Name: $DOMAIN_NAME"

echo "Uploading to s3"
aws s3 sync ../app/dist/bank-frontend/browser/ s3://$BUCKET_NAME --delete

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

echo "Deployment complete!"
echo "Your frontend application is now live at: https://$DOMAIN_NAME"