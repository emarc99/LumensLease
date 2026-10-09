import json
import subprocess

bucket = "lumenslease-stellar-226579698869"
region = "us-east-1"

print(f"1. Creating bucket {bucket} in {region}...")
# In us-east-1, LocationConstraint must NOT be specified for create-bucket
subprocess.run(["aws", "s3api", "create-bucket", "--bucket", bucket, "--region", region], check=True)

print("2. Configuring website hosting...")
subprocess.run(["aws", "s3", "website", f"s3://{bucket}/", "--index-document", "index.html", "--error-document", "404.html"], check=True)

print("3. Removing public access block...")
subprocess.run(["aws", "s3api", "delete-public-access-block", "--bucket", bucket], check=True)

policy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": f"arn:aws:s3:::{bucket}/*"
        }
    ]
}

print("4. Applying bucket policy...")
with open("ll_bucket_policy.json", "w") as f:
    json.dump(policy, f)

subprocess.run(["aws", "s3api", "put-bucket-policy", "--bucket", bucket, "--policy", "file://ll_bucket_policy.json"], check=True)

print("5. Syncing out/ to S3...")
subprocess.run(["aws", "s3", "sync", "out/", f"s3://{bucket}/"], check=True)

website_url = f"http://{bucket}.s3-website-{region}.amazonaws.com"
print("\n=======================================================")
print(f"LUMENSLEASE S3 DEPLOYMENT SUCCESSFUL!")
print(f"LIVE S3 WEBSITE URL: {website_url}")
print("=======================================================\n")
