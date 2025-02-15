import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import twilio from 'twilio';
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { viem } from "@goat-sdk/wallet-viem";
import { sendETH } from "@goat-sdk/wallet-evm";
import { erc20, USDC } from "@goat-sdk/plugin-erc20";
import { coingecko } from "@goat-sdk/plugin-coingecko";
import { opensea } from "@goat-sdk/plugin-opensea";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { seiDevnet } from "viem/chains";

require("dotenv").config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_WHATSAPP_NUMBER,
    RPC_PROVIDER_URL,
    KEY,
    PORT = 3000,
    OPENAI_API_KEY
} = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER || !OPENAI_API_KEY) {
    console.error("❌ Missing required credentials in .env");
    process.exit(1);
}

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const account = privateKeyToAccount(KEY as `0x${string}`);
const walletClient = createWalletClient({
    account: account,
    transport: http(RPC_PROVIDER_URL),
    chain: seiDevnet,
});

(async () => {
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [
            sendETH(),
            erc20({ tokens: [USDC] }),
            coingecko({ apiKey: "CG-omKTqVxpPKToZaXWYBb8bCJJ" }),
            opensea(process.env.OPENSEA_API_KEY as string),
        ],
    });

    // ✅ Step 1: Handle Incoming Call & Start Speech Recognition
    app.post("/api/voice-call", (req, res) => {
        console.log("📞 Incoming call from:", req.body.From);

        const twiml = new twilio.twiml.VoiceResponse();
        twiml.say("Welcome to SeiVoice. Please say your blockchain request after the beep.");
        
        // ✅ Use `gather()` instead of `record()` to keep the call open
        twiml.gather({
            input: ["speech"],
            timeout: 5,
            speechTimeout: "auto",
            action: "/api/voice-process",
            method: "POST"
        });

        res.type("text/xml").send(twiml.toString());
    });

    // ✅ Step 2: Process Real-Time Speech & Keep Call Open
    app.post("/api/voice-process", async (req: Request, res: Response) => {
        console.log("📩 Twilio Payload:", req.body);

        const voiceText = req.body.SpeechResult;
        const callerNumber = req.body.From;

        if (!voiceText) {
            console.error("❌ No speech detected.");
            const twiml = new twilio.twiml.VoiceResponse();
            twiml.say("Sorry, I didn't hear that. Please try again.");

            // 🔥 Keep the call open for another question
            twiml.gather({
                input: ["speech"],
                timeout: 5,
                speechTimeout: "auto",
                action: "/api/voice-process",
                method: "POST"
            });

            res.type("text/xml").send(twiml.toString());
            return;
        }

        console.log(`🎙️ Voice Command from ${callerNumber}: ${voiceText}`);

        try {
            const result = await generateText({
                model: openai("gpt-4o-mini"),
                tools: tools,
                maxSteps: 10,
                prompt: voiceText,
            });

            console.log("✅ AI Response:", result.text);

            const twiml = new twilio.twiml.VoiceResponse();
            twiml.say(result.text);

            // 🔥 Keep the call open for another query
            twiml.gather({
                input: ["speech"],
                timeout: 5,
                speechTimeout: "auto",
                action: "/api/voice-process",
                method: "POST"
            });

            res.type("text/xml").send(twiml.toString());

        } catch (error) {
            console.error("❌ Error processing voice command:", error);
            const twiml = new twilio.twiml.VoiceResponse();
            twiml.say("There was an error processing your request.");

            // 🔥 Keep the call open for another query
            twiml.gather({
                input: ["speech"],
                timeout: 5,
                speechTimeout: "auto",
                action: "/api/voice-process",
                method: "POST"
            });

            res.type("text/xml").send(twiml.toString());
        }
    });

    app.listen(PORT, () => {
        console.log(`🔥 SeiVoice API is running on port ${PORT}`);
    });

})();
