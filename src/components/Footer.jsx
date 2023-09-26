import { Link } from 'react-router-dom'; 
import classes from './Footer.module.css'

const Footer = ()=>{
    const year = new Date().getFullYear();

     return(
        <div className={classes.footer}>
            <div className={classes.footer_text} >
                <p >Copyright © {year} Marina Batina.<span className="rights-footer"> &nbsp;All rights reserved &nbsp;&nbsp; |</span> </p>
                <p >&nbsp;Gif Creator v.0.1.1 &nbsp;&nbsp;|</p>
            </div> 
            <div className={classes.social_media} >  
                <Link to= "https://github.com/Marina-August" className="opacity-50 hover:opacity-75"><img src="assets/images/github.png"  height="20" width="20"/></Link>
                <Link to= "https://www.linkedin.com/in/marina-batina/"  className="opacity-50 hover:opacity-75"><img src="assets/images/linkedin.png" height="20" width="20"/></Link>
                <Link to= "https://www.codewars.com/users/Marina_August"  className="opacity-50 hover:opacity-75"><img src="https://www.codewars.com/packs/assets/logo.f607a0fb.svg" hight= "25" width = "25"/></Link>  
                <a href="mailto:mbatina.oat@gmail.com" className="lg:mr-16 md:mr-2 opacity-50 hover:opacity-75">
                    <img src="assets/images/gmail.png" alt="Send an email" height="25" width="25"/>
                </a> 
            </div> 
        </div>
     )
}

export default Footer;