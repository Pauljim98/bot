const axios = require('axios');
const Redis = require('../config/redis');
const { text } = require('express');
const { link } = require('../routes');
const API_VERSION = process.env.API_VERSION;
const BOT_NUMBER_ID = process.env.BOT_NUMBER_ID;
const TOKEN = process.env.TOKEN;
const stepsResponses = require('../helpers/responses.json');

const sendTextMessage = async (text, phoneNumber) => {
    try {
        const url = `https://graph.facebook.com/${API_VERSION}/${BOT_NUMBER_ID}/messages`;
        const body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: phoneNumber,
            type: 'text',
            text: {
                preview_url: false,
                body: text
            }
        }
        const config = {
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        };
        const result = await axios.post(url, body, config);
        console.log('result', result.data);
        return result
    } catch (error) {
        console.log('error', error?.response?.data);
        throw new Error(error?.response?.data?.error?.message)
    }
}

const sendReplyMessage = async (text, phoneNumber, messageId) => {
    try {
        const url = `https://graph.facebook.com/${API_VERSION}/${BOT_NUMBER_ID}/messages`;
        const body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: phoneNumber,
            context: {
                message_id: messageId
            },
            type: 'text',
            text: {
                preview_url: false,
                body: text
            }
        }
        const config = {
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        };
        const result = await axios.post(url, body, config);
        console.log('result', result.data);
        return result

    } catch (error) {
        console.log('error', error?.response?.data);
        throw new Error(error?.response?.data?.error?.message)
    }

}


const sendReactionMessage = async (phoneNumber, messageId) => {
    try {
        const url = `https://graph.facebook.com/${API_VERSION}/${BOT_NUMBER_ID}/messages`;
        const body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: phoneNumber,
            type: 'reaction',
            reaction: {
                message_id: messageId,
                emoji: '✅'
            }
        }
        const config = {
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        };
        const result = await axios.post(url, body, config);
        console.log('result', result.data);
        return result

    } catch (error) {
        console.log('error', error?.response?.data);
        throw new Error(error?.response?.data?.error?.message)
    }
}


const sendMessage = async (options) => {
    const {
        text,
        phoneNumber,
        messageId,
        replay = false,
        hasUrl = false,
        type,
        document,
        contact,
        location,
        listPayload,
        buttonPayload
    } = options;
    try {
        const url = `https://graph.facebook.com/${API_VERSION}/${BOT_NUMBER_ID}/messages`;
        const body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: phoneNumber,
        }
        if (replay && messageId) {
            body.context = {
                message_id: messageId
            }
        }
        switch (type) {
            case 'text':
                body.type = 'text';
                body.text = {
                    preview_url: hasUrl,
                    body: text
                }
                break;
            case 'reaction':
                body.type = 'reaction';
                body.reaction = {
                    message_id: messageId,
                    emoji: text // '✅'
                }
                break;
            case 'image':
                body.type = 'image'
                body.image = {
                    link: text
                }
                break;
            case 'audio':
                body.type = 'audio';
                body.audio = {
                    link: text
                }
                break;
            case 'document':
                body.type = 'document';
                body.document = document;
                document.caption = text;
                break;
            case 'sticker':
                body.type = 'sticker',
                    body.sticker = {
                        id: text
                    }
                break;
            case 'video':
                body.type = 'video';
                body.video = {
                    link: text
                }
                break;
            case 'contacts':
                body.type = 'contacts';
                body.contacts = contact;
                break;
            case 'location':
                body.type = 'location';
                body.location = location;
                break;
            case 'list':
                body.type = 'interactive';
                body.interactive = listPayload;
                break;
            case 'button':
                body.type = 'interactive';
                body.interactive = buttonPayload;
                break;
            default:
                break;
        }
        const config = {
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        };
        const result = await axios.post(url, body, config);
        console.log('result', result.data);
        return result


    } catch (error) {
        console.log('error', error?.response?.data);
        throw new Error(error?.response?.data?.error?.message)
    }
}

const sendMessageSteps = async(message, phoneNumber, messageId)=>{
    const redis = await Redis();
    const inactiveClientKey = `${phoneNumber}:inactive`;
    const inactiveClientRedis = await redis.get(inactiveClientKey);
    if (inactiveClientRedis) return "Client inactive";
    const stepsKey = `${phoneNumber}:steps`;
    let step = 0;
    if(message === 'reed'){
        await redis.del(stepsKey);
    }else{
        step = await redis.get(stepsKey) || 0;
    }

    try {
        const key = stepsResponses.find(items => items.keywords.includes(message) && Number(items.previousStep) === Number(step));
        if (!key) return null 
        const {
            response,
            type,
            document,
            location
        }=key

        await redis.set(stepsKey, key.step);
        redis.expire(stepsKey, 86400);

        const options = {
            text:  response.join(''),
            type,
            phoneNumber,
            messageId,
            document,
            location
        }
        await sendMessage(options);
        return null
    } catch (error) {
        throw new Error(error?.response?.data?.error?.message)
    }
}

module.exports = {
    sendTextMessage,
    sendReplyMessage,
    sendReactionMessage,
    sendMessage,
    sendMessageSteps 
}