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
  const textToAvoid = "10:30";

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Comprobar si el h5 que contiene el texto "SOLO ARGENTINA" está presente
    const elementsWithTextToFind = await page.evaluate((text) => {
      return Array.from(document.querySelectorAll("h5")).filter((element) =>
        element.innerText.includes(text)
      );
    }, textToFind);

    // Comprobar si el texto "10:30" está presente en la página
    const hasTextToAvoid = await page.evaluate(
      (text) => document.body.innerText.includes(text),
      textToAvoid
    );

    if (elementsWithTextToFind.length > 0 && !hasTextToAvoid) {
      console.log(
        'El texto "SOLO ARGENTINA" ha sido encontrado en la página y el texto "10:30" no está presente.'
      );

      // Enviar notificación al canal con el mensaje y el enlace de la página
      const message = `Hay turnos para Argentina en ${url}`;
      await bot.sendMessage(CHANNEL_NAME, message);
    } else {
      console.log(
        'No hay turnos o el texto "10:30" está presente en la página.'
      );

      // Enviar notificación al canal si no hay turnos o el texto "10:30" está presente
      const message = `No hay turnos`;
      await bot.sendMessage(CHANNEL_NAME, message);
    }

    await browser.close();
  } catch (error) {
    console.error("Error al buscar turnos:", error);

    // Enviar notificación al canal en caso de error
    const message = `Mensaje del bot ${bot.bot_username}:\n\nError al buscar turnos`;
    await bot.sendMessage(CHANNEL_NAME, message);
  }
}

// Llamar a la función de búsqueda al iniciar el bot
checkPage();

// Llamar a la función cada 30 minutos (1800000 ms)
setInterval(checkPage, 1800000);
