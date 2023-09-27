import { Link } from 'react-router-dom'; 
import classes from './Footer.module.css'

const Footer = ()=>{
    const year = new Date().getFullYear();

     return(
        <div className={classes.footer}>
            <div className={classes.footer_text} >
                <p >Copyright © {year} Marina Batina.<span className="rights-footer"> &nbsp;All rights reserved &nbsp;&nbsp; |</span> </p>
                <p className={classes.creator}>&nbsp;Gif Creator v.0.1.1 &nbsp;&nbsp;|</p>
            </div> 
            <div className={classes.social_media} >  
                <Link to= "https://github.com/Marina-August" ><img src="assets/images/github.png" className={classes.github} alt='github'/></Link>
                <Link to= "https://www.linkedin.com/in/marina-batina/"  ><img src="assets/images/linkedin.png" className={classes.linkedin} height="20" width="20" alt='linkedin'/></Link>
                <Link to= "https://www.codewars.com/users/Marina_August"  ><img src="https://www.codewars.com/packs/assets/logo.f607a0fb.svg" className={classes.codewars} alt='codewars' hight= "25" width = "25"/></Link>  
                <a href="mailto:mbatina.oat@gmail.com" >
                    <img src="assets/images/gmail.png" className={classes.mail} alt="Send an email" height="25" width="25"/>
                </a> 
            </div> 
        </div>
     )
}

export default Footer;