import Footer from "../components/Footer";
import classes from './Home.module.css'
import { Link } from 'react-router-dom'; 
import { useRef, useState, useEffect } from "react";
import { UPLOAD_FOLDER, S3_BUCKET, MAX_FILE_SIZE, AWS_REGION, VIDEO_LAMBDA } from "../constants";
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import {LambdaClient, ListFunctionsCommand, InvokeCommand, LogType} from "@aws-sdk/client-lambda";

import { Buffer } from 'buffer';


const HomePage = ()=>{
    const toast = useRef(null);
    const hiddenFileInput = useRef(null);
    const [videoPath, setVideoPath]= useState(null);
    const [gifURL, setGifURL] = useState('');
    const [uplodProgress, setUploadProgress] = useState(false);
    const [gifProgress, setGifProgress] = useState(false);

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
            setUploadProgress(true);
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
                setUploadProgress(false);
                toast.current.show({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
                setVideoPath(path);
            } else{
                setUploadProgress(false);
                toast.current.show({ severity:'error', summary: 'Error', detail: 'Could not upload File' });
            }

            // invoke lambda function to create a GIF
            // pass a path argument
            setGifProgress(true);
            const lambdaResponse = await invoke(VIDEO_LAMBDA, { 'path': UPLOAD_FOLDER + file.name });
            const gifS3Path = JSON.parse(lambdaResponse).body;
            setGifProgress(false);
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
    

    return(
        <div>
            <Toast ref={toast}></Toast>
            <div className={classes.main}>
                <div className={classes.title_container}>
                    <p className={classes.title}>Make a cool Gif from your Video! <span className={classes.size}>(maximum 50 MB)</span></p>
                </div>
                <div className={classes.video_arrow}>
                    <div className={classes.video}>
                        {videoPath && !uplodProgress && <video width="320" height="240" controls>
                            <source 
                                src={videoPath} 
                                type="video/mp4">
                            </source>
                        </video>}
                        {gifURL && !uplodProgress &&
                            <div className={classes.gif_container}>
                               { !gifProgress && <Link to={gifURL} className={classes.gif} >Click Here To Get Your GIF!</Link>}
                               { gifProgress && <p className={classes.gif}>GIF is making...&nbsp;<img src="assets/images/pot_1.png" alt="pot" className={classes.pot} width="50px"/></p>}
                            </div>}
                    </div>
                    {!videoPath && !uplodProgress && <div className={classes.arrow}>
                        <div className={classes.curve}></div>
                        <div className={classes.point}></div>
                    </div>}
                    { uplodProgress && 
                    <div className={classes.progress_bar}>
                         <ProgressBar mode="indeterminate" style={{ height: '6px', width:'300px' }}></ProgressBar>
                     </div>
                    }
                </div>
                {!uplodProgress && <div className={classes.upload}>
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
                </div>}
            </div>
            <Footer/>
        </div>
        
    )

}

export default HomePage;