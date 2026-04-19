output "website_url" {
  value = "https://${aws_cloudfront_distribution.bank-front.domain_name}"
}

output "s3_bucket_name" {
  value = aws_s3_bucket.bank-front.bucket
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.bank-front.id
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.bank-front.domain_name
}