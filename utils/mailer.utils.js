
import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
    host: 'google',
    port: 587,
    auth: {
        user: 'faizan678siddiqui@gmail.com',
        pass: process.env.APP_KEY
    }
});

async function sendmail(message){
    const info= await transporter.sendMail(message);

    return info;
}

export default sendmail;