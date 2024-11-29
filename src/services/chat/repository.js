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
}) => {
    if (!sessionId) {
        const newSession = await History.create({ user: userId, index });
        sessionId = newSession.id;
    }

    const chat = await History.findOne({ _id: sessionId, index });

    if (!chat || chat.user.toString() !== userId) {
        new RepositoryError(`Cannot find session ${sessionId}`, 400);
    }

    chat.history.push({
        user: 'human',
        message: question,
        unmodifiedMsg: unmodifiedQuestion,
    });
    chat.history.push({ user: 'ai', message: answer, response: aiMessage });

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
