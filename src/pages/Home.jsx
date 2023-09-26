import Footer from "../components/Footer";
import classes from './Home.module.css'
import { useRef, useState, useEffect } from "react";
import { UPLOAD_FOLDER, S3_BUCKET, MAX_FILE_SIZE, AWS_REGION } from "../constants";
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";


const HomePage = ()=>{
    const client = new S3Client({ 
        region: AWS_REGION,
        credentials: {
            secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
            accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID
        }
    });
    
    useEffect(()=>{
        console.log(process.env)
    },[])

    const toast = useRef(null);
    const [videoPath, setVideoPath]= useState(null);

    const getFilePath = (filename) => {
        const httpPrefix = "https://";

        return httpPrefix + S3_BUCKET + '.s3.' + AWS_REGION + '.amazonaws.com/' + UPLOAD_FOLDER + '/' + filename;
    }
    const onSelect = async (e) => {
        
        // const command = new ListObjectsV2Command({
        //     Bucket: 'meri-rastila'
        // });
        // const result = await client.send(command);
        if (e.files.length > 0) {
            const file = e.files[0];
            const path = getFilePath(file.name);
            console.log('file:', path);
            if (file.size > MAX_FILE_SIZE){
                toast.current.show({ severity:'warn', summary: 'Error', detail: 'File size is too large' });
                return;
            }
            const command = new PutObjectCommand({
                Bucket: S3_BUCKET,
                Key: UPLOAD_FOLDER + file.name,
                Body: file,
            });
            // https://meri-rastila.s3.eu-north-1.amazonaws.com/test/Helsinki.jpg

            const result = await client.send(command);
            if (result){
                toast.current.show({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
                setVideoPath(path);
            }else{
                toast.current.show({ severity:'error', summary: 'Error', detail: 'Could not upload File' });
            }
            console.log(result);
        }
    }

    return(
        <div>
            <div className={classes.main}>
                <div className={classes.title_container}>
                    <p className={classes.title}>Make a cool Gif from your Video! <span className={classes.size}>(max size 10 Mb)</span></p>
                </div>
                <div className={classes.video_arrow}>
                    <div className={classes.video}>
                        {videoPath && <video width="320" height="240" controls>
                            <source 
                                src={videoPath} 
                                type="video/mp4">
                            </source>
                        </video>}
                    </div>
                    <div className={classes.arrow}>
                        <div className={classes.curve}></div>
                        <div className={classes.point}></div>
                    </div>
                </div>
                <div className={classes.upload}>
                    <Toast ref={toast}></Toast>
                    <FileUpload mode="basic" name="" url="" accept="video/*,image/*" onSelect={onSelect} auto />  
                </div>
            </div>
            <Footer/>
        </div>
        
    )

}

export default HomePage;