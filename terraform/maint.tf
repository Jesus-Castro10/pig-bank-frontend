resource "random_id" "bucket_prefix" {
  byte_length = 8
}

resource "aws_s3_bucket" "bank-front" {
  bucket        = "${var.project_name}-${random_id.bucket_prefix.hex}"
  force_destroy = true
}

resource "aws_s3_bucket_website_configuration" "bank-front" {
  bucket = aws_s3_bucket.bank-front.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }

}

resource "aws_s3_bucket_public_access_block" "bank-front" {
  bucket = aws_s3_bucket.bank-front.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "bank-front" {
  bucket = aws_s3_bucket.bank-front.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_policy" "bank-front" {
  bucket = aws_s3_bucket.bank-front.id

  policy = data.aws_iam_policy_document.s3_policy_document.json
}

resource "aws_cloudfront_origin_access_identity" "bank-front" {
  comment = "OAI for ${aws_s3_bucket.bank-front.bucket}"
}

resource "aws_cloudfront_origin_access_control" "bank-front" {
  name = "${var.project_name}-oac"

  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "bank-front" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  origin {
    domain_name = aws_s3_bucket.bank-front.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.bank-front.bucket_regional_domain_name

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.bank-front.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = aws_s3_bucket.bank-front.bucket_regional_domain_name
    compress         = true
    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 300
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 300
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
