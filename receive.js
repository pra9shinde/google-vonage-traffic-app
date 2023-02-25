const app = require("express")();
const bodyParser = require("body-parser");
var axios = require("axios");
var qs = require("qs");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.route("/webhooks/inbound-sms").get(handleInboundSms).post(handleInboundSms);

function handleInboundSms(request, response) {
  const params = Object.assign(request.query, request.body);
  getTrafficDetailsAndSendSMS(params);
  response.status(204).send();
}

function getTrafficDetailsAndSendSMS(params) {
  const { origin, destination } = parseText(params);
  const routes = getTrafficDetails({ origin, destination });
  sendSMS(params.msisdn, routes);
}

function parseText({ text }) {
  let sampleText = "Traffic between mumbai and pune";

  if (text) {
    sampleText = text;
  }

  sampleText = sampleText.trim();

  const characters = sampleText.split(" ");
  const origin = characters[2];
  const destination = characters[4];

  return { origin, destination };
}

async function sendSMS(msisdn, routes) {
  try {
    var data = qs.stringify({
      from: "Vonage APIs",
      text: routes,
      to: msisdn,
      api_key: process.env.VONAGE_API_KEY,
      api_secret: process.env.VONAGE_API_SECRET,
    });

    var config = {
      method: "post",
      url: "https://rest.nexmo.com/sms/json",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };

    let response = await axios(config);
    response = await response.data;
  } catch (e) {
    console.error("There was some error while sending sms", e);
  }
}

async function getTrafficDetails({ origins, destinations }) {
  try {
    const YOUR_API_KEY = process.env.GOOGLE_MAP_API_KEY;
    const mode = "driving";
    const departure_time = "now";
    var config = {
      method: "get",
      url: `https://maps.googleapis.com/maps/api/directions/json?origins=${origins}&destinations=${destinations}&mode=${mode}&departure_time=${departure_time}&language=en-US&key=${YOUR_API_KEY}`,
      headers: {},
    };

    let response = await axios(config);
    response = await response.data;

    const routes = getRoutes(response);
    return routes.join(" \n\n ");
  } catch (e) {
    console.error("There was some error while getting routes details", e);
  }
}

const getRoutes = ({ routes }) => {
  // calculate the overall distance of all the routes
  return routes.reduce((a, b, l) => {
    const { legs } = b;

    let via = "";
    let normalTime = 0;
    let timeInTraffic = 0;

    // for each route, calculate the distance path wise, from one to another
    const distance = legs.reduce((x, y, i) => {
      const { distance, duration, duration_in_traffic, steps, start_address, end_address } = y;
      normalTime += getTimeInMinutes(duration.text);
      timeInTraffic += getTimeInMinutes(duration_in_traffic.text);

      if (i !== legs.length - 1) {
        via = via ? via + " -> " + end_address : end_address;
      }

      const string = `From ${start_address} to ${end_address} it takes ${duration.text} normally and ${duration_in_traffic.text} in traffic to cover a distance of ${distance.text}`;

      x.push(string);
      return x;
    }, []);

    // for the final string
    const finalString = `Route${l + 1} via ${via} will take ${processTime(
      normalTime
    )} normally and ${processTime(
      timeInTraffic
    )} in traffic. Path via breakdown is:  ${distance.join(" AND ")}`;

    // push the string
    a.push(finalString);
    return a;
  }, []);
};

// helper function extract to hours and minutes from text
// and return time in minutes
const getTimeInMinutes = (timeText) => {
  timeText = timeText.split(" ");
  let hrs = timeText[0];
  let mins = timeText[2];
  return parseInt(hrs) * 60 + parseInt(mins);
};

// helper function to get hours and mins from the time
const processTime = (time) => {
  const hrs = Math.floor(time / 60);
  const mins = time % 60;
  return `${hrs} hours ${mins} mins`;
};

app.listen(process.env.PORT || 3000, "127.0.0.1", () => {
  console.log("Server Running");
});
