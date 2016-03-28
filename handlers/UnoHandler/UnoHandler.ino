//#define APA102
#define WS2812
//#define WS2801

#include <UIPEthernet.h>
#include <ArdOSC.h>

#define D0   16
#define D1   5
#define D2   4
#define D3   0
#define D4   2
#define D5   14
#define D6   12
#define D7   13
#define D8   15
#define D9   3
#define D10  1

#ifdef APA102
#include <Adafruit_DotStar.h>
#include <SPI.h>
#endif

#ifdef WS2801
#include "Adafruit_WS2801.h"
#include <SPI.h>
#endif

#ifdef WS2812
#include <Adafruit_NeoPixel.h>
#endif

#define NUMPIXELS 20

#define DATAPIN    D2 // D7 for SPI
#define CLOCKPIN   D5

// ========== HANDLER INFO ==========
char sID[7] = "CD6484";
const char* AUTOCONFIG_ACCESSPOINT_NAME = "LightHandlerConfigAP";
const char* GEOMETRY = "Cube";
const int GEOMETRY_WIDTH = 5; // x
const int GEOMETRY_HEIGHT = 4; // y
const int GEOMETRY_LENGTH = 1; // z
const char* GEOMETRY_DIRECTION_1 = "xx";
const char* GEOMETRY_DIRECTION_2 = "yy";
const char* GEOMETRY_DIRECTION_3 = "zz";
const int LIGHT_SIZE = 1;
const char* HANDLER_INFO = "96handheld";
const char* VERSION = "1.0.3";
const char* DNS_POSTFIX = "";
// ==================================

IPAddress ipMulti(239, 0, 0, 57);
unsigned int portMulti = 2525;

String serverAddress = "";
int serverPort = -1;
bool multicastServerIsStarted = false;
bool isInitialized = false;

EthernetUDP udp;

EthernetClient client;

EthernetServer server = EthernetServer(80);

#ifdef APA102
Adafruit_DotStar strip = Adafruit_DotStar(NUMPIXELS, DATAPIN, CLOCKPIN, DOTSTAR_BRG);
#endif

#ifdef WS2812
Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUMPIXELS, DATAPIN, NEO_GRB + NEO_KHZ800);
#endif

#ifdef WS2801
Adafruit_WS2801 strip = Adafruit_WS2801(NUMPIXELS, DATAPIN, CLOCKPIN);
#endif

void printStatus() {
  Serial.println("===============================");
  Serial.println("========= CHIP INFO ===========");
  Serial.println("===============================");
  IPAddress ip = Ethernet.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);
  Serial.print("Flash Chip ID: ");
  Serial.println(sID);
  Serial.println("===============================");
}

void setup()
{
  Serial.begin(115200);

  //strip.begin();
}

void startMulticastServer() {
  Serial.println("> startMulticastServer()");

  if (!EthernetUdp.beginMulticast(Ethernet.localIP(), ipMulti, portMulti)) {
    Serial.print("failed to start UDP Server at port ");
    delay(500);
  } else {
    Serial.print("Udp Multicast server started at : ");
    Serial.print(ipMulti);
    Serial.print(":");
    Serial.println(portMulti);
    multicastServerIsStarted = true;
  }
}

int connectToAPI() {
  int addressLength = serverAddress.length() + 1;
  char address[addressLength];
  serverAddress.toCharArray(address, addressLength);

  int error = client.connect(address, serverPort);

  if (!error) {
    Serial.print("failed to connect to the LightNet Server (");
    Serial.print(address);
    Serial.print(":");
    Serial.print(serverPort);
    Serial.print(") ERR: ");
    Serial.println(error);
  }

  return error;
}

int sendHTTPHeader() {
  client.print("Host: ");
  client.println(serverAddress);
  client.println("Connection: close");
}

bool handlerIsRegistered() {
  Serial.println("> handlerIsRegistered()");

  bool result = false;

  Serial.println("trying to determine whether the handler is already registered");

  if (connectToAPI()) {
    client.print("GET /api/handlers/");
    client.print(sID);
    client.println(" HTTP/1.1");
    sendHTTPHeader();
    client.println();

    delay(10);
    String line = client.readStringUntil('\r');

    if (line.startsWith("HTTP/1.1 404 Not Found")) {
      Serial.println("handler not yet registered");
      result = false;
    } else if (line.startsWith("HTTP/1.1 200 OK")) {
      // TODO check if light count has changed and delete existing and reregister if changed

      Serial.println("handler already registered");
      result = true;
    } else {
      Serial.print(line);
      while (client.available()) {
        String line = client.readStringUntil('\r');
        Serial.print(line);
      }
      Serial.println("");
      Serial.println("unrecognized status code or error");
    }

    client.stop();

  }

  Serial.print("< ");
  Serial.println(result);

  return result;
}

int registerHandler() {
  Serial.println("> registerHandler();");

  int error = 0;

  if (connectToAPI()) {
    StaticJsonBuffer<512> jsonBuffer;
    JsonObject& root = jsonBuffer.createObject();
    char ipstr[26];
    IPAddress ip = Ethernet.localIP();
    sprintf(ipstr, "%d.%d.%d.%d", ip[0], ip[1], ip[2], ip[3]);
    root["handler"] = ipstr;
    root["handlerID"] = sID;
    root["handlerInfo"] = HANDLER_INFO;
    root["handlerNumberOfLights"] = NUMPIXELS;
    root["handlerType"] = 0;
    root["handlerVersion"] = VERSION;
    root["handlerOffsetX"] = 0;
    root["handlerOffsetY"] = 0;
    root["handlerOffsetZ"] = 0;
    root["handlerGeometry"] = GEOMETRY;
    root["handlerGeometryWidth"] = GEOMETRY_WIDTH;
    root["handlerGeometryHeight"] = GEOMETRY_HEIGHT;
    root["handlerGeometryLength"] = GEOMETRY_LENGTH;
    root["handlerGeometryDirection1"] = GEOMETRY_DIRECTION_1;
    root["handlerGeometryDirection2"] = GEOMETRY_DIRECTION_2;
    root["handlerGeometryDirection3"] = GEOMETRY_DIRECTION_3;
    
    root["lightSize"] = LIGHT_SIZE;

    client.println("POST /api/handlers HTTP/1.1");
    sendHTTPHeader();
    client.println("Content-Type: application/json; charset=utf-8");
    client.print("Content-Length: ");
    client.println(root.measureLength());
    client.println();
    root.printTo(client);
    root.printTo(Serial);

    delay(10);
    String line = client.readStringUntil('\r');
    Serial.println(line);

    while (client.available()) {
      String line = client.readStringUntil('\r');
      Serial.println(line);
    }

    if (line.startsWith("HTTP/1.1 200 OK")) {
      Serial.println("handler is registered.");
      error = 1;
    } else {
      Serial.println("unrecognized status code or error");
    }

    client.stop();
  }

  Serial.print("< ");
  Serial.println(error);

  return error;
}

/*void getCurrentColor() {
  Serial.println("> getCurrentColor()");

  if (connectToAPI()) {
    client.print("GET /api/handlers/");
    client.print(ESP.getFlashChipId());
    client.println("/control HTTP/1.1");
    sendHTTPHeader();
    client.println();

    delay(10);
    String line = client.readStringUntil('\r');

    if (line.startsWith("HTTP/1.1 404 Not Found")) {
      Serial.println("light color not found");
    } else if (line.startsWith("HTTP/1.1 200 OK")) {
      String received_data = "";
      while (client.available()) {
        received_data = received_data + client.readStringUntil('\r');
      }
      int contentBodyIndex = received_data.lastIndexOf('\n');
      String body;
      if (contentBodyIndex > 0) {
        body = received_data.substring(contentBodyIndex + 1);
      }
      Serial.println("parsing received data:");
      Serial.print("'");
      Serial.print(body);
      Serial.println("'");
      StaticJsonBuffer<1024> jsonBuffer;
      JsonObject& root = jsonBuffer.parseObject(body);

      if (!root.success()) {
        Serial.println("parsing http body failed");
        client.stop();
        return;
      }

      for (JsonObject::iterator it=root.begin(); it!=root.end(); ++it) {
        int r = it->value[0].as<int>();
        int g = it->value[1].as<int>();
        int b = it->value[2].as<int>();

        Serial.print("setting index ");
        Serial.print(it->key);
        Serial.print(" to ");
        Serial.print(r);
        Serial.print(":");
        Serial.print(g);
        Serial.print(":");
        Serial.println(b);

        strip.setPixelColor(String(it->key).toInt(), strip.Color(r, g, b));
      }

      strip.show();
    } else {
      Serial.print(line);
      while (client.available()) {
        String line = client.readStringUntil('\r');
        Serial.print(line);
      }
      Serial.println("");
      Serial.println("unrecognized status code or error");
    }

    client.stop();
  }
  }*/

void listenForServer()
{
  Serial.println("> listenForServer()");

  int noBytes = EthernetUdp.parsePacket();
  String received_command = "";

  if ( noBytes ) {
    Serial.print(millis() / 1000);
    Serial.print(":Packet of ");
    Serial.print(noBytes);
    Serial.print(" received from ");
    Serial.print(EthernetUdp.remoteIP());
    Serial.print(":");
    Serial.println(EthernetUdp.remotePort());

    EthernetUdp.read(udpPacketBuffer, noBytes);
    for (int i = 1; i <= noBytes; i++)
    {
      received_command = received_command + char(udpPacketBuffer[i - 1]);
    }

    StaticJsonBuffer<256> jsonBuffer;
    JsonObject& root = jsonBuffer.parseObject(received_command);

    const char* hostname = root["hostname"];
    const char* ip = root["ip"];
    const char* port = root["port"];
    const char* name = root["name"];

    if (String(name) == "LightNet") {
      Serial.print("Received Server Address for LightNet v");
      Serial.print((const char*)root["version"]);
      Serial.print(" - ");
      Serial.print(hostname);
      Serial.print(":");
      Serial.println(port);

      serverAddress = String(ip);
      serverPort = String(port).toInt();

      Serial.println("Stopping UDP Server");
      EthernetUdp.stop();
    } else {
      Serial.print("Unknown Discovery Service ");
      Serial.println(name);
    }
  }
}

void handleServerRequest() {
  Serial.println("> handleServerRequest()");

  if (server.args() == 0) {
    Serial.println("< failed -> no arguments");

    server.send(500, "text/plain", "BAD ARGS\r\n");
  }

  String index = server.arg(0);
  String color_r = server.arg(1);
  String color_g = server.arg(2);
  String color_b = server.arg(3);

  Serial.print("index: ");
  Serial.println(index);
  Serial.print("color: [");
  Serial.print(color_r);
  Serial.print(", ");
  Serial.print(color_g);
  Serial.print(", ");
  Serial.print(color_b);
  Serial.println("]");

  strip.setPixelColor(index.toInt(), strip.Color(color_r.toInt(), color_g.toInt(), color_b.toInt()));
  strip.show();

  server.send(200, "text/plain", "done.");
  Serial.println("< done");
}

void handleNotFound() {
  Serial.println("> handleNotFound()");

  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET) ? "GET" : "POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  for (uint8_t i = 0; i < server.args(); i++) {
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.send(404, "text/plain", message);
}

void startWebServer() {
  String hostname = String("esp8266_") + String(ESP.getChipId()) + String(DNS_POSTFIX);
  char hostnameBuffer[hostname.length()];
  hostname.toCharArray(hostnameBuffer, hostname.length());
  /*if (MDNS.begin(hostnameBuffer)) {
    Serial.print("MDNS responder started. Hostname: ");
    Serial.println(hostnameBuffer);
  }*/

  server.on("/", HTTP_POST, handleServerRequest);
  server.on("/info", []() {
    Serial.println("> http request /info");
    server.send(200, "text/plain", String("ESPHandler v") + String(VERSION) + String(" Info: ") + String(HANDLER_INFO));
  });

  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started");

  strip.begin();
}

void loop()
{
  if (isInitialized) {
    server.handleClient();
  } else if (serverAddress == "") { // has server data received
    if (!multicastServerIsStarted) {
      startMulticastServer();
    } else {
      listenForServer();
      delay(100);
    }
  } else {
    if (!handlerIsRegistered()) {
      registerHandler();
      delay(500);
    } else {
      //getCurrentColor();
      startWebServer();
      isInitialized = true;
    }
  }
}
