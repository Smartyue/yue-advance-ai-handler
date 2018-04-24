# yue-advance-ai-handler

# Install
`$ npm i yue-advance-ai-handler --save`

# Example
```javascript
const AdvanceAIHandler=require('yue-advance-ai-handler');

//Init config first
let config={
    "api_host":"https://api.advance.ai",
    "access_key":"xxx",//Your AccessKey
    "secret_key":"xxx",//Your SecretKey
}

//The init method only needs to be called once
AdvanceAIHandler.instance.init(config);

//Call Identity Check API

let res=await AdvanceAIHandler.instance.dispatchService("/openapi/anti-fraud/v3/identity-check",{"name":"NANA SUWARNA","idNumber":"3271032503570001"});

console.log('==res==',res);

//Call OCR API

let images={
    "ocrImage":"/home/xx/xx/xx.jpg",//photo's path
};
let res=await AdvanceAIHandler.instance.dispatchService("/openapi/face-recognition/v2/ocr-check",null,images);
console.log('==res==',res);

```



