/**
 * Created by yuanjianxin on 2018/4/23.
 */
const FormData=require('form-data');
const HttpUtil=require('yue-http-util');
const fs=require('fs');
const crypto = require('crypto');
const separator="$";
module.exports=class _handler{

    static get instance(){
        if(!_handler._instance)
            _handler._instance=new _handler();
        return _handler._instance;
    }

    constructor(){
        this.api_host=null;
        this.access_key=null;
        this.secret_key=null;
        this.isInited=false;
    }

    init({api_host,access_key,secret_key}){
        this.api_host=api_host.endsWith('/') && api_host.substring(0,api_host.length-1) || api_host;
        this.access_key=access_key;
        this.secret_key=secret_key;
        this.isInited=true;
    }

    async getFileLength(form){
        return new Promise((resolve,reject)=>{
           form.getLength((err,length)=>{
               err ? reject(err) : resolve(length);
           });
        });
    }

    async getHeaders(form){
        return {
            'Content-Type':'multipart/form-data; boundary='+form._boundary,
            'Content-Length':await this.getFileLength(form)
        };
    }


    /**
     * 生成签名
     */
    authorization(now,api_name,contentType){
        let sign="POST"+separator;
        sign+=api_name+separator;
        sign+=contentType+separator;
        sign+=now+separator;
        let secret= this.encrypto(this.secret_key,sign);
        return this.access_key+':'+secret;
    }


    /**
     * 加密 + 编码
     * @param key
     * @param str
     * @returns {string}
     */
    encrypto(key,str){
        let hmac = crypto.createHmac('sha256', key);
        hmac.update(str);
        let res=hmac.digest('binary');
        return new Buffer(res,'binary').toString('base64')
    }



    async dispatchService(api_name,params,fileObj=null){
        if(!this.isInited) throw new Error('advance-api-handler should init first!');

        if(!api_name.startsWith('/'))
            api_name='/'+api_name;
        let url=this.api_host+api_name;
        let method='POST';
        let headers={};
        let data=null;
        if(fileObj){
            data=new FormData();
            Object.keys(fileObj).forEach(k=>data.append(k,fs.createReadStream(fileObj[k])));
            params && Object.keys(params).forEach(k=>data.append(k,params[k]));
            headers=await this.getHeaders(data);
        }else{
            data=params;
            headers['Content-Type']='application/json';
        }

        let contentType=headers['Content-Type'];

        let now=new Date().toUTCString();
        headers['Date']=now;

        let authorization=this.authorization(now,api_name,contentType);
        headers['Authorization']=authorization;

        return await HttpUtil.instance.sendRequest(method,url,data,headers);
    }

}