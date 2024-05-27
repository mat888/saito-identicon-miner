const { randomBytes } = require('crypto');
const { blake3 } = require("hash-wasm");
const secp256k1 = require('secp256k1');
const bs58 = require('bs58');
//const identicon = require('identicon')
const Identicon = require('identicon.js')
const Stripe = require('stripe')


const rs_usr_url = "https://saito.io/redsquare/?user_id="

function generateK() {
  // generate private key
  let privKey
  do {
   privKey = randomBytes(32)
  } while (!secp256k1.privateKeyVerify(privKey))

  // generate public key
  const pubKey = secp256k1.publicKeyCreate(privKey)

  // output keys
  const hex_prv = privKey.toString('hex');
  const b58_pub = bs58.encode(pubKey);

//  console.log('Private Key (hex):', hex_prv);
//  console.log('Public Key (b58):', b58_pub);

  const flex = document.getElementById('displayContainer');

  blake3(b58_pub).then((value) => {
//    console.log("Blake3 Hash of PubKey:", value);

    const data = new Identicon(value, {format: 'svg', size: 400, margin: 0}).toString();
    const keyDisplay = '<p>' + hex_prv + '<p>' + b58_pub +
                       rs_usr_url + b58_pub +
                       '</p></p><br><img src="data:image/svg+xml;base64,' + data + '">';

    const div = document.createElement('div');
    div.setAttribute('class', 'keyDisplay');
    div.innerHTML = keyDisplay;

    div.addEventListener("mouseover", function() {
      updatePubDisplay(b58_pub);
    });

    div.addEventListener('click', function() {
      saveK(b58_pub, hex_prv, div);
    });

    flex.appendChild(div);

  });
}

var saved_keys = {}

function saveK(pub, priv, div) {

  if (saved_keys[pub] == undefined) {
    saved_keys[pub] = {"priv":priv};
    div.style.border = "10px solid grey"
  }

  else {
    delete saved_keys[pub];
    div.style.border = "10px solid var(--bg)"
  }
  const jsonOutput = JSON.stringify(saved_keys);
  console.log(jsonOutput);
}

const pubDisp = document.getElementById("top-bar")
function updatePubDisplay(pub) {
  pubDisp.innerHTML = "<p>" + pub;
  pubDisp.innerHTML += "</p><a href=" + rs_usr_url + pub+ ">Saito Profile &#128279</a>";

}

for (var i = 0; i < 1000; i++) {
  generateK()
}



// Stripe Integration
/*
const stripe = Stripe('pk_test_51NSpYnLtA9WcBUtI7mOIXKyVVkefFe0O4xZs7tJ9Yu6exFjT7jEADs7gsOyv4YhMdQc6BR9iCikCa8ZB8FvZNkgN00eSsVDMNm');

const options = {
  layout: {
    type: 'tabs',
    defaultCollapsed: false,
  }
};
const elements = stripe.elements({ clientSecret, appearance });

const paymentElement = elements.create('payment', options);
paymentElement.mount('#payment-element');
*/

function post(data="test-data") {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
	  if (this.readyState == 4 && this.status == 200) {
	    console.log("readyState: ", this.readyState, "status: ", this.status);
	    console.log("responseText: ", this.responseText);
	  }
	};
	xhttp.open("POST", "/data", true);
	xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.send(JSON.stringify(data));
}

//post();

function copyToClipboard(text) {
  // Create a temporary textarea element
  const tempTextArea = document.createElement('textarea');
  
  // Set the value of the textarea to the desired text
  tempTextArea.value = text;
  
  // Append the textarea to the DOM
  document.body.appendChild(tempTextArea);
  
  // Select the text in the textarea
  tempTextArea.select();
  
  // Execute the 'copy' command to copy the selected text to the clipboard
  document.execCommand('copy');
  
  // Remove the temporary textarea from the DOM
  document.body.removeChild(tempTextArea);
}

document.getElementById("saveDB").addEventListener("click", function (){
	copyToClipboard(JSON.stringify(saved_keys).slice(1,-1) + ",");
});
