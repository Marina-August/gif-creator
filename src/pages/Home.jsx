import Footer from "../components/Footer";
import classes from './Home.module.css'
import { useRef } from "react";
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";


const HomePage = ()=>{
    const client = new S3Client({ 
        region: "eu-north-1",
        credentials: {
            secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
            accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID
        }
    });

    const toast = useRef(null);

    const onSelect = async (e) => {
        
        // const command = new ListObjectsV2Command({
        //     Bucket: 'meri-rastila'
        // });
        // const result = await client.send(command);
        if (e.files.length > 0) {
            const file = e.files[0];
            const command = new PutObjectCommand({
                Bucket: "meri-rastila",
                Key: 'test/' + file.name,
                Body: file,
            });
            const result = await client.send(command);
            console.log(result);
        }
        
        
        //console.log(result)
    }
    const onUpload = () => {
        toast.current.show({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
        console.log('hello', process.env)
    };


    return(
        <div>
            <div className={classes.main}>
                <div className={classes.title}>
                    <p>Make a cool Gif from your Video!</p>
                </div>
                <div className={classes.arrow}>
                    <div className={classes.curve}></div>
                    <div className={classes.point}></div>
                </div>
                <div className={classes.upload}>
                    <Toast ref={toast}></Toast>
                    <FileUpload mode="basic" name="" url="" accept="image/*" onSelect={onSelect} auto maxFileSize={1000000} onUpload={onUpload} />  
                </div>
            </div>
            <Footer/>
        </div>
        
    )

}

export default HomePage;