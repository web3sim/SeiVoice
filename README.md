# SeiVoice

SeiVoice is a voice-powered blockchain assistant that allows users to interact with blockchain functionalities via phone calls. The system integrates **Twilio** for voice handling and **OpenAI** for AI-powered responses, combined with **on-chain tools** for seamless blockchain interactions.

## 🚀 Features

- **Voice-based Blockchain Commands**: Users can speak commands to interact with the blockchain.
- **Real-time AI Responses**: Uses OpenAI to interpret voice commands and generate intelligent responses.
- **On-Chain Transactions**: Supports Ethereum-based transactions, token transfers, and NFT queries.
- **Seamless Twilio Integration**: Calls are handled smoothly without abrupt disconnections.
- **Multi-turn Conversations**: Keeps the call open for multiple interactions within the same session.



## 📞 How It Works

1. **User Calls Twilio Number** → The system greets them and asks for a command.
2. **User Speaks a Command** → SeiVoice captures the speech and transcribes it.
3. **AI Processes Command** → OpenAI interprets the request and generates a response.
4. **Blockchain Execution** → If the command involves transactions, they are processed.
5. **Voice Response Back** → The system replies via voice and asks for more commands.


## 🔥 Example Commands

- **"What’s the price of Ethereum?"** → Fetches live ETH price.
- **"Send 0.1 ETH to 0x123...456"** → Initiates a blockchain transaction.
- **"Who owns this NFT?"** → Fetches NFT ownership details.


## 🚨 Troubleshooting

- **Call disconnects after first query?**
  - Ensure `twiml.gather()` is used instead of `twiml.record()`.
  - Restart the server and update the Twilio webhook.

- **Not receiving voice input?**
  - Check Twilio logs for errors.
  - Ensure the `speech` input mode is enabled in `twiml.gather()`.


## 📌 Future Improvements

- Add **SMS support** for additional blockchain interactions.
- Improve **multi-turn conversations** with better AI context retention.
- Integrate **more blockchain networks** beyond Ethereum.


## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or PRs on GitHub.


## 📜 License

This project is open-source under the **MIT License**.
