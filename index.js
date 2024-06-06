const portArgIndex = process.argv.indexOf("-p");
const port = portArgIndex !== -1 ? process.argv[portArgIndex + 1] : 42069;

import express from "express";
import cors from "cors";
const app = express();
import * as cheerio from "cheerio";
import moment from "moment";

app.use(cors());
const logRequestInfo = (req, res, next) => {
  const currentTime = new Date().toLocaleString();
  console.log(`[${currentTime}]`);
  next();
};
app.use(logRequestInfo);

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
      .split(" ")
      .pop()
      .replace(/\D/g, "");
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
    output.push({
      destination,
      number,
      scheduled: time,
      delay: transformedDelay,
    });
  });

  return output;
};

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

  return transformedData.slice(0, 3);
};

const ladovaFunction = async () => {
  const response = await fetch(
    "https://idos.idnes.cz/vlakyautobusymhdvse/odjezdy/vysledky/?f=Olomouc,,Ladova&fc=200003"
  );
  const html = await response.text();
  const transformedData = transformData(html);

  return transformedData.slice(0, 3);
};

app.get("/", async (req, res) => {
  try {
    const [natratiResult, ladovaResult] = await Promise.all([
      natratiFunction(),
      ladovaFunction(),
    ]);
    const result = { natrati: natratiResult, ladova: ladovaResult };
    console.log(result);
    res.json(result);
  } catch {
    res.status(500).json({ error: "Couldn't fetch data from IDOS" });
  }
});

app.listen(port, () => console.log("Listening on http://localhost:" + port));
