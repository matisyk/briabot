const puppeteer = require("puppeteer");
const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
dotenv.config();
const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')

const PORT = process.env.PORT || 5001

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/cool', (req, res) => res.send(cool()))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_API_TOKEN;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

const CHANNEL_NAME = process.env.TELEGRAM_CHANNEL_NAME; // Nombre del canal público al que se reenviarán los mensajes

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
    const message = `Hay turnos para Argentina en ${url}`;
    await bot.sendMessage(CHANNEL_NAME, message);

    await browser.close();
  } catch (error) {
    console.error("No hay turnos:", error);

    // Enviar notificación al canal si no hay turnos
    const message = `No hay turnos`;
    await bot.sendMessage(CHANNEL_NAME, message);
  }
}

// Llamar a la función de búsqueda al iniciar el bot
checkPage();

// Llamar a la función cada 25 minutos (1600000 ms)
setInterval(checkPage, 1500000);
