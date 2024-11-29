const { Pinecone } = require('@pinecone-database/pinecone');
const {
    ChatPromptTemplate,
    MessagesPlaceholder,
} = require('@langchain/core/prompts');
const { AzureChatOpenAI, AzureOpenAIEmbeddings } = require('@langchain/openai');
const { PineconeStore } = require('@langchain/pinecone');
const { AIMessage, HumanMessage } = require('@langchain/core/messages');
const { RunnableSequence } = require('@langchain/core/runnables');

// Initialize Pinecone client
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_APIKEY });

const embeddings = new AzureOpenAIEmbeddings({
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiDeploymentName:
        process.env.AZURE_OPENAI_API_EMBEDDING_DEPLOYMENT_NAME,
    azureOpenAIApiVersion: '2023-05-15',
});

const llm = new AzureChatOpenAI({
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiDeploymentName:
        process.env.AZURE_OPENAI_API_CHAT_DEPLOYMENT_NAME,
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
    temperature: 0,
});

const contextualizeQSystemPrompt = `Given a chat history and the latest user question
  which might reference context in the chat history, formulate a standalone question
  which can be understood without the chat history. Do NOT answer the question,
  just reformulate it if needed and otherwise return it as is.`;

const qaSystemPrompt = [
    `You are a psychologist or mental health therapist. Use the following pieces of retrieved context to answer the question.`,
    `Use three sentences maximum and keep the answer concise. Keep answers simple for common man to understand.`,
    `Do not use any other knowledge except the context provided.`,
    `If you don't know the answer, say that you don't know.`,
    `\n\n`,
    `{context}`,
].join('');

const generateAnswer = async (query, history, indexName) => {
    let modifiedQuery = query;
    let chatHistory = convertHistory(history);
    const response = { tokens: 0 };

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex: pinecone.Index(indexName),
    });

    if (chatHistory.length > 0) {
        const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
            ['system', contextualizeQSystemPrompt],
            new MessagesPlaceholder('chat_history'),
            ['human', '{input}'],
        ]);

        const contextualizeQChain = RunnableSequence.from([
            contextualizeQPrompt,
            llm,
        ]);

        const intermediate = await contextualizeQChain.invoke({
            input: query,
            chat_history: chatHistory,
        });

        response.intermediate = intermediate;
        modifiedQuery = intermediate.content;
        response.tokens =
            response.tokens + intermediate.usage_metadata.total_tokens;
    }

    const prompt = ChatPromptTemplate.fromMessages([
        ['system', qaSystemPrompt],
        ['human', '{question}'],
    ]);

    const ragChain = RunnableSequence.from([prompt, llm]);

    const context = await vectorStore.asRetriever().invoke(modifiedQuery);

    const results = await ragChain.invoke({
        context,
        question: modifiedQuery,
    });

    response.final = results;
    response.question = modifiedQuery;
    response.answer = results.content;
    response.tokens = response.tokens + results.usage_metadata.total_tokens;

    return response;
};

const convertHistory = (chat) => {
    const chatHistory = [];

    for (i = 0; i < chat.history.length; i++) {
        const chatMessage = chat.history[i];
        if (chatMessage.user === 'ai') {
            chatHistory.push(new AIMessage(chatMessage.message));
        } else {
            chatHistory.push(new HumanMessage(chatMessage.message));
        }
    }

    return chatHistory;
};

module.exports = {
    generateAnswer,
};
