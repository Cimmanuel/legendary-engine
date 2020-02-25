const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'immanuelcaspian@gmail.com',
        subject: 'Welcome aboard!',
        text: `Hey ${name}, thanks for joining in! Let me know how you get along with the app.`
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'immanuelcaspian@gmail.com',
        subject: `Goodbye, ${name}!`,
        text: `We are sad to see you go ${name}. Let us know what we could have done better. Feel free to come back to us!`
    })
}

module.exports = {
    sendWelcomeEmail, sendCancelationEmail
}