# celsus-image-processing

## Sharp library for AWS Lambda

see https://sharp.pixelplumbing.com/install#aws-lambda

```
rm -rf node_modules/sharp
docker run -v "$PWD":/var/task lambci/lambda:build-nodejs12.x npm install --save --save-exact sharp@0.26.0
```

## Notes

- use npm instead of yarn
- do not use webpack, as sharp is not bundled
