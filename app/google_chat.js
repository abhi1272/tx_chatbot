app.post("/chat", (req, res) => {
  const { type, message } = req.body;

  if (type === "MESSAGE") {
    const userMessage = message.text;
    // Process the user message and respond
    const responseMessage = handleUserMessage(userMessage);
    res.json({
      text: responseMessage,
    });
  } else {
    res.sendStatus(200);
  }
});

const handleUserMessage = (userMessage) => {
  // Add logic to process user messages and return appropriate responses
  if (userMessage.includes("hello")) {
    return "Hello! How can I assist you today?";
  }
  // Add more cases as needed
  return "Sorry, I didn't understand that.";
};
