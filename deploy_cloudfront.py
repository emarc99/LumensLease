import subprocess
import json

origin_domain = "lockhouse-direct-226579698869.s3-website-us-east-1.amazonaws.com"

distribution_config = {
    "CallerReference": f"lockhouse-cf-{int(subprocess.check_output(['python', '-c', 'import time; print(int(time.time()))']))}",
    "Comment": "LockHouse Next.js Production CDN - AWS Zero to Shipped Hackathon",
    "Enabled": True,
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-lockhouse-direct",
                "DomainName": origin_domain,
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-lockhouse-direct",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
            "Quantity": 2,
            "Items": ["GET", "HEAD"],
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"]
            }
        },
        "ForwardedValues": {
            "QueryString": False,
            "Cookies": {"Forward": "none"}
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000
    }
}

with open("cf_config.json", "w") as f:
    json.dump(distribution_config, f)

print("Creating CloudFront distribution...")
res = subprocess.run(["aws", "cloudfront", "create-distribution", "--distribution-config", "file://cf_config.json"], capture_output=True, text=True)

if res.returncode == 0:
    data = json.loads(res.stdout)
    dist_id = data["Distribution"]["Id"]
    domain_name = data["Distribution"]["DomainName"]
    print("\n=======================================================")
    print("CLOUDFRONT DISTRIBUTION CREATED!")
    print(f"Distribution ID: {dist_id}")
    print(f"LIVE HTTPS CLOUDFRONT URL: https://{domain_name}")
    print("=======================================================\n")
    with open("CLOUDFRONT_URL.txt", "w") as out_f:
        out_f.write(f"https://{domain_name}\n")
else:
    print("CloudFront error:", res.stderr)
