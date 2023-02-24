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

    // const response = {
    //   "geocoded_waypoints":
    //     [
    //       {
    //         "geocoder_status": "OK",
    //         "place_id": "ChIJ7cv00DwsDogRAMDACa2m4K8",
    //         "types": ["locality", "political"],
    //       },
    //       {
    //         "geocoder_status": "OK",
    //         "place_id": "ChIJ69Pk6jdlyIcRDqM1KDY3Fpg",
    //         "types": ["locality", "political"],
    //       },
    //       {
    //         "geocoder_status": "OK",
    //         "place_id": "ChIJgdL4flSKrYcRnTpP0XQSojM",
    //         "types": ["locality", "political"],
    //       },
    //       {
    //         "geocoder_status": "OK",
    //         "place_id": "ChIJE9on3F3HwoAR9AhGJW_fL-I",
    //         "types": ["locality", "political"],
    //       },
    //     ],
    //   "routes":
    //     [
    //       {
    //         "bounds":
    //           {
    //             "northeast": { "lat": 41.8781139, "lng": -87.6297872 },
    //             "southwest": { "lat": 34.0523525, "lng": -118.2435717 },
    //           },
    //         "copyrights": "Map data ©2022 Google, INEGI",
    //         "legs":
    //           [
    //             {
    //               "distance": { "text": "579 km", "value": 932311 },
    //               "duration": { "text": "8 hours 48 mins", "value": 31653 },
    //               "duration_in_traffic": { "text": "8 hours 55 mins", "value": 932311 },
    //               "end_address": "Panvel",
    //               "end_location": { "lat": 37.0842449, "lng": -94.513284 },
    //               "start_address": "Mumbai",
    //               "start_location": { "lat": 41.8781139, "lng": -87.6297872 },
    //               "steps":
    //                 [
    //                   {
    //                     "distance": { "text": "443 ft", "value": 135 },
    //                     "duration": { "text": "1 min", "value": 24 },
    //                     "end_location": { "lat": 41.8769003, "lng": -87.6297353 },
    //                     "html_instructions": "Head <b>south</b> on <b>S Federal St</b> toward <b>W Van Buren St</b>",
    //                     "polyline": { "points": "eir~FdezuOdCEjBC" },
    //                     "start_location": { "lat": 41.8781139, "lng": -87.6297872 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "269 ft", "value": 82 },
    //                     "duration": { "text": "1 min", "value": 20 },
    //                     "end_location": { "lat": 41.8768866, "lng": -87.63073 },
    //                     "html_instructions": "Turn <b>right</b> at the 1st cross street onto <b>W Van Buren St</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": { "points": "sar~FzdzuO@fC?|@" },
    //                     "start_location": { "lat": 41.8769003, "lng": -87.6297353 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.6 mi", "value": 887 },
    //                     "duration": { "text": "3 mins", "value": 182 },
    //                     "end_location": { "lat": 41.8689131, "lng": -87.630596 },
    //                     "html_instructions": "Turn <b>left</b> at the 1st cross street onto <b>S Clark St</b>",
    //                     "maneuver": "turn-left",
    //                     "polyline":
    //                       {
    //                         "points": "qar~F`kzuOlBAb@?zA?\\CnBAZAt@?P?xAAl@C~EGxA?pAAJ?bAAL?NDr@?d@@J?f@?XAf@?rBAH?T?\\?B?v@AZ?",
    //                       },
    //                     "start_location": { "lat": 41.8768866, "lng": -87.63073 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "1.1 mi", "value": 1777 },
    //                     "duration": { "text": "3 mins", "value": 196 },
    //                     "end_location": { "lat": 41.852949, "lng": -87.6300619 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>S Clark St</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":{},
    //                     "start_location": { "lat": 41.8689131, "lng": -87.630596 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "269 ft", "value": 82 },
    //                     "duration": { "text": "1 min", "value": 20 },
    //                     "end_location": { "lat": 41.85294, "lng": -87.6310536 },
    //                     "html_instructions": "Turn <b>right</b> onto <b>W Cermak Rd</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 41.852949, "lng": -87.6300619 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.2 mi", "value": 336 },
    //                     "duration": { "text": "1 min", "value": 36 },
    //                     "end_location": { "lat": 41.8500987, "lng": -87.6310927 },
    //                     "html_instructions": "Turn <b>left</b> onto the <b>I-55 S</b>/<wbr/><b>I-90 E</b>/<wbr/><b>I-94 E</b> ramp",
    //                     "maneuver": "ramp-left",
    //                     "polyline":
    //                       {},
    //                     "start_location": { "lat": 41.85294, "lng": -87.6310536 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "136 mi", "value": 218546 },
    //                     "duration": { "text": "2 hours 4 mins", "value": 7436 },
    //                     "end_location":
    //                       { "lat": 40.4505676, "lng": -89.02339479999999 },
    //                     "html_instructions": 'Keep <b>right</b> at the fork, follow signs for <b>I-55 S</b>/<wbr/><b>St Louis</b>/<wbr/><b>Stevenson Expy</b> and merge onto <b>I-55 S</b>/<wbr/><b>Stevenson Expy</b><div style="font-size:0.9em">Continue to follow I-55 S</div>',
    //                     "maneuver": "fork-right",
    //                     "polyline":{}
    //                     ,
    //                     "start_location": { "lat": 41.8500987, "lng": -87.6310927 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "60.6 mi", "value": 97481 },
    //                     "duration": { "text": "53 mins", "value": 3167 },
    //                     "end_location":
    //                       { "lat": 39.7905528, "lng": -89.59839989999999 },
    //                     "html_instructions": "Keep <b>right</b> at the fork to stay on <b>I-55 S</b>",
    //                     "maneuver": "fork-right",
    //                     "polyline": {}
    //                     ,
    //                     "start_location":
    //                       { "lat": 40.4505676, "lng": -89.02339479999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "4.2 mi", "value": 6768 },
    //                     "duration": { "text": "4 mins", "value": 233 },
    //                     "end_location":
    //                       { "lat": 39.74389, "lng": -89.63554889999999 },
    //                     "html_instructions": "Keep <b>left</b> to continue on <b>I-55 S</b>/<wbr/><b>I-72 W</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline": {},
    //                     "start_location":
    //                       { "lat": 39.7905528, "lng": -89.59839989999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "81.5 mi", "value": 131189 },
    //                     "duration": { "text": "1 hour 10 mins", "value": 4186 },
    //                     "end_location": { "lat": 38.6805444, "lng": -90.0121054 },
    //                     "html_instructions": "Keep <b>left</b> at the fork to continue on <b>I-55 S</b>, follow signs for <b>St Louis</b>",
    //                     "maneuver": "fork-left",
    //                     "polyline": {},
    //                     "start_location":
    //                       { "lat": 39.74389, "lng": -89.63554889999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "7.8 mi", "value": 12590 },
    //                     "duration": { "text": "7 mins", "value": 419 },
    //                     "end_location": { "lat": 38.6358417, "lng": -90.1380288 },
    //                     "html_instructions": "Keep <b>left</b> to continue on <b>I-55 S</b>/<wbr/><b>I-70 W</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline": {},
    //                     "start_location": { "lat": 38.6805444, "lng": -90.0121054 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "1.0 mi", "value": 1575 },
    //                     "duration": { "text": "1 min", "value": 67 },
    //                     "end_location":
    //                       { "lat": 38.63079380000001, "lng": -90.1541232 },
    //                     "html_instructions": "Keep <b>left</b> at the fork to continue on <b>I-55 S</b>",
    //                     "maneuver": "fork-left",
    //                     "polyline": {},
    //                     "start_location": { "lat": 38.6358417, "lng": -90.1380288 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.7 mi", "value": 1193 },
    //                     "duration": { "text": "1 min", "value": 48 },
    //                     "end_location":
    //                       { "lat": 38.6250805, "lng": -90.16470679999999 },
    //                     "html_instructions": "Keep <b>right</b> to continue on <b>I-55 S</b>/<wbr/><b>I-64 W</b>",
    //                     "maneuver": "keep-right",
    //                     "polyline":
    //                       {
    //                         "points": "maxjFffgePdAbDVr@Lf@J\\Nl@@DJ`@@BF^Jh@BT@BDb@D`@D\\NxAZhCHd@LzAFv@j@`EDTDPTbA?D\\lAFP@D?@DH@B?@Nb@@@?@Nb@@@Nb@@@Pd@R`@DJFL^p@?@j@|@@@@BJNd@n@DDd@h@\\^HFh@b@BBf@^\\PVNRJVJDB`A^v@PnB\\",
    //                       },
    //                     "start_location":
    //                       { "lat": 38.63079380000001, "lng": -90.1541232 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "1.7 mi", "value": 2672 },
    //                     "duration": { "text": "2 mins", "value": 106 },
    //                     "end_location":
    //                       { "lat": 38.6190308, "lng": -90.18641819999999 },
    //                     "html_instructions": 'Keep <b>left</b> to stay on <b>I-55 S</b>/<wbr/><b>I-64 W</b><div style="font-size:0.9em">Entering Missouri</div>',
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {
    //                         "points": "w}vjFlhiePtBVH@l@Jv@L~Cd@pARf@HL@H?j@H`BXhBXdHfAdAPv@TNDJB\\Lb@Tp@\\^Rd@ZNLj@`@j@j@FFLJ?@l@r@RTBFXb@f@v@@D@BTb@N\\Vh@ZbATp@Tz@VnALx@Jv@JhABb@@T?B@P?D?FDlA@z@Ar@Ad@Cl@?@Cl@KrAIr@CP[pBWtAIj@I^W`BGVCRKj@eBpKGZADEZ[bBeAdGEREVeA`G_@`CKj@Kj@Ij@Kj@a@`Ck@lDIj@Kj@k@lDCRCP",
    //                       },
    //                     "start_location":
    //                       { "lat": 38.6250805, "lng": -90.16470679999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.4 mi", "value": 603 },
    //                     "duration": { "text": "1 min", "value": 38 },
    //                     "end_location": { "lat": 38.6184369, "lng": -90.1908455 },
    //                     "html_instructions": "Take exit <b>40B W</b> for <b>I-44 W</b>",
    //                     "maneuver": "ramp-right",
    //                     "polyline":
    //                       {
    //                         "points": "}wujFbpmePKLGNELIXUr@ELCDIRQb@Wf@Yh@u@vAk@fAMTMVCJEJG\\CNAh@?RB`@BVFXHTHPBFBFHFPPRLPFx@TZD@?P@f@D\\@ZFHBLDJD^L^B",
    //                       },
    //                     "start_location":
    //                       { "lat": 38.6190308, "lng": -90.18641819999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.9 mi", "value": 1458 },
    //                     "duration": { "text": "1 min", "value": 60 },
    //                     "end_location": { "lat": 38.6112263, "lng": -90.2042965 },
    //                     "html_instructions": "Merge onto <b>I-44</b>/<wbr/><b>I-55 S</b>",
    //                     "maneuver": "merge",
    //                     "polyline":
    //                       {
    //                         "points": "gtujFxknePh@^z@j@JFp@d@TPfAt@b@Zb@XNJNJ|@p@n@l@XZVX\\f@Zf@PZXf@N\\P^Vn@`@xA~@vDZpA^`BZvADP@@TbAv@jDDPb@bB`@bBv@xCh@dBxH|U",
    //                       },
    //                     "start_location": { "lat": 38.6184369, "lng": -90.1908455 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "28.5 mi", "value": 45888 },
    //                     "duration": { "text": "27 mins", "value": 1606 },
    //                     "end_location":
    //                       { "lat": 38.5056275, "lng": -90.67413669999999 },
    //                     "html_instructions": "Keep <b>right</b> at the fork to continue on <b>I-44</b>",
    //                     "maneuver": "fork-right",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 38.6112263, "lng": -90.2042965 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "97.7 mi", "value": 157216 },
    //                     "duration": { "text": "1 hour 26 mins", "value": 5176 },
    //                     "end_location":
    //                       { "lat": 37.8367953, "lng": -92.09681309999999 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>I-44</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 38.5056275, "lng": -90.67413669999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "23.7 mi", "value": 38206 },
    //                     "duration": { "text": "21 mins", "value": 1257 },
    //                     "end_location": { "lat": 37.7545173, "lng": -92.5021009 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>I-44</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 37.8367953, "lng": -92.09681309999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "124 mi", "value": 199918 },
    //                     "duration": { "text": "1 hour 48 mins", "value": 6451 },
    //                     "end_location": { "lat": 37.0822984, "lng": -94.3601995 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>I-44</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 37.7545173, "lng": -92.5021009 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.2 mi", "value": 271 },
    //                     "duration": { "text": "1 min", "value": 12 },
    //                     "end_location":
    //                       { "lat": 37.0828531, "lng": -94.36316219999999 },
    //                     "html_instructions": "Take exit <b>15</b> toward <b>Duenweg</b>/<wbr/><b>Joplin</b>",
    //                     "maneuver": "ramp-right",
    //                     "polyline":
    //                       {  },
    //                     "start_location": { "lat": 37.0822984, "lng": -94.3601995 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "5.5 mi", "value": 8842 },
    //                     "duration": { "text": "8 mins", "value": 475 },
    //                     "end_location": { "lat": 37.0839082, "lng": -94.4627819 },
    //                     "html_instructions": "Continue onto <b>I-44BL W</b>",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 37.0828531, "lng": -94.36316219999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "2.8 mi", "value": 4508 },
    //                     "duration": { "text": "7 mins", "value": 412 },
    //                     "end_location": { "lat": 37.0840469, "lng": -94.5134959 },
    //                     "html_instructions": "Continue straight onto <b>I-44BL W</b>/<wbr/><b>E 7th St</b>",
    //                     "maneuver": "straight",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 37.0839082, "lng": -94.4627819 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "151 ft", "value": 46 },
    //                     "duration": { "text": "1 min", "value": 10 },
    //                     "end_location": { "lat": 37.0844619, "lng": -94.5134815 },
    //                     "html_instructions": "Turn <b>right</b> after Arvest Bank (on the left)",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 37.0840469, "lng": -94.5134959 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "59 ft", "value": 18 },
    //                     "duration": { "text": "1 min", "value": 4 },
    //                     "end_location": { "lat": 37.0844602, "lng": -94.5132756 },
    //                     "html_instructions": "Turn <b>right</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 37.0844619, "lng": -94.5134815 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "79 ft", "value": 24 },
    //                     "duration": { "text": "1 min", "value": 12 },
    //                     "end_location": { "lat": 37.0842449, "lng": -94.513284 },
    //                     "html_instructions": "Turn <b>right</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 37.0844602, "lng": -94.5132756 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                 ],
    //               "traffic_speed_entry": [],
    //               "via_waypoint": [],
    //             },
    //             {
    //               "distance": { "text": "217 km", "value": 349512 },
    //               "duration": { "text": "3 hours 17 mins", "value": 11799 },
    //               "duration_in_traffic": { "text": "3 hours 40 mins", "value": 932311 },
    //               "end_address": "Alephata",
    //               "end_location": { "lat": 35.4675612, "lng": -97.5164077 },
    //               "start_address": "Panvel",
    //               "start_location": { "lat": 37.0842449, "lng": -94.513284 },
    //               "steps":[
    //                   {
    //                     "distance": { "text": "443 ft", "value": 135 },
    //                     "duration": { "text": "1 min", "value": 24 },
    //                     "end_location": { "lat": 41.8769003, "lng": -87.6297353 },
    //                     "html_instructions": "Head <b>south</b> on <b>S Federal St</b> toward <b>W Van Buren St</b>",
    //                     "polyline": { "points": "eir~FdezuOdCEjBC" },
    //                     "start_location": { "lat": 41.8781139, "lng": -87.6297872 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "269 ft", "value": 82 },
    //                     "duration": { "text": "1 min", "value": 20 },
    //                     "end_location": { "lat": 41.8768866, "lng": -87.63073 },
    //                     "html_instructions": "Turn <b>right</b> at the 1st cross street onto <b>W Van Buren St</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": { "points": "sar~FzdzuO@fC?|@" },
    //                     "start_location": { "lat": 41.8769003, "lng": -87.6297353 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.6 mi", "value": 887 },
    //                     "duration": { "text": "3 mins", "value": 182 },
    //                     "end_location": { "lat": 41.8689131, "lng": -87.630596 },
    //                     "html_instructions": "Turn <b>left</b> at the 1st cross street onto <b>S Clark St</b>",
    //                     "maneuver": "turn-left",
    //                     "polyline":
    //                       {
    //                         "points": "qar~F`kzuOlBAb@?zA?\\CnBAZAt@?P?xAAl@C~EGxA?pAAJ?bAAL?NDr@?d@@J?f@?XAf@?rBAH?T?\\?B?v@AZ?",
    //                       },
    //                     "start_location": { "lat": 41.8768866, "lng": -87.63073 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "1.1 mi", "value": 1777 },
    //                     "duration": { "text": "3 mins", "value": 196 },
    //                     "end_location": { "lat": 41.852949, "lng": -87.6300619 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>S Clark St</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":{},
    //                     "start_location": { "lat": 41.8689131, "lng": -87.630596 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "269 ft", "value": 82 },
    //                     "duration": { "text": "1 min", "value": 20 },
    //                     "end_location": { "lat": 41.85294, "lng": -87.6310536 },
    //                     "html_instructions": "Turn <b>right</b> onto <b>W Cermak Rd</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 41.852949, "lng": -87.6300619 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.2 mi", "value": 336 },
    //                     "duration": { "text": "1 min", "value": 36 },
    //                     "end_location": { "lat": 41.8500987, "lng": -87.6310927 },
    //                     "html_instructions": "Turn <b>left</b> onto the <b>I-55 S</b>/<wbr/><b>I-90 E</b>/<wbr/><b>I-94 E</b> ramp",
    //                     "maneuver": "ramp-left",
    //                     "polyline":
    //                       {},
    //                     "start_location": { "lat": 41.85294, "lng": -87.6310536 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "136 mi", "value": 218546 },
    //                     "duration": { "text": "2 hours 4 mins", "value": 7436 },
    //                     "end_location":
    //                       { "lat": 40.4505676, "lng": -89.02339479999999 },
    //                     "html_instructions": 'Keep <b>right</b> at the fork, follow signs for <b>I-55 S</b>/<wbr/><b>St Louis</b>/<wbr/><b>Stevenson Expy</b> and merge onto <b>I-55 S</b>/<wbr/><b>Stevenson Expy</b><div style="font-size:0.9em">Continue to follow I-55 S</div>',
    //                     "maneuver": "fork-right",
    //                     "polyline":{}
    //                     ,
    //                     "start_location": { "lat": 41.8500987, "lng": -87.6310927 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "60.6 mi", "value": 97481 },
    //                     "duration": { "text": "53 mins", "value": 3167 },
    //                     "end_location":
    //                       { "lat": 39.7905528, "lng": -89.59839989999999 },
    //                     "html_instructions": "Keep <b>right</b> at the fork to stay on <b>I-55 S</b>",
    //                     "maneuver": "fork-right",
    //                     "polyline": {}
    //                     ,
    //                     "start_location":
    //                       { "lat": 40.4505676, "lng": -89.02339479999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "4.2 mi", "value": 6768 },
    //                     "duration": { "text": "4 mins", "value": 233 },
    //                     "end_location":
    //                       { "lat": 39.74389, "lng": -89.63554889999999 },
    //                     "html_instructions": "Keep <b>left</b> to continue on <b>I-55 S</b>/<wbr/><b>I-72 W</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline": {},
    //                     "start_location":
    //                       { "lat": 39.7905528, "lng": -89.59839989999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "81.5 mi", "value": 131189 },
    //                     "duration": { "text": "1 hour 10 mins", "value": 4186 },
    //                     "end_location": { "lat": 38.6805444, "lng": -90.0121054 },
    //                     "html_instructions": "Keep <b>left</b> at the fork to continue on <b>I-55 S</b>, follow signs for <b>St Louis</b>",
    //                     "maneuver": "fork-left",
    //                     "polyline": {},
    //                     "start_location":
    //                       { "lat": 39.74389, "lng": -89.63554889999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "7.8 mi", "value": 12590 },
    //                     "duration": { "text": "7 mins", "value": 419 },
    //                     "end_location": { "lat": 38.6358417, "lng": -90.1380288 },
    //                     "html_instructions": "Keep <b>left</b> to continue on <b>I-55 S</b>/<wbr/><b>I-70 W</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline": {},
    //                     "start_location": { "lat": 38.6805444, "lng": -90.0121054 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "1.0 mi", "value": 1575 },
    //                     "duration": { "text": "1 min", "value": 67 },
    //                     "end_location":
    //                       { "lat": 38.63079380000001, "lng": -90.1541232 },
    //                     "html_instructions": "Keep <b>left</b> at the fork to continue on <b>I-55 S</b>",
    //                     "maneuver": "fork-left",
    //                     "polyline": {},
    //                     "start_location": { "lat": 38.6358417, "lng": -90.1380288 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.7 mi", "value": 1193 },
    //                     "duration": { "text": "1 min", "value": 48 },
    //                     "end_location":
    //                       { "lat": 38.6250805, "lng": -90.16470679999999 },
    //                     "html_instructions": "Keep <b>right</b> to continue on <b>I-55 S</b>/<wbr/><b>I-64 W</b>",
    //                     "maneuver": "keep-right",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 38.63079380000001, "lng": -90.1541232 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "1.7 mi", "value": 2672 },
    //                     "duration": { "text": "2 mins", "value": 106 },
    //                     "end_location":
    //                       { "lat": 38.6190308, "lng": -90.18641819999999 },
    //                     "html_instructions": 'Keep <b>left</b> to stay on <b>I-55 S</b>/<wbr/><b>I-64 W</b><div style="font-size:0.9em">Entering Missouri</div>',
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 38.6250805, "lng": -90.16470679999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.4 mi", "value": 603 },
    //                     "duration": { "text": "1 min", "value": 38 },
    //                     "end_location": { "lat": 38.6184369, "lng": -90.1908455 },
    //                     "html_instructions": "Take exit <b>40B W</b> for <b>I-44 W</b>",
    //                     "maneuver": "ramp-right",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 38.6190308, "lng": -90.18641819999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.9 mi", "value": 1458 },
    //                     "duration": { "text": "1 min", "value": 60 },
    //                     "end_location": { "lat": 38.6112263, "lng": -90.2042965 },
    //                     "html_instructions": "Merge onto <b>I-44</b>/<wbr/><b>I-55 S</b>",
    //                     "maneuver": "merge",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 38.6184369, "lng": -90.1908455 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "28.5 mi", "value": 45888 },
    //                     "duration": { "text": "27 mins", "value": 1606 },
    //                     "end_location":
    //                       { "lat": 38.5056275, "lng": -90.67413669999999 },
    //                     "html_instructions": "Keep <b>right</b> at the fork to continue on <b>I-44</b>",
    //                     "maneuver": "fork-right",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 38.6112263, "lng": -90.2042965 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "97.7 mi", "value": 157216 },
    //                     "duration": { "text": "1 hour 26 mins", "value": 5176 },
    //                     "end_location":
    //                       { "lat": 37.8367953, "lng": -92.09681309999999 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>I-44</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 38.5056275, "lng": -90.67413669999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "23.7 mi", "value": 38206 },
    //                     "duration": { "text": "21 mins", "value": 1257 },
    //                     "end_location": { "lat": 37.7545173, "lng": -92.5021009 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>I-44</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 37.8367953, "lng": -92.09681309999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "124 mi", "value": 199918 },
    //                     "duration": { "text": "1 hour 48 mins", "value": 6451 },
    //                     "end_location": { "lat": 37.0822984, "lng": -94.3601995 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>I-44</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 37.7545173, "lng": -92.5021009 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.2 mi", "value": 271 },
    //                     "duration": { "text": "1 min", "value": 12 },
    //                     "end_location":
    //                       { "lat": 37.0828531, "lng": -94.36316219999999 },
    //                     "html_instructions": "Take exit <b>15</b> toward <b>Duenweg</b>/<wbr/><b>Joplin</b>",
    //                     "maneuver": "ramp-right",
    //                     "polyline":
    //                       {  },
    //                     "start_location": { "lat": 37.0822984, "lng": -94.3601995 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "5.5 mi", "value": 8842 },
    //                     "duration": { "text": "8 mins", "value": 475 },
    //                     "end_location": { "lat": 37.0839082, "lng": -94.4627819 },
    //                     "html_instructions": "Continue onto <b>I-44BL W</b>",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 37.0828531, "lng": -94.36316219999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "2.8 mi", "value": 4508 },
    //                     "duration": { "text": "7 mins", "value": 412 },
    //                     "end_location": { "lat": 37.0840469, "lng": -94.5134959 },
    //                     "html_instructions": "Continue straight onto <b>I-44BL W</b>/<wbr/><b>E 7th St</b>",
    //                     "maneuver": "straight",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 37.0839082, "lng": -94.4627819 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "151 ft", "value": 46 },
    //                     "duration": { "text": "1 min", "value": 10 },
    //                     "end_location": { "lat": 37.0844619, "lng": -94.5134815 },
    //                     "html_instructions": "Turn <b>right</b> after Arvest Bank (on the left)",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 37.0840469, "lng": -94.5134959 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "59 ft", "value": 18 },
    //                     "duration": { "text": "1 min", "value": 4 },
    //                     "end_location": { "lat": 37.0844602, "lng": -94.5132756 },
    //                     "html_instructions": "Turn <b>right</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 37.0844619, "lng": -94.5134815 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "79 ft", "value": 24 },
    //                     "duration": { "text": "1 min", "value": 12 },
    //                     "end_location": { "lat": 37.0842449, "lng": -94.513284 },
    //                     "html_instructions": "Turn <b>right</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 37.0844602, "lng": -94.5132756 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                 ],
    //               "traffic_speed_entry": [],
    //               "via_waypoint": [],
    //             },
    //             {
    //               "distance": { "text": "1,328 km", "value": 2137682 },
    //               "duration": { "text": "19 hours 28 mins", "value": 70097 },
    //               "duration_in_traffic": { "text": "20 hours 22 mins", "value": 932311 },
    //               "end_address": "Pune",
    //               "end_location": { "lat": 34.0523525, "lng": -118.2435717 },
    //               "start_address": "Alephata",
    //               "start_location": { "lat": 35.4675612, "lng": -97.5164077 },
    //                "steps":[
    //                   {
    //                     "distance": { "text": "443 ft", "value": 135 },
    //                     "duration": { "text": "1 min", "value": 24 },
    //                     "end_location": { "lat": 41.8769003, "lng": -87.6297353 },
    //                     "html_instructions": "Head <b>south</b> on <b>S Federal St</b> toward <b>W Van Buren St</b>",
    //                     "polyline": { "points": "eir~FdezuOdCEjBC" },
    //                     "start_location": { "lat": 41.8781139, "lng": -87.6297872 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "269 ft", "value": 82 },
    //                     "duration": { "text": "1 min", "value": 20 },
    //                     "end_location": { "lat": 41.8768866, "lng": -87.63073 },
    //                     "html_instructions": "Turn <b>right</b> at the 1st cross street onto <b>W Van Buren St</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": { "points": "sar~FzdzuO@fC?|@" },
    //                     "start_location": { "lat": 41.8769003, "lng": -87.6297353 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.6 mi", "value": 887 },
    //                     "duration": { "text": "3 mins", "value": 182 },
    //                     "end_location": { "lat": 41.8689131, "lng": -87.630596 },
    //                     "html_instructions": "Turn <b>left</b> at the 1st cross street onto <b>S Clark St</b>",
    //                     "maneuver": "turn-left",
    //                     "polyline":
    //                       {
    //                         "points": "qar~F`kzuOlBAb@?zA?\\CnBAZAt@?P?xAAl@C~EGxA?pAAJ?bAAL?NDr@?d@@J?f@?XAf@?rBAH?T?\\?B?v@AZ?",
    //                       },
    //                     "start_location": { "lat": 41.8768866, "lng": -87.63073 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "1.1 mi", "value": 1777 },
    //                     "duration": { "text": "3 mins", "value": 196 },
    //                     "end_location": { "lat": 41.852949, "lng": -87.6300619 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>S Clark St</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":{},
    //                     "start_location": { "lat": 41.8689131, "lng": -87.630596 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "269 ft", "value": 82 },
    //                     "duration": { "text": "1 min", "value": 20 },
    //                     "end_location": { "lat": 41.85294, "lng": -87.6310536 },
    //                     "html_instructions": "Turn <b>right</b> onto <b>W Cermak Rd</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 41.852949, "lng": -87.6300619 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.2 mi", "value": 336 },
    //                     "duration": { "text": "1 min", "value": 36 },
    //                     "end_location": { "lat": 41.8500987, "lng": -87.6310927 },
    //                     "html_instructions": "Turn <b>left</b> onto the <b>I-55 S</b>/<wbr/><b>I-90 E</b>/<wbr/><b>I-94 E</b> ramp",
    //                     "maneuver": "ramp-left",
    //                     "polyline":
    //                       {},
    //                     "start_location": { "lat": 41.85294, "lng": -87.6310536 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "136 mi", "value": 218546 },
    //                     "duration": { "text": "2 hours 4 mins", "value": 7436 },
    //                     "end_location":
    //                       { "lat": 40.4505676, "lng": -89.02339479999999 },
    //                     "html_instructions": 'Keep <b>right</b> at the fork, follow signs for <b>I-55 S</b>/<wbr/><b>St Louis</b>/<wbr/><b>Stevenson Expy</b> and merge onto <b>I-55 S</b>/<wbr/><b>Stevenson Expy</b><div style="font-size:0.9em">Continue to follow I-55 S</div>',
    //                     "maneuver": "fork-right",
    //                     "polyline":{}
    //                     ,
    //                     "start_location": { "lat": 41.8500987, "lng": -87.6310927 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "60.6 mi", "value": 97481 },
    //                     "duration": { "text": "53 mins", "value": 3167 },
    //                     "end_location":
    //                       { "lat": 39.7905528, "lng": -89.59839989999999 },
    //                     "html_instructions": "Keep <b>right</b> at the fork to stay on <b>I-55 S</b>",
    //                     "maneuver": "fork-right",
    //                     "polyline": {}
    //                     ,
    //                     "start_location":
    //                       { "lat": 40.4505676, "lng": -89.02339479999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "4.2 mi", "value": 6768 },
    //                     "duration": { "text": "4 mins", "value": 233 },
    //                     "end_location":
    //                       { "lat": 39.74389, "lng": -89.63554889999999 },
    //                     "html_instructions": "Keep <b>left</b> to continue on <b>I-55 S</b>/<wbr/><b>I-72 W</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline": {},
    //                     "start_location":
    //                       { "lat": 39.7905528, "lng": -89.59839989999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "81.5 mi", "value": 131189 },
    //                     "duration": { "text": "1 hour 10 mins", "value": 4186 },
    //                     "end_location": { "lat": 38.6805444, "lng": -90.0121054 },
    //                     "html_instructions": "Keep <b>left</b> at the fork to continue on <b>I-55 S</b>, follow signs for <b>St Louis</b>",
    //                     "maneuver": "fork-left",
    //                     "polyline": {},
    //                     "start_location":
    //                       { "lat": 39.74389, "lng": -89.63554889999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "7.8 mi", "value": 12590 },
    //                     "duration": { "text": "7 mins", "value": 419 },
    //                     "end_location": { "lat": 38.6358417, "lng": -90.1380288 },
    //                     "html_instructions": "Keep <b>left</b> to continue on <b>I-55 S</b>/<wbr/><b>I-70 W</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline": {},
    //                     "start_location": { "lat": 38.6805444, "lng": -90.0121054 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "1.0 mi", "value": 1575 },
    //                     "duration": { "text": "1 min", "value": 67 },
    //                     "end_location":
    //                       { "lat": 38.63079380000001, "lng": -90.1541232 },
    //                     "html_instructions": "Keep <b>left</b> at the fork to continue on <b>I-55 S</b>",
    //                     "maneuver": "fork-left",
    //                     "polyline": {},
    //                     "start_location": { "lat": 38.6358417, "lng": -90.1380288 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.7 mi", "value": 1193 },
    //                     "duration": { "text": "1 min", "value": 48 },
    //                     "end_location":
    //                       { "lat": 38.6250805, "lng": -90.16470679999999 },
    //                     "html_instructions": "Keep <b>right</b> to continue on <b>I-55 S</b>/<wbr/><b>I-64 W</b>",
    //                     "maneuver": "keep-right",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 38.63079380000001, "lng": -90.1541232 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "1.7 mi", "value": 2672 },
    //                     "duration": { "text": "2 mins", "value": 106 },
    //                     "end_location":
    //                       { "lat": 38.6190308, "lng": -90.18641819999999 },
    //                     "html_instructions": 'Keep <b>left</b> to stay on <b>I-55 S</b>/<wbr/><b>I-64 W</b><div style="font-size:0.9em">Entering Missouri</div>',
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 38.6250805, "lng": -90.16470679999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.4 mi", "value": 603 },
    //                     "duration": { "text": "1 min", "value": 38 },
    //                     "end_location": { "lat": 38.6184369, "lng": -90.1908455 },
    //                     "html_instructions": "Take exit <b>40B W</b> for <b>I-44 W</b>",
    //                     "maneuver": "ramp-right",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 38.6190308, "lng": -90.18641819999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.9 mi", "value": 1458 },
    //                     "duration": { "text": "1 min", "value": 60 },
    //                     "end_location": { "lat": 38.6112263, "lng": -90.2042965 },
    //                     "html_instructions": "Merge onto <b>I-44</b>/<wbr/><b>I-55 S</b>",
    //                     "maneuver": "merge",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 38.6184369, "lng": -90.1908455 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "28.5 mi", "value": 45888 },
    //                     "duration": { "text": "27 mins", "value": 1606 },
    //                     "end_location":
    //                       { "lat": 38.5056275, "lng": -90.67413669999999 },
    //                     "html_instructions": "Keep <b>right</b> at the fork to continue on <b>I-44</b>",
    //                     "maneuver": "fork-right",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 38.6112263, "lng": -90.2042965 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "97.7 mi", "value": 157216 },
    //                     "duration": { "text": "1 hour 26 mins", "value": 5176 },
    //                     "end_location":
    //                       { "lat": 37.8367953, "lng": -92.09681309999999 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>I-44</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 38.5056275, "lng": -90.67413669999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "23.7 mi", "value": 38206 },
    //                     "duration": { "text": "21 mins", "value": 1257 },
    //                     "end_location": { "lat": 37.7545173, "lng": -92.5021009 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>I-44</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 37.8367953, "lng": -92.09681309999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "124 mi", "value": 199918 },
    //                     "duration": { "text": "1 hour 48 mins", "value": 6451 },
    //                     "end_location": { "lat": 37.0822984, "lng": -94.3601995 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>I-44</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 37.7545173, "lng": -92.5021009 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.2 mi", "value": 271 },
    //                     "duration": { "text": "1 min", "value": 12 },
    //                     "end_location":
    //                       { "lat": 37.0828531, "lng": -94.36316219999999 },
    //                     "html_instructions": "Take exit <b>15</b> toward <b>Duenweg</b>/<wbr/><b>Joplin</b>",
    //                     "maneuver": "ramp-right",
    //                     "polyline":
    //                       {  },
    //                     "start_location": { "lat": 37.0822984, "lng": -94.3601995 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "5.5 mi", "value": 8842 },
    //                     "duration": { "text": "8 mins", "value": 475 },
    //                     "end_location": { "lat": 37.0839082, "lng": -94.4627819 },
    //                     "html_instructions": "Continue onto <b>I-44BL W</b>",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 37.0828531, "lng": -94.36316219999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "2.8 mi", "value": 4508 },
    //                     "duration": { "text": "7 mins", "value": 412 },
    //                     "end_location": { "lat": 37.0840469, "lng": -94.5134959 },
    //                     "html_instructions": "Continue straight onto <b>I-44BL W</b>/<wbr/><b>E 7th St</b>",
    //                     "maneuver": "straight",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 37.0839082, "lng": -94.4627819 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "151 ft", "value": 46 },
    //                     "duration": { "text": "1 min", "value": 10 },
    //                     "end_location": { "lat": 37.0844619, "lng": -94.5134815 },
    //                     "html_instructions": "Turn <b>right</b> after Arvest Bank (on the left)",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 37.0840469, "lng": -94.5134959 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "59 ft", "value": 18 },
    //                     "duration": { "text": "1 min", "value": 4 },
    //                     "end_location": { "lat": 37.0844602, "lng": -94.5132756 },
    //                     "html_instructions": "Turn <b>right</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 37.0844619, "lng": -94.5134815 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "79 ft", "value": 24 },
    //                     "duration": { "text": "1 min", "value": 12 },
    //                     "end_location": { "lat": 37.0842449, "lng": -94.513284 },
    //                     "html_instructions": "Turn <b>right</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 37.0844602, "lng": -94.5132756 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                 ],
    //               "traffic_speed_entry": [],
    //               "via_waypoint": [],
    //             },
    //           ],
    //         "summary": "I-55 S and I-44",
    //         "warnings": [],
    //         "waypoint_order": [0, 1],
    //       },
    //       {
    //         "bounds":
    //           {
    //             "northeast": { "lat": 41.8781139, "lng": -87.6297872 },
    //             "southwest": { "lat": 34.0523525, "lng": -118.2435717 },
    //           },
    //         "copyrights": "Map data ©2022 Google, INEGI",
    //         "legs":
    //           [
    //             {
    //               "distance": { "text": "579 km", "value": 932311 },
    //               "duration": { "text": "7 hours 48 mins", "value": 31653 },
    //               "duration_in_traffic": { "text": "7 hours 55 mins", "value": 932311 },
    //               "end_address": "Eastern Express Highway",
    //               "end_location": { "lat": 37.0842449, "lng": -94.513284 },
    //               "start_address": "Mumbai",
    //               "start_location": { "lat": 41.8781139, "lng": -87.6297872 },
    //               "steps":
    //                 [
    //                   {
    //                     "distance": { "text": "443 ft", "value": 135 },
    //                     "duration": { "text": "1 min", "value": 24 },
    //                     "end_location": { "lat": 41.8769003, "lng": -87.6297353 },
    //                     "html_instructions": "Head <b>south</b> on <b>S Federal St</b> toward <b>W Van Buren St</b>",
    //                     "polyline": { "points": "eir~FdezuOdCEjBC" },
    //                     "start_location": { "lat": 41.8781139, "lng": -87.6297872 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "269 ft", "value": 82 },
    //                     "duration": { "text": "1 min", "value": 20 },
    //                     "end_location": { "lat": 41.8768866, "lng": -87.63073 },
    //                     "html_instructions": "Turn <b>right</b> at the 1st cross street onto <b>W Van Buren St</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": { "points": "sar~FzdzuO@fC?|@" },
    //                     "start_location": { "lat": 41.8769003, "lng": -87.6297353 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.6 mi", "value": 887 },
    //                     "duration": { "text": "3 mins", "value": 182 },
    //                     "end_location": { "lat": 41.8689131, "lng": -87.630596 },
    //                     "html_instructions": "Turn <b>left</b> at the 1st cross street onto <b>S Clark St</b>",
    //                     "maneuver": "turn-left",
    //                     "polyline":
    //                       {
    //                         "points": "qar~F`kzuOlBAb@?zA?\\CnBAZAt@?P?xAAl@C~EGxA?pAAJ?bAAL?NDr@?d@@J?f@?XAf@?rBAH?T?\\?B?v@AZ?",
    //                       },
    //                     "start_location": { "lat": 41.8768866, "lng": -87.63073 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "1.1 mi", "value": 1777 },
    //                     "duration": { "text": "3 mins", "value": 196 },
    //                     "end_location": { "lat": 41.852949, "lng": -87.6300619 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>S Clark St</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":{},
    //                     "start_location": { "lat": 41.8689131, "lng": -87.630596 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "269 ft", "value": 82 },
    //                     "duration": { "text": "1 min", "value": 20 },
    //                     "end_location": { "lat": 41.85294, "lng": -87.6310536 },
    //                     "html_instructions": "Turn <b>right</b> onto <b>W Cermak Rd</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 41.852949, "lng": -87.6300619 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.2 mi", "value": 336 },
    //                     "duration": { "text": "1 min", "value": 36 },
    //                     "end_location": { "lat": 41.8500987, "lng": -87.6310927 },
    //                     "html_instructions": "Turn <b>left</b> onto the <b>I-55 S</b>/<wbr/><b>I-90 E</b>/<wbr/><b>I-94 E</b> ramp",
    //                     "maneuver": "ramp-left",
    //                     "polyline":
    //                       {},
    //                     "start_location": { "lat": 41.85294, "lng": -87.6310536 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "136 mi", "value": 218546 },
    //                     "duration": { "text": "2 hours 4 mins", "value": 7436 },
    //                     "end_location":
    //                       { "lat": 40.4505676, "lng": -89.02339479999999 },
    //                     "html_instructions": 'Keep <b>right</b> at the fork, follow signs for <b>I-55 S</b>/<wbr/><b>St Louis</b>/<wbr/><b>Stevenson Expy</b> and merge onto <b>I-55 S</b>/<wbr/><b>Stevenson Expy</b><div style="font-size:0.9em">Continue to follow I-55 S</div>',
    //                     "maneuver": "fork-right",
    //                     "polyline":{}
    //                     ,
    //                     "start_location": { "lat": 41.8500987, "lng": -87.6310927 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "60.6 mi", "value": 97481 },
    //                     "duration": { "text": "53 mins", "value": 3167 },
    //                     "end_location":
    //                       { "lat": 39.7905528, "lng": -89.59839989999999 },
    //                     "html_instructions": "Keep <b>right</b> at the fork to stay on <b>I-55 S</b>",
    //                     "maneuver": "fork-right",
    //                     "polyline": {}
    //                     ,
    //                     "start_location":
    //                       { "lat": 40.4505676, "lng": -89.02339479999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "4.2 mi", "value": 6768 },
    //                     "duration": { "text": "4 mins", "value": 233 },
    //                     "end_location":
    //                       { "lat": 39.74389, "lng": -89.63554889999999 },
    //                     "html_instructions": "Keep <b>left</b> to continue on <b>I-55 S</b>/<wbr/><b>I-72 W</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline": {},
    //                     "start_location":
    //                       { "lat": 39.7905528, "lng": -89.59839989999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "81.5 mi", "value": 131189 },
    //                     "duration": { "text": "1 hour 10 mins", "value": 4186 },
    //                     "end_location": { "lat": 38.6805444, "lng": -90.0121054 },
    //                     "html_instructions": "Keep <b>left</b> at the fork to continue on <b>I-55 S</b>, follow signs for <b>St Louis</b>",
    //                     "maneuver": "fork-left",
    //                     "polyline": {},
    //                     "start_location":
    //                       { "lat": 39.74389, "lng": -89.63554889999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "7.8 mi", "value": 12590 },
    //                     "duration": { "text": "7 mins", "value": 419 },
    //                     "end_location": { "lat": 38.6358417, "lng": -90.1380288 },
    //                     "html_instructions": "Keep <b>left</b> to continue on <b>I-55 S</b>/<wbr/><b>I-70 W</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline": {},
    //                     "start_location": { "lat": 38.6805444, "lng": -90.0121054 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "1.0 mi", "value": 1575 },
    //                     "duration": { "text": "1 min", "value": 67 },
    //                     "end_location":
    //                       { "lat": 38.63079380000001, "lng": -90.1541232 },
    //                     "html_instructions": "Keep <b>left</b> at the fork to continue on <b>I-55 S</b>",
    //                     "maneuver": "fork-left",
    //                     "polyline": {},
    //                     "start_location": { "lat": 38.6358417, "lng": -90.1380288 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.7 mi", "value": 1193 },
    //                     "duration": { "text": "1 min", "value": 48 },
    //                     "end_location":
    //                       { "lat": 38.6250805, "lng": -90.16470679999999 },
    //                     "html_instructions": "Keep <b>right</b> to continue on <b>I-55 S</b>/<wbr/><b>I-64 W</b>",
    //                     "maneuver": "keep-right",
    //                     "polyline":
    //                       {
    //                         "points": "maxjFffgePdAbDVr@Lf@J\\Nl@@DJ`@@BF^Jh@BT@BDb@D`@D\\NxAZhCHd@LzAFv@j@`EDTDPTbA?D\\lAFP@D?@DH@B?@Nb@@@?@Nb@@@Nb@@@Pd@R`@DJFL^p@?@j@|@@@@BJNd@n@DDd@h@\\^HFh@b@BBf@^\\PVNRJVJDB`A^v@PnB\\",
    //                       },
    //                     "start_location":
    //                       { "lat": 38.63079380000001, "lng": -90.1541232 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "1.7 mi", "value": 2672 },
    //                     "duration": { "text": "2 mins", "value": 106 },
    //                     "end_location":
    //                       { "lat": 38.6190308, "lng": -90.18641819999999 },
    //                     "html_instructions": 'Keep <b>left</b> to stay on <b>I-55 S</b>/<wbr/><b>I-64 W</b><div style="font-size:0.9em">Entering Missouri</div>',
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {
    //                         "points": "w}vjFlhiePtBVH@l@Jv@L~Cd@pARf@HL@H?j@H`BXhBXdHfAdAPv@TNDJB\\Lb@Tp@\\^Rd@ZNLj@`@j@j@FFLJ?@l@r@RTBFXb@f@v@@D@BTb@N\\Vh@ZbATp@Tz@VnALx@Jv@JhABb@@T?B@P?D?FDlA@z@Ar@Ad@Cl@?@Cl@KrAIr@CP[pBWtAIj@I^W`BGVCRKj@eBpKGZADEZ[bBeAdGEREVeA`G_@`CKj@Kj@Ij@Kj@a@`Ck@lDIj@Kj@k@lDCRCP",
    //                       },
    //                     "start_location":
    //                       { "lat": 38.6250805, "lng": -90.16470679999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.4 mi", "value": 603 },
    //                     "duration": { "text": "1 min", "value": 38 },
    //                     "end_location": { "lat": 38.6184369, "lng": -90.1908455 },
    //                     "html_instructions": "Take exit <b>40B W</b> for <b>I-44 W</b>",
    //                     "maneuver": "ramp-right",
    //                     "polyline":
    //                       {
    //                         "points": "}wujFbpmePKLGNELIXUr@ELCDIRQb@Wf@Yh@u@vAk@fAMTMVCJEJG\\CNAh@?RB`@BVFXHTHPBFBFHFPPRLPFx@TZD@?P@f@D\\@ZFHBLDJD^L^B",
    //                       },
    //                     "start_location":
    //                       { "lat": 38.6190308, "lng": -90.18641819999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.9 mi", "value": 1458 },
    //                     "duration": { "text": "1 min", "value": 60 },
    //                     "end_location": { "lat": 38.6112263, "lng": -90.2042965 },
    //                     "html_instructions": "Merge onto <b>I-44</b>/<wbr/><b>I-55 S</b>",
    //                     "maneuver": "merge",
    //                     "polyline":
    //                       {
    //                         "points": "gtujFxknePh@^z@j@JFp@d@TPfAt@b@Zb@XNJNJ|@p@n@l@XZVX\\f@Zf@PZXf@N\\P^Vn@`@xA~@vDZpA^`BZvADP@@TbAv@jDDPb@bB`@bBv@xCh@dBxH|U",
    //                       },
    //                     "start_location": { "lat": 38.6184369, "lng": -90.1908455 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "28.5 mi", "value": 45888 },
    //                     "duration": { "text": "27 mins", "value": 1606 },
    //                     "end_location":
    //                       { "lat": 38.5056275, "lng": -90.67413669999999 },
    //                     "html_instructions": "Keep <b>right</b> at the fork to continue on <b>I-44</b>",
    //                     "maneuver": "fork-right",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 38.6112263, "lng": -90.2042965 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "97.7 mi", "value": 157216 },
    //                     "duration": { "text": "1 hour 26 mins", "value": 5176 },
    //                     "end_location":
    //                       { "lat": 37.8367953, "lng": -92.09681309999999 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>I-44</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 38.5056275, "lng": -90.67413669999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "23.7 mi", "value": 38206 },
    //                     "duration": { "text": "21 mins", "value": 1257 },
    //                     "end_location": { "lat": 37.7545173, "lng": -92.5021009 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>I-44</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 37.8367953, "lng": -92.09681309999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "124 mi", "value": 199918 },
    //                     "duration": { "text": "1 hour 48 mins", "value": 6451 },
    //                     "end_location": { "lat": 37.0822984, "lng": -94.3601995 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>I-44</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 37.7545173, "lng": -92.5021009 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.2 mi", "value": 271 },
    //                     "duration": { "text": "1 min", "value": 12 },
    //                     "end_location":
    //                       { "lat": 37.0828531, "lng": -94.36316219999999 },
    //                     "html_instructions": "Take exit <b>15</b> toward <b>Duenweg</b>/<wbr/><b>Joplin</b>",
    //                     "maneuver": "ramp-right",
    //                     "polyline":
    //                       {  },
    //                     "start_location": { "lat": 37.0822984, "lng": -94.3601995 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "5.5 mi", "value": 8842 },
    //                     "duration": { "text": "8 mins", "value": 475 },
    //                     "end_location": { "lat": 37.0839082, "lng": -94.4627819 },
    //                     "html_instructions": "Continue onto <b>I-44BL W</b>",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 37.0828531, "lng": -94.36316219999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "2.8 mi", "value": 4508 },
    //                     "duration": { "text": "7 mins", "value": 412 },
    //                     "end_location": { "lat": 37.0840469, "lng": -94.5134959 },
    //                     "html_instructions": "Continue straight onto <b>I-44BL W</b>/<wbr/><b>E 7th St</b>",
    //                     "maneuver": "straight",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 37.0839082, "lng": -94.4627819 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "151 ft", "value": 46 },
    //                     "duration": { "text": "1 min", "value": 10 },
    //                     "end_location": { "lat": 37.0844619, "lng": -94.5134815 },
    //                     "html_instructions": "Turn <b>right</b> after Arvest Bank (on the left)",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 37.0840469, "lng": -94.5134959 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "59 ft", "value": 18 },
    //                     "duration": { "text": "1 min", "value": 4 },
    //                     "end_location": { "lat": 37.0844602, "lng": -94.5132756 },
    //                     "html_instructions": "Turn <b>right</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 37.0844619, "lng": -94.5134815 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "79 ft", "value": 24 },
    //                     "duration": { "text": "1 min", "value": 12 },
    //                     "end_location": { "lat": 37.0842449, "lng": -94.513284 },
    //                     "html_instructions": "Turn <b>right</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 37.0844602, "lng": -94.5132756 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                 ],
    //               "traffic_speed_entry": [],
    //               "via_waypoint": [],
    //             },
    //             {
    //               "distance": { "text": "200 km", "value": 349512 },
    //               "duration": { "text": "2 hours 17 mins", "value": 11799 },
    //               "duration_in_traffic": { "text": "2 hours 40 mins", "value": 932311 },
    //               "end_address": "Lonavala",
    //               "end_location": { "lat": 35.4675612, "lng": -97.5164077 },
    //               "start_address": "Eastern Express Highway",
    //               "start_location": { "lat": 37.0842449, "lng": -94.513284 },
    //               "steps":[
    //                   {
    //                     "distance": { "text": "443 ft", "value": 135 },
    //                     "duration": { "text": "1 min", "value": 24 },
    //                     "end_location": { "lat": 41.8769003, "lng": -87.6297353 },
    //                     "html_instructions": "Head <b>south</b> on <b>S Federal St</b> toward <b>W Van Buren St</b>",
    //                     "polyline": { "points": "eir~FdezuOdCEjBC" },
    //                     "start_location": { "lat": 41.8781139, "lng": -87.6297872 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "269 ft", "value": 82 },
    //                     "duration": { "text": "1 min", "value": 20 },
    //                     "end_location": { "lat": 41.8768866, "lng": -87.63073 },
    //                     "html_instructions": "Turn <b>right</b> at the 1st cross street onto <b>W Van Buren St</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": { "points": "sar~FzdzuO@fC?|@" },
    //                     "start_location": { "lat": 41.8769003, "lng": -87.6297353 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.6 mi", "value": 887 },
    //                     "duration": { "text": "3 mins", "value": 182 },
    //                     "end_location": { "lat": 41.8689131, "lng": -87.630596 },
    //                     "html_instructions": "Turn <b>left</b> at the 1st cross street onto <b>S Clark St</b>",
    //                     "maneuver": "turn-left",
    //                     "polyline":
    //                       {
    //                         "points": "qar~F`kzuOlBAb@?zA?\\CnBAZAt@?P?xAAl@C~EGxA?pAAJ?bAAL?NDr@?d@@J?f@?XAf@?rBAH?T?\\?B?v@AZ?",
    //                       },
    //                     "start_location": { "lat": 41.8768866, "lng": -87.63073 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "1.1 mi", "value": 1777 },
    //                     "duration": { "text": "3 mins", "value": 196 },
    //                     "end_location": { "lat": 41.852949, "lng": -87.6300619 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>S Clark St</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":{},
    //                     "start_location": { "lat": 41.8689131, "lng": -87.630596 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "269 ft", "value": 82 },
    //                     "duration": { "text": "1 min", "value": 20 },
    //                     "end_location": { "lat": 41.85294, "lng": -87.6310536 },
    //                     "html_instructions": "Turn <b>right</b> onto <b>W Cermak Rd</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 41.852949, "lng": -87.6300619 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.2 mi", "value": 336 },
    //                     "duration": { "text": "1 min", "value": 36 },
    //                     "end_location": { "lat": 41.8500987, "lng": -87.6310927 },
    //                     "html_instructions": "Turn <b>left</b> onto the <b>I-55 S</b>/<wbr/><b>I-90 E</b>/<wbr/><b>I-94 E</b> ramp",
    //                     "maneuver": "ramp-left",
    //                     "polyline":
    //                       {},
    //                     "start_location": { "lat": 41.85294, "lng": -87.6310536 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "136 mi", "value": 218546 },
    //                     "duration": { "text": "2 hours 4 mins", "value": 7436 },
    //                     "end_location":
    //                       { "lat": 40.4505676, "lng": -89.02339479999999 },
    //                     "html_instructions": 'Keep <b>right</b> at the fork, follow signs for <b>I-55 S</b>/<wbr/><b>St Louis</b>/<wbr/><b>Stevenson Expy</b> and merge onto <b>I-55 S</b>/<wbr/><b>Stevenson Expy</b><div style="font-size:0.9em">Continue to follow I-55 S</div>',
    //                     "maneuver": "fork-right",
    //                     "polyline":{}
    //                     ,
    //                     "start_location": { "lat": 41.8500987, "lng": -87.6310927 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "60.6 mi", "value": 97481 },
    //                     "duration": { "text": "53 mins", "value": 3167 },
    //                     "end_location":
    //                       { "lat": 39.7905528, "lng": -89.59839989999999 },
    //                     "html_instructions": "Keep <b>right</b> at the fork to stay on <b>I-55 S</b>",
    //                     "maneuver": "fork-right",
    //                     "polyline": {}
    //                     ,
    //                     "start_location":
    //                       { "lat": 40.4505676, "lng": -89.02339479999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "4.2 mi", "value": 6768 },
    //                     "duration": { "text": "4 mins", "value": 233 },
    //                     "end_location":
    //                       { "lat": 39.74389, "lng": -89.63554889999999 },
    //                     "html_instructions": "Keep <b>left</b> to continue on <b>I-55 S</b>/<wbr/><b>I-72 W</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline": {},
    //                     "start_location":
    //                       { "lat": 39.7905528, "lng": -89.59839989999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "81.5 mi", "value": 131189 },
    //                     "duration": { "text": "1 hour 10 mins", "value": 4186 },
    //                     "end_location": { "lat": 38.6805444, "lng": -90.0121054 },
    //                     "html_instructions": "Keep <b>left</b> at the fork to continue on <b>I-55 S</b>, follow signs for <b>St Louis</b>",
    //                     "maneuver": "fork-left",
    //                     "polyline": {},
    //                     "start_location":
    //                       { "lat": 39.74389, "lng": -89.63554889999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "7.8 mi", "value": 12590 },
    //                     "duration": { "text": "7 mins", "value": 419 },
    //                     "end_location": { "lat": 38.6358417, "lng": -90.1380288 },
    //                     "html_instructions": "Keep <b>left</b> to continue on <b>I-55 S</b>/<wbr/><b>I-70 W</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline": {},
    //                     "start_location": { "lat": 38.6805444, "lng": -90.0121054 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "1.0 mi", "value": 1575 },
    //                     "duration": { "text": "1 min", "value": 67 },
    //                     "end_location":
    //                       { "lat": 38.63079380000001, "lng": -90.1541232 },
    //                     "html_instructions": "Keep <b>left</b> at the fork to continue on <b>I-55 S</b>",
    //                     "maneuver": "fork-left",
    //                     "polyline": {},
    //                     "start_location": { "lat": 38.6358417, "lng": -90.1380288 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.7 mi", "value": 1193 },
    //                     "duration": { "text": "1 min", "value": 48 },
    //                     "end_location":
    //                       { "lat": 38.6250805, "lng": -90.16470679999999 },
    //                     "html_instructions": "Keep <b>right</b> to continue on <b>I-55 S</b>/<wbr/><b>I-64 W</b>",
    //                     "maneuver": "keep-right",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 38.63079380000001, "lng": -90.1541232 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "1.7 mi", "value": 2672 },
    //                     "duration": { "text": "2 mins", "value": 106 },
    //                     "end_location":
    //                       { "lat": 38.6190308, "lng": -90.18641819999999 },
    //                     "html_instructions": 'Keep <b>left</b> to stay on <b>I-55 S</b>/<wbr/><b>I-64 W</b><div style="font-size:0.9em">Entering Missouri</div>',
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 38.6250805, "lng": -90.16470679999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.4 mi", "value": 603 },
    //                     "duration": { "text": "1 min", "value": 38 },
    //                     "end_location": { "lat": 38.6184369, "lng": -90.1908455 },
    //                     "html_instructions": "Take exit <b>40B W</b> for <b>I-44 W</b>",
    //                     "maneuver": "ramp-right",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 38.6190308, "lng": -90.18641819999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.9 mi", "value": 1458 },
    //                     "duration": { "text": "1 min", "value": 60 },
    //                     "end_location": { "lat": 38.6112263, "lng": -90.2042965 },
    //                     "html_instructions": "Merge onto <b>I-44</b>/<wbr/><b>I-55 S</b>",
    //                     "maneuver": "merge",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 38.6184369, "lng": -90.1908455 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "28.5 mi", "value": 45888 },
    //                     "duration": { "text": "27 mins", "value": 1606 },
    //                     "end_location":
    //                       { "lat": 38.5056275, "lng": -90.67413669999999 },
    //                     "html_instructions": "Keep <b>right</b> at the fork to continue on <b>I-44</b>",
    //                     "maneuver": "fork-right",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 38.6112263, "lng": -90.2042965 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "97.7 mi", "value": 157216 },
    //                     "duration": { "text": "1 hour 26 mins", "value": 5176 },
    //                     "end_location":
    //                       { "lat": 37.8367953, "lng": -92.09681309999999 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>I-44</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 38.5056275, "lng": -90.67413669999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "23.7 mi", "value": 38206 },
    //                     "duration": { "text": "21 mins", "value": 1257 },
    //                     "end_location": { "lat": 37.7545173, "lng": -92.5021009 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>I-44</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 37.8367953, "lng": -92.09681309999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "124 mi", "value": 199918 },
    //                     "duration": { "text": "1 hour 48 mins", "value": 6451 },
    //                     "end_location": { "lat": 37.0822984, "lng": -94.3601995 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>I-44</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 37.7545173, "lng": -92.5021009 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.2 mi", "value": 271 },
    //                     "duration": { "text": "1 min", "value": 12 },
    //                     "end_location":
    //                       { "lat": 37.0828531, "lng": -94.36316219999999 },
    //                     "html_instructions": "Take exit <b>15</b> toward <b>Duenweg</b>/<wbr/><b>Joplin</b>",
    //                     "maneuver": "ramp-right",
    //                     "polyline":
    //                       {  },
    //                     "start_location": { "lat": 37.0822984, "lng": -94.3601995 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "5.5 mi", "value": 8842 },
    //                     "duration": { "text": "8 mins", "value": 475 },
    //                     "end_location": { "lat": 37.0839082, "lng": -94.4627819 },
    //                     "html_instructions": "Continue onto <b>I-44BL W</b>",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 37.0828531, "lng": -94.36316219999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "2.8 mi", "value": 4508 },
    //                     "duration": { "text": "7 mins", "value": 412 },
    //                     "end_location": { "lat": 37.0840469, "lng": -94.5134959 },
    //                     "html_instructions": "Continue straight onto <b>I-44BL W</b>/<wbr/><b>E 7th St</b>",
    //                     "maneuver": "straight",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 37.0839082, "lng": -94.4627819 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "151 ft", "value": 46 },
    //                     "duration": { "text": "1 min", "value": 10 },
    //                     "end_location": { "lat": 37.0844619, "lng": -94.5134815 },
    //                     "html_instructions": "Turn <b>right</b> after Arvest Bank (on the left)",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 37.0840469, "lng": -94.5134959 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "59 ft", "value": 18 },
    //                     "duration": { "text": "1 min", "value": 4 },
    //                     "end_location": { "lat": 37.0844602, "lng": -94.5132756 },
    //                     "html_instructions": "Turn <b>right</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 37.0844619, "lng": -94.5134815 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "79 ft", "value": 24 },
    //                     "duration": { "text": "1 min", "value": 12 },
    //                     "end_location": { "lat": 37.0842449, "lng": -94.513284 },
    //                     "html_instructions": "Turn <b>right</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 37.0844602, "lng": -94.5132756 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                 ],
    //               "traffic_speed_entry": [],
    //               "via_waypoint": [],
    //             },
    //             {
    //               "distance": { "text": "1,28 km", "value": 2137682 },
    //               "duration": { "text": "1 hours 28 mins", "value": 70097 },
    //               "duration_in_traffic": { "text": "2 hours 22 mins", "value": 932311 },
    //               "end_address": "Pune",
    //               "end_location": { "lat": 34.0523525, "lng": -118.2435717 },
    //               "start_address": "Lonavala",
    //               "start_location": { "lat": 35.4675612, "lng": -97.5164077 },
    //                "steps":[
    //                   {
    //                     "distance": { "text": "443 ft", "value": 135 },
    //                     "duration": { "text": "1 min", "value": 24 },
    //                     "end_location": { "lat": 41.8769003, "lng": -87.6297353 },
    //                     "html_instructions": "Head <b>south</b> on <b>S Federal St</b> toward <b>W Van Buren St</b>",
    //                     "polyline": { "points": "eir~FdezuOdCEjBC" },
    //                     "start_location": { "lat": 41.8781139, "lng": -87.6297872 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "269 ft", "value": 82 },
    //                     "duration": { "text": "1 min", "value": 20 },
    //                     "end_location": { "lat": 41.8768866, "lng": -87.63073 },
    //                     "html_instructions": "Turn <b>right</b> at the 1st cross street onto <b>W Van Buren St</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": { "points": "sar~FzdzuO@fC?|@" },
    //                     "start_location": { "lat": 41.8769003, "lng": -87.6297353 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.6 mi", "value": 887 },
    //                     "duration": { "text": "3 mins", "value": 182 },
    //                     "end_location": { "lat": 41.8689131, "lng": -87.630596 },
    //                     "html_instructions": "Turn <b>left</b> at the 1st cross street onto <b>S Clark St</b>",
    //                     "maneuver": "turn-left",
    //                     "polyline":
    //                       {
    //                         "points": "qar~F`kzuOlBAb@?zA?\\CnBAZAt@?P?xAAl@C~EGxA?pAAJ?bAAL?NDr@?d@@J?f@?XAf@?rBAH?T?\\?B?v@AZ?",
    //                       },
    //                     "start_location": { "lat": 41.8768866, "lng": -87.63073 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "1.1 mi", "value": 1777 },
    //                     "duration": { "text": "3 mins", "value": 196 },
    //                     "end_location": { "lat": 41.852949, "lng": -87.6300619 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>S Clark St</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":{},
    //                     "start_location": { "lat": 41.8689131, "lng": -87.630596 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "269 ft", "value": 82 },
    //                     "duration": { "text": "1 min", "value": 20 },
    //                     "end_location": { "lat": 41.85294, "lng": -87.6310536 },
    //                     "html_instructions": "Turn <b>right</b> onto <b>W Cermak Rd</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 41.852949, "lng": -87.6300619 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.2 mi", "value": 336 },
    //                     "duration": { "text": "1 min", "value": 36 },
    //                     "end_location": { "lat": 41.8500987, "lng": -87.6310927 },
    //                     "html_instructions": "Turn <b>left</b> onto the <b>I-55 S</b>/<wbr/><b>I-90 E</b>/<wbr/><b>I-94 E</b> ramp",
    //                     "maneuver": "ramp-left",
    //                     "polyline":
    //                       {},
    //                     "start_location": { "lat": 41.85294, "lng": -87.6310536 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "136 mi", "value": 218546 },
    //                     "duration": { "text": "2 hours 4 mins", "value": 7436 },
    //                     "end_location":
    //                       { "lat": 40.4505676, "lng": -89.02339479999999 },
    //                     "html_instructions": 'Keep <b>right</b> at the fork, follow signs for <b>I-55 S</b>/<wbr/><b>St Louis</b>/<wbr/><b>Stevenson Expy</b> and merge onto <b>I-55 S</b>/<wbr/><b>Stevenson Expy</b><div style="font-size:0.9em">Continue to follow I-55 S</div>',
    //                     "maneuver": "fork-right",
    //                     "polyline":{}
    //                     ,
    //                     "start_location": { "lat": 41.8500987, "lng": -87.6310927 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "60.6 mi", "value": 97481 },
    //                     "duration": { "text": "53 mins", "value": 3167 },
    //                     "end_location":
    //                       { "lat": 39.7905528, "lng": -89.59839989999999 },
    //                     "html_instructions": "Keep <b>right</b> at the fork to stay on <b>I-55 S</b>",
    //                     "maneuver": "fork-right",
    //                     "polyline": {}
    //                     ,
    //                     "start_location":
    //                       { "lat": 40.4505676, "lng": -89.02339479999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "4.2 mi", "value": 6768 },
    //                     "duration": { "text": "4 mins", "value": 233 },
    //                     "end_location":
    //                       { "lat": 39.74389, "lng": -89.63554889999999 },
    //                     "html_instructions": "Keep <b>left</b> to continue on <b>I-55 S</b>/<wbr/><b>I-72 W</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline": {},
    //                     "start_location":
    //                       { "lat": 39.7905528, "lng": -89.59839989999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "81.5 mi", "value": 131189 },
    //                     "duration": { "text": "1 hour 10 mins", "value": 4186 },
    //                     "end_location": { "lat": 38.6805444, "lng": -90.0121054 },
    //                     "html_instructions": "Keep <b>left</b> at the fork to continue on <b>I-55 S</b>, follow signs for <b>St Louis</b>",
    //                     "maneuver": "fork-left",
    //                     "polyline": {},
    //                     "start_location":
    //                       { "lat": 39.74389, "lng": -89.63554889999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "7.8 mi", "value": 12590 },
    //                     "duration": { "text": "7 mins", "value": 419 },
    //                     "end_location": { "lat": 38.6358417, "lng": -90.1380288 },
    //                     "html_instructions": "Keep <b>left</b> to continue on <b>I-55 S</b>/<wbr/><b>I-70 W</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline": {},
    //                     "start_location": { "lat": 38.6805444, "lng": -90.0121054 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "1.0 mi", "value": 1575 },
    //                     "duration": { "text": "1 min", "value": 67 },
    //                     "end_location":
    //                       { "lat": 38.63079380000001, "lng": -90.1541232 },
    //                     "html_instructions": "Keep <b>left</b> at the fork to continue on <b>I-55 S</b>",
    //                     "maneuver": "fork-left",
    //                     "polyline": {},
    //                     "start_location": { "lat": 38.6358417, "lng": -90.1380288 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.7 mi", "value": 1193 },
    //                     "duration": { "text": "1 min", "value": 48 },
    //                     "end_location":
    //                       { "lat": 38.6250805, "lng": -90.16470679999999 },
    //                     "html_instructions": "Keep <b>right</b> to continue on <b>I-55 S</b>/<wbr/><b>I-64 W</b>",
    //                     "maneuver": "keep-right",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 38.63079380000001, "lng": -90.1541232 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "1.7 mi", "value": 2672 },
    //                     "duration": { "text": "2 mins", "value": 106 },
    //                     "end_location":
    //                       { "lat": 38.6190308, "lng": -90.18641819999999 },
    //                     "html_instructions": 'Keep <b>left</b> to stay on <b>I-55 S</b>/<wbr/><b>I-64 W</b><div style="font-size:0.9em">Entering Missouri</div>',
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 38.6250805, "lng": -90.16470679999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.4 mi", "value": 603 },
    //                     "duration": { "text": "1 min", "value": 38 },
    //                     "end_location": { "lat": 38.6184369, "lng": -90.1908455 },
    //                     "html_instructions": "Take exit <b>40B W</b> for <b>I-44 W</b>",
    //                     "maneuver": "ramp-right",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 38.6190308, "lng": -90.18641819999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.9 mi", "value": 1458 },
    //                     "duration": { "text": "1 min", "value": 60 },
    //                     "end_location": { "lat": 38.6112263, "lng": -90.2042965 },
    //                     "html_instructions": "Merge onto <b>I-44</b>/<wbr/><b>I-55 S</b>",
    //                     "maneuver": "merge",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 38.6184369, "lng": -90.1908455 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "28.5 mi", "value": 45888 },
    //                     "duration": { "text": "27 mins", "value": 1606 },
    //                     "end_location":
    //                       { "lat": 38.5056275, "lng": -90.67413669999999 },
    //                     "html_instructions": "Keep <b>right</b> at the fork to continue on <b>I-44</b>",
    //                     "maneuver": "fork-right",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 38.6112263, "lng": -90.2042965 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "97.7 mi", "value": 157216 },
    //                     "duration": { "text": "1 hour 26 mins", "value": 5176 },
    //                     "end_location":
    //                       { "lat": 37.8367953, "lng": -92.09681309999999 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>I-44</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 38.5056275, "lng": -90.67413669999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "23.7 mi", "value": 38206 },
    //                     "duration": { "text": "21 mins", "value": 1257 },
    //                     "end_location": { "lat": 37.7545173, "lng": -92.5021009 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>I-44</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 37.8367953, "lng": -92.09681309999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "124 mi", "value": 199918 },
    //                     "duration": { "text": "1 hour 48 mins", "value": 6451 },
    //                     "end_location": { "lat": 37.0822984, "lng": -94.3601995 },
    //                     "html_instructions": "Keep <b>left</b> to stay on <b>I-44</b>",
    //                     "maneuver": "keep-left",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 37.7545173, "lng": -92.5021009 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "0.2 mi", "value": 271 },
    //                     "duration": { "text": "1 min", "value": 12 },
    //                     "end_location":
    //                       { "lat": 37.0828531, "lng": -94.36316219999999 },
    //                     "html_instructions": "Take exit <b>15</b> toward <b>Duenweg</b>/<wbr/><b>Joplin</b>",
    //                     "maneuver": "ramp-right",
    //                     "polyline":
    //                       {  },
    //                     "start_location": { "lat": 37.0822984, "lng": -94.3601995 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "5.5 mi", "value": 8842 },
    //                     "duration": { "text": "8 mins", "value": 475 },
    //                     "end_location": { "lat": 37.0839082, "lng": -94.4627819 },
    //                     "html_instructions": "Continue onto <b>I-44BL W</b>",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location":
    //                       { "lat": 37.0828531, "lng": -94.36316219999999 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "2.8 mi", "value": 4508 },
    //                     "duration": { "text": "7 mins", "value": 412 },
    //                     "end_location": { "lat": 37.0840469, "lng": -94.5134959 },
    //                     "html_instructions": "Continue straight onto <b>I-44BL W</b>/<wbr/><b>E 7th St</b>",
    //                     "maneuver": "straight",
    //                     "polyline":
    //                       {

    //                       },
    //                     "start_location": { "lat": 37.0839082, "lng": -94.4627819 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "151 ft", "value": 46 },
    //                     "duration": { "text": "1 min", "value": 10 },
    //                     "end_location": { "lat": 37.0844619, "lng": -94.5134815 },
    //                     "html_instructions": "Turn <b>right</b> after Arvest Bank (on the left)",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 37.0840469, "lng": -94.5134959 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "59 ft", "value": 18 },
    //                     "duration": { "text": "1 min", "value": 4 },
    //                     "end_location": { "lat": 37.0844602, "lng": -94.5132756 },
    //                     "html_instructions": "Turn <b>right</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 37.0844619, "lng": -94.5134815 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                   {
    //                     "distance": { "text": "79 ft", "value": 24 },
    //                     "duration": { "text": "1 min", "value": 12 },
    //                     "end_location": { "lat": 37.0842449, "lng": -94.513284 },
    //                     "html_instructions": "Turn <b>right</b>",
    //                     "maneuver": "turn-right",
    //                     "polyline": {  },
    //                     "start_location": { "lat": 37.0844602, "lng": -94.5132756 },
    //                     "travel_mode": "DRIVING",
    //                   },
    //                 ],
    //               "traffic_speed_entry": [],
    //               "via_waypoint": [],
    //             },
    //           ],
    //         "summary": "I-55 S and I-44",
    //         "warnings": [],
    //         "waypoint_order": [0, 1],
    //       }
    //     ],
    //   "status": "OK",
    // };

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
