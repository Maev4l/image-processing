# celsus-image-processing

## Regular deployment (deprrecated)

### Sharp library for AWS Lambda

see https://sharp.pixelplumbing.com/install#aws-lambda

```
rm -rf node_modules/sharp
docker run -v "$PWD":/var/task lambci/lambda:build-nodejs12.x npm install --save --save-exact sharp@0.26.0
```

### Notes

- use npm instead of yarn
- do not use webpack, as sharp is not bundled

## Package as custime image

### Connect to Docker registry

```script
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.eu-central-1.amazonaws.com
```

### Build image (locally)

```script
docker build -t celsus-image-resize .
```

### Link image to private repository

```script
docker tag celsus-image-resize:latest <aws_account_id>.dkr.ecr.eu-central-1.amazonaws.com/celsus-image-resize:latest
```

### Push image

```script
docker push <aws_account_id>.dkr.ecr.eu-central-1.amazonaws.com/celsus-image-resize:latest
```
