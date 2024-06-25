const { text } = require('express');
const Messages =  require('../models/messages');
const clientModel = require('../models/clients');
const { options, link } = require('../routes');
const verify_token = process.env.verify_token;

const apiVerification = async (req, res)=>{
    try {
        const{
            'hub.mode': mode,
            'hub.verify_token': token,
            'hub.challenge': challenge,            
        }= req.query;

        if(mode && token && mode === 'subscribe' && token === verify_token ){
            return res.status(200).send(challenge);
        }else{
            return res.status(403).send('unauthorized');
        }
    } catch (error) {
        return req.status(500).send(error);
    }   

}

const messaInfo = async (req, res) =>{
    console.log('body', JSON.stringify(req.body.entry));
    const body = req.body.entry[0].changes[0];
    const {
        value:{
            contacts,
            messages
        }
    } = body;
    if(!messages) return res.status(200).send();
    const{
        profile:{
            name: wsName
        }
    }=contacts[0]
    const {
        from: phoneNumber,
        id: messageId,
        text: {
            body: messageText
        }
    } = messages[0]

    
    //const formatNumber = phoneNumber.slice(0,2)+phoneNumber.slice(3);
    const formatMessage = messageText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"") ;
    
    await clientModel.verifyStoreClient(phoneNumber, wsName, messageText);
    await Messages.sendMessageSteps(formatMessage, phoneNumber, messageId);   
    return res.status(200).send();
}

module.exports = {
    apiVerification,
    messaInfo,
};


