const express = require('express');
const path = require('path');
const router = require('express').Router();
const messageController = require('../controllers/messages');

router.get('/bot/webhook', messageController.apiVerification);
router.post('/bot/webhook', messageController.messaInfo);

module.exports = router;


