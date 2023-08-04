const puppeteer = require("puppeteer");
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

const TELEGRAM_BOT_TOKEN = "6026938604:AAER13zEIn9cVmAfZNekNMt74L7xats2Zdg";

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

const CHANNEL_NAME = "@turnosbria"; // Nombre del canal público al que se reenviarán los mensajes

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  // Reenviar el mensaje al canal
  try {
    const messageText = `Mensaje del chat ${chatId}:\n\n${msg.text}`;
    await bot.sendMessage(CHANNEL_NAME, messageText);
    console.log(`Mensaje reenviado al canal desde el chat ${chatId}`);
  } catch (error) {
    console.error("Error al reenviar el mensaje:", error);
  }
});

async function checkPage() {
  const url = "https://entrevistasjavaia2024.setmore.com/bookclass";
  const textToFind = "SOLO ARGENTINA";

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Esperar a que el h5 que contiene el texto aparezca en la página
    await page.waitForXPath(`//h5[contains(text(), "${textToFind}")]`, {
      timeout: 10000, // Aumenta este tiempo si la página carga lentamente
    });

    console.log('El texto "SOLO ARGENTINA" ha sido encontrado en la página.');

    // Enviar notificación al canal con el mensaje y el enlace de la página
    const message = `Mensaje del bot ${bot.bot_username}:\n\nHay turnos para Argentina en ${url}`;
    await bot.sendMessage(CHANNEL_NAME, message);

    await browser.close();
  } catch (error) {
    console.error("No hay turnos:", error);

    // Enviar notificación al canal si no hay turnos
    const message = `Mensaje del bot ${bot.bot_username}:\n\nNo hay turnos`;
    await bot.sendMessage(CHANNEL_NAME, message);
  }
}

// Llamar a la función de búsqueda al iniciar el bot
checkPage();

// Llamar a la función cada 25 minutos (1600000 ms)
setInterval(checkPage, 1500000);
