import express from "express";
const app = express();
const port = 42069;
import * as cheerio from "cheerio";
import moment from "moment";

const transformData = (html) => {
  const output = [];
  const $ = cheerio.load(html);

  const firstRows = $("tr.dep-row-first");
  const secondRows = $("tr.dep-row-second");

  firstRows.each((index, row) => {
    const destination = $(row).find("td:eq(0) > h3").text().trim();
    const number = $(row)
      .find("td:eq(1) > span:eq(1) > span > h3")
      .text()
      .trim()
      .split(" ")[1]
      .trim();
    const time = $(row).find("td:eq(2) > h3").text().trim();
    const delay = $(secondRows[index]).find("td:eq(2) > a").text().trim();
    // Is it tomorrow's connection? If so, return
    if (time.includes(" ")) {
      return output;
    }
    // Undefined = unknown delay, 0 = on time, >0 = delay in minutes
    let transformedDelay;
    if (/\d/.test(delay)) {
      transformedDelay = parseInt(delay.replace(/\D/g, ""));
    } else if (delay.includes("bez")) {
      transformedDelay = 0;
    }
    // Is the connection leaving soon? If yes, blinking is true.
    const scheduledDate = moment(time, "H:mm");
    const delayedDate = scheduledDate.clone().add(delay, "minutes");
    const currentDate = moment();
    const blinking = delayedDate.diff(currentDate, "minutes") <= 5;
    output.push({
      destination,
      number,
      scheduled: time,
      delay: transformedDelay,
      blinking,
    });
  });

  return output;
};

const logRequestInfo = (req, res, next) => {
  const currentTime = new Date().toLocaleString();
  console.log(`[${currentTime}]`);
  next();
};

app.use(logRequestInfo);

app.get("/", async (req, res) => {
  const natratiFunction = async () => {
    const busResponse = await fetch(
      "https://idos.idnes.cz/vlakyautobusymhdvse/odjezdy/vysledky/?f=Olomouc,,Na%20trati&fc=200003"
    );
    const busHtml = await busResponse.text();
    const busTransformedData = transformData(busHtml);

    const trainResponse = await fetch(
      "https://idos.idnes.cz/vlakyautobusymhdvse/odjezdy/vysledky/?f=Olomouc-Hej%C4%8D%C3%ADn&fc=100003"
    );
    const trainHtml = await trainResponse.text();
    const trainTransformedData = transformData(trainHtml);

    const transformedData = [...busTransformedData, ...trainTransformedData];
    transformedData.sort((a, b) => {
      const timeA = moment(a.scheduled, "H:mm");
      const timeB = moment(b.scheduled, "H:mm");
      return timeA.isBefore(timeB) ? -1 : 1;
    });

    return transformedData.slice(0, 4);
  };
  const ladovaFunction = async () => {
    const response = await fetch(
      "https://idos.idnes.cz/vlakyautobusymhdvse/odjezdy/vysledky/?f=Olomouc,,Ladova&fc=200003"
    );
    const html = await response.text();
    const transformedData = transformData(html);

    return transformedData.slice(0, 4);
  };
  const natratiResult = await natratiFunction();
  const ladovaResult = await ladovaFunction();
  res.json({ natrati: natratiResult, ladova: ladovaResult });
});

app.listen(port, () => console.log("Listening on http://localhost:" + port));
