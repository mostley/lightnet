/*
 * 31 mar 2015
 * This sketch display UDP packets coming from an UDP client.
 * On a Mac the NC command can be used to send UDP. (nc -u 192.168.1.101 2390).
 *
 * Configuration : Enter the ssid and password of your Wifi AP. Enter the port number your server is listening on.
 *
 */

#include <ESP8266WiFi.h>
#include <WiFiUDP.h>
#include <ArduinoJson.h>

extern "C" {  //required for read Vdd Voltage
#include "user_interface.h"
  // uint16 readvdd33(void);
}

int status = WL_IDLE_STATUS;
const char* ssid = "matrix";  //  your network SSID (name)
const char* pass = "51whc3xt";       // your network password

byte packetBuffer[512]; //buffer to hold incoming and outgoing packets

// A UDP instance to let us send and receive packets over UDP
WiFiUDP Udp;
//IPAddress ipMulti(239, 255, 255, 250);
//IPAddress ipMulti(224, 0, 0, 1);
IPAddress ipMulti(239, 0, 0, 57);
unsigned int portMulti = 2525;

const char* serverAddress = "";
bool isInitialized = false;
WiFiClient client;

void setup()
{
  // Open serial communications and wait for port to open:
  Serial.begin(115200);
  /*while (!Serial) {
    ; // wait for serial port to connect.
  }*/

  // setting up Station AP
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, pass);

  // Wait for connect to AP
  Serial.print("[Connecting]");
  Serial.print(ssid);
  int tries=0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    tries++;
    if (tries > 30){
      break;
    }
  }
  Serial.println();


  printWifiStatus();

  Serial.println("Connected to wifi");

  if (!Udp.beginMulticast(WiFi.localIP(), ipMulti, portMulti)) {
  //if (!Udp.begin(portMulti)) {
    Serial.print("failed to start UDP Server at port ");
  } else {
    Serial.print("Udp Multicast server started at : ");
    Serial.print(ipMulti);
    Serial.print(":");
    Serial.println(portMulti);
  }
}

void loop()
{
  if (isInitialized) {
    handleLEDs();
  } else if (serverAddress == "") {
    listenForServer();
  } else {
    if (!lightIsRegistered()) {
      registerLight();
    } else {
      isInitialized = true;
    }
  }
}

void handleLEDs() {
  
}

void registerLight() {
  
}

bool lightIsRegistered() {
  bool result = false;
  
  Serial.println("trying to determine whether the light is already registered");
  
  if (client.connect(serverAddress, 80)) {
    client.print("GET /api/lights/");
    client.print(ESP.getFlashChipId());
    client.println(" HTTP/1.1");
    client.print("Host: ");
    client.println(serverAddress);
    client.println("Connection: close");
    client.println();

    delay(10);

    while(client.available()) {
      String line = client.readStringUntil('\r');
      Serial.print(line);
    }

    //TODO check for 404

  } else {
    Serial.print("failed to connect to the LightNet Server (");
    Serial.print(serverAddress);
    Serial.println(")");
  }
  
  return result;
}

void listenForServer()
{
  int noBytes = Udp.parsePacket();
  String received_command = "";

  if ( noBytes ) {
    Serial.print(millis() / 1000);
    Serial.print(":Packet of ");
    Serial.print(noBytes);
    Serial.print(" received from ");
    Serial.print(Udp.remoteIP());
    Serial.print(":");
    Serial.println(Udp.remotePort());
    // We've received a packet, read the data from it
    Udp.read(packetBuffer,noBytes); // read the packet into the buffer

    // display the packet contents in HEX
    for (int i=1;i<=noBytes;i++)
    {
      Serial.print(packetBuffer[i-1],HEX);
      received_command = received_command + char(packetBuffer[i - 1]);
      if (i % 32 == 0)
      {
        Serial.println();
      }
      else Serial.print(' ');
    } // end for
    Serial.println();

    Udp.beginPacket(Udp.remoteIP(), Udp.remotePort());
    Udp.write("Answer from ESP8266 ChipID#");
    Udp.print(system_get_chip_id());
    Udp.write("#IP of ESP8266#");
    Udp.println(WiFi.localIP());
    Udp.endPacket();


    StaticJsonBuffer<256> jsonBuffer;
    JsonObject& root = jsonBuffer.parseObject(received_command);
    
    const char* hostname = root["hostname"];
    const char* version  = root["version"];
    const char* name     = root["name"];

    if (name == "LightNet") {
      Serial.print("Received Server Address for LightNet v");
      Serial.print(version);
      Serial.print(" - ");
      Serial.println(hostname);

      serverAddress = hostname;
    }
  } // end if


}

void printWifiStatus() {
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your WiFi shield's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  WiFi.printDiag(Serial);
}
