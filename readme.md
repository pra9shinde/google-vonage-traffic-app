# Get traffic details using Google Map and Vonage SMS API.

Using content in this repository, you can send an SMS to a virtual number and read that SMS in the nodejs app using Vonage API. Parse the source and destination from the SMS, get the traffic details on those routes using Google Map's Direction API and revert back with the details.

### Requirements

---

- [Node.js](https://nodejs.org/en/download/)
- [ngrok](https://ngrok.com/)
- [Vonage CLI](https://www.npmjs.com/package/@vonage/cli)
- [Google Direction API](https://developers.google.com/maps/documentation/directions/overview)

Sign in/Sign up for free developer.vonage.com; to be able to use the Vonage SMS API, you'll have to create a Vonage Application from the developer portal.

### Installation

---

Clone source code

```
https://github.com/pra9shinde/google-vonage-traffic-app.git
```

Go to the project folder

```
cd google-vonage-traffic-app
```

Install dependencies

```
npm install
```

Update the environment properties, and start your app with the following command, and configure the NgRok link on your vonage dashboard.

```
node receive.js
```

Now send a SMS with the text `Traffic between Mumbai and Pune` to the registered mobile number and you should receive the details as reply.

### License

---

The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
