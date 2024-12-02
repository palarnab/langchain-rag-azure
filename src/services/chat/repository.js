const RepositoryError = require('../../utils/repositoryError');

const History = require('../../models/history');

const addChat = async ({
    userId,
    sessionId,
    index,
    question,
    unmodifiedQuestion,
    answer,
    aiMessage,
    sourceIp,
    tokenUsed,
}) => {
    if (!sessionId) {
        const newSession = await History.create({ user: userId, index });
        sessionId = newSession.id;
    }

    let chat = await History.findOne({ _id: sessionId, index });

    if (!chat) {
        chat = await History.create({ user: userId, index });
        sessionId = chat.id;
    }

    if (!chat || chat.user.toString() !== userId) {
        new RepositoryError(`Cannot find session ${sessionId}`, 400);
    }

    const isValid = answer.toLowerCase() !== "i don't know.";

    chat.tokenUsed = (chat.tokenUsed || 0) + tokenUsed;
    chat.history.push({
        user: 'human',
        message: question,
        unmodifiedMsg: unmodifiedQuestion,
        sourceIp,
        isValid,
    });
    chat.history.push({ user: 'ai', message: answer, response: aiMessage, isValid });

    await chat.save();

    return {
        sessionId,
    };
};

const getChats = async ({ userId, sessionId, index }) => {
    let chat;
    if (sessionId) {
        chat = await History.findOne({ _id: sessionId, index }).lean();

        if (chat && chat.user.toString() !== userId) {
            new RepositoryError(`Cannot find session ${sessionId}`, 400);
        }
    }
    return chat || { history: [], index };
};

module.exports = {
    addChat,
    getChats,
};
