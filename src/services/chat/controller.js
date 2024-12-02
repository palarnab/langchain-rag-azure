const asyncHandler = require('../../middleware/async');
const log = require('../../utils/logger');
const ErrorResponse = require('../../utils/errorResponse');

const { generateAnswer } = require('./service');
const { addChat, getChats } = require('./repository');

exports.ask = asyncHandler(async (req, res, next) => {
    if (!req.user.id || !req.body.question || !req.body.index) {
        return next(
            new ErrorResponse(`Not found 'userId' or 'question' or 'index'`)
        );
    }

    const { question, index, sessionId, history } = req.body;

    const historicalChat = (history === 'true' || history === true) ? await getChats({
        userId: req.user.id,
        sessionId,
        index,
    }) : {history: []};

    const aiResponse = await generateAnswer(question, historicalChat, index);

    const { intermediate, final, tokens: tokenUsed } = aiResponse;

    const chat = await addChat({
        userId: req.user.id,
        sessionId: historicalChat._id,
        index,
        question: aiResponse.question,
        unmodifiedQuestion: question,
        answer: aiResponse.answer,
        aiMessage: { intermediate, final },
        sourceIp: req.ipAdd,
        tokenUsed,
    });

    log({
        message: `User=${req.user.userId} session=${chat.sessionId} index=${index}`,
        user: req.user,
    });

    res.status(200).json({
        question,
        answer: aiResponse.answer,
        sessionId: chat.sessionId,
        tokenUsed,
    });
});

exports.fetch = asyncHandler(async (req, res, next) => {
    if (!req.user.id || !req.query.sessionId || !req.query.index) {
        return next(
            new ErrorResponse(`Not found 'userId' or 'sessionId' or 'index'`)
        );
    }

    const { index, sessionId } = req.query;

    const { history } = await getChats({
        userId: req.user.id,
        sessionId,
        index,
    });

    const messages = history.map((h) => ({
        user: h.user,
        message: h.unmodifiedMsg || h.message,
    }));

    res.status(200).json(messages);
});
