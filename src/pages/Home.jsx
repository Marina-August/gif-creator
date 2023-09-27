import Footer from "../components/Footer";
import classes from './Home.module.css'
import { Link } from 'react-router-dom'; 
import { useRef, useState, useEffect } from "react";
import { UPLOAD_FOLDER, S3_BUCKET, MAX_FILE_SIZE, AWS_REGION, VIDEO_LAMBDA } from "../constants";
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import {LambdaClient, ListFunctionsCommand, InvokeCommand, LogType} from "@aws-sdk/client-lambda";

import { Buffer } from 'buffer';


const HomePage = ()=>{
    const toast = useRef(null);
    const hiddenFileInput = useRef(null);
    const [videoPath, setVideoPath]= useState(null);
    const [gifURL, setGifURL] = useState('');

    const getFilePath = (filename) => {
        const httpPrefix = "https://";

        return httpPrefix + S3_BUCKET + '.s3.' + AWS_REGION + '.amazonaws.com/' + UPLOAD_FOLDER  + filename;
    }
    const getGifUrl = (filename) => {
        const httpPrefix = "https://";

        return httpPrefix + S3_BUCKET + '.s3.' + AWS_REGION + '.amazonaws.com/' + filename;
    }

    const handleClick = () => {
        hiddenFileInput.current.click();
      };

    const onSelect = async (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const path = getFilePath(file.name);
            console.log('file:', path);
            if (file.size > MAX_FILE_SIZE) {
                toast.current.show({ severity:'warn', summary: 'Error', detail: 'File size is too large' });
                return;
            }

            // handle S3 upload
            const s3_client = new S3Client({ 
                region: AWS_REGION,
                credentials: {
                    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
                    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID
                }
            });


            const command = new PutObjectCommand({
                Bucket: S3_BUCKET,
                Key: UPLOAD_FOLDER + file.name,
                Body: file,
            });

            const result = await s3_client.send(command);
            if (result){
                toast.current.show({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
                setVideoPath(path);
            } else{
                toast.current.show({ severity:'error', summary: 'Error', detail: 'Could not upload File' });
            }

            // invoke lambda function to create a GIF
            // pass a path argument
            const lambdaResponse = await invoke(VIDEO_LAMBDA, { 'path': UPLOAD_FOLDER + file.name });
            const gifS3Path = JSON.parse(lambdaResponse).body;
            const gifUrl = getGifUrl(gifS3Path);

            console.log(JSON.parse(lambdaResponse));
            console.log(gifUrl);
            setGifURL(gifUrl);
            toast.current.show({ severity: 'info', summary: 'Success', detail: 'GIF created!' });
            
        }
        console.log('no file')
    }
    const invoke = async (funcName, payload) => {
        const lambdaClient = new LambdaClient({ 
            region: AWS_REGION,
            credentials: {
                secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
                accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID
            }
        });    

        const command = new InvokeCommand({
          FunctionName: funcName,
          Payload: JSON.stringify(payload),
          LogType: LogType.Tail,
        });
      
        const { Payload } = await lambdaClient.send(command);
        const result = Buffer.from(Payload).toString();

        return result;
    };
    const testLambda = async () => {
        console.log('test lambda');
        const res = await invoke(VIDEO_LAMBDA, {'test': 'motan'})
        console.log(res);
    }
    console.log(videoPath)
    return(
        <div>
            <div className={classes.main}>
                <div className={classes.title_container}>
                    <p className={classes.title}>Make a cool Gif from your Video! <span className={classes.size}>(maximum 50 MB)</span></p>
                </div>
                <div className={classes.video_arrow}>
                    <div className={classes.video}>
                        {videoPath && <video width="320" height="240" controls>
                            <source 
                                src={videoPath} 
                                type="video/mp4">
                            </source>
                        </video>}
                        {gifURL && 
                            <div className={classes.gif_container}>
                                <Link to={gifURL} className={classes.gif} >Click Here To Get Your GIF!</Link>
                            </div>}
                    </div>
                    {!videoPath && <div className={classes.arrow}>
                        <div className={classes.curve}></div>
                        <div className={classes.point}></div>
                    </div>}
                </div>
                <div className={classes.upload}>
                    <Toast ref={toast}></Toast>
                    {/* <FileUpload mode="basic" name="" url="" accept="video/*" onSelect={onSelect} auto />   */}
                    <button className={videoPath? classes.upload_button_video:classes.upload_button} onClick={handleClick}>
                        <img src="assets/images/upload.png" width="13" alt="upload-img" className={classes.upload_img}/>
                        <span>Upload Video</span>
                    </button>
                    <input
                    type="file"
                    accept="video/*"
                    onChange={onSelect}
                    ref={hiddenFileInput}
                    style={{display: 'none'}}/>
                </div>
            </div>
            <Footer/>
        </div>
        
    )

}

export default HomePage;