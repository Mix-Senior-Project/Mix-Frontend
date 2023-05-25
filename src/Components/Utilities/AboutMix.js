
import style from "./AboutMix.module.css";
import alison from "../Static-Images/alison.jpeg";
import yarra from "../Static-Images/yarra.jpeg";
import brad from "../Static-Images/brad.png";
import tyler from "../Static-Images/tyler.jpg";
import baron from "../Static-Images/baron.png";


const AboutMix = (props) => {

    return (
        <div id={style.body}>
            <h1>Mix Development Team</h1>
            <br></br>
            <div id={style.devBar}>
                <div id={style.person}>
                    <img src={alison} id={style.pfp} height='14px' alt="Unable to load"></img>
                    <p id={style.pfpName}><b>Alison Langer</b></p>
                </div>
                <div id={style.person}>
                    <img src={yarra} id={style.pfp} height='14px' alt="Unable to load"></img>
                    <p id={style.pfpName}><b>Yarra Abozaed</b></p>
                </div>
                <div id={style.person}>
                    <img src={brad} id={style.pfp} height='14px' alt="Unable to load"></img>
                    <p id={style.pfpName}><b>Brad Bowman</b></p>
                </div>
                <div id={style.person}>
                    <img src={tyler} id={style.pfp} height='14px' alt="Unable to load"></img>
                    <p id={style.pfpName}><b>Tyler Watson</b></p>
                </div>
                <div id={style.person}>
                    <img src={baron} id={style.pfp} height='14px' alt="Unable to load"></img>
                    <p id={style.pfpName}><b>Baron Baruwani</b></p>
                </div>
            </div>
            <br></br>
            <h1>What is Mix?</h1>
            <p id={style.bodyText}>
                Welcome to Mix, the social media platform that is transforming the way we connect and engage online. Our platform is designed to foster community and encourage meaningful conversations, making it easy for users to find "their people" and connect with the right audience. With group and interest-specific features, Mix provides a toolbox for diverse communities to promote engagement and interconnectedness. With multi-media posting capabilities, including images, text, videos, and more, Mix allows users to share their content and engage with various like-minded individuals in a blog-style format while maintaining a personal timeline.
            </p>
            <br></br>
            <h1>Mission Statement</h1>
            <p id={style.bodyText}>
            At Mix, our mission is to create a social media platform that values transparency as the foundation for building trust. We believe that a holistic data governance strategy is crucial in ensuring that our users' information is protected and secure. Our platform’s design is built to promote diversity and freedom of expression, allowing our users to share their thoughts and opinions without fear of censorship or discrimination. We are committed to creating a safe and inclusive environment where our users can connect and engage with each other.
            </p>
        

        </div>
        
    );
}

export default AboutMix;