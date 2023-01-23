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
      url: `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&mode=${mode}&departure_time=${departure_time}&language=fr-FR&key=${YOUR_API_KEY}`,
      headers: {},
    };

    let response = await axios(config);
    response = await response.data;

    // const sampleResponse = {
    //     destination_addresses: ["Pune"],
    //     origin_addresses: ["Mumbai"],
    //     rows: [
    //       {
    //         elements: [
    //           {
    //             distance: { text: "33.3 km", value: 33253 },
    //             duration: { text: "27 mins", value: 1620 },
    //             duration_in_traffic: { text: "34 mins", value: 2019 },
    //             status: "OK",
    //           },
    //           {
    //             distance: { text: "41.5 km", value: 41491 },
    //             duration: { text: "33 mins", value: 1981 },
    //             duration_in_traffic: { text: "39 mins", value: 2342 },
    //             status: "OK",
    //           },
    //         ],
    //       },
    //     ],
    //     status: "OK",
    //   };

    const routes = response.rows[0].elements.reduce((a, b, index) => {
      const { distance, duration, duration_in_traffic } = b;
      const route = index + 1;
      const str = `Route${route} is ${distance.text} long and can be covered in ${duration.text} normally and ${duration_in_traffic.text} during traffic or peak hours`;
      a.push(str);
      return a;
    }, []);

    return routes.join(" & ");
  } catch (e) {
    console.error("There was some error while getting routes details", e);
  }
}

app.listen(process.env.PORT || 3000, "127.0.0.1", () => {
  console.log("Server Running");
});
