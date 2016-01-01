#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <WiFiUDP.h>
#include <ESP8266mDNS.h>
#include <ArduinoJson.h>
#include <WiFiManager.h>

extern "C" {  //required for read Vdd Voltage
#include "user_interface.h"
  // uint16 readvdd33(void);
}

// ========== HANDLER INFO ==========
const char* AUTOCONFIG_ACCESSPOINT_NAME = "LightHandlerConfigAP";
const int NUMBER_OF_LIGHTS = 96;
const char* GEOMETRY = "Cube";
const int GEOMETRY_WIDTH = 8;
const int GEOMETRY_HEIGHT = 1;
const int GEOMETRY_LENGTH = 12;
const int LIGHT_SIZE = 1;
const char* HANDLER_INFO = "ESP8266-based APA102 Handler";
const char* VERSION = "1.0.1";
const char* DNS_POSTFIX = "";
// ==================================

byte udpPacketBuffer[512];
IPAddress ipMulti(239, 0, 0, 57);
unsigned int portMulti = 2525;

String serverAddress = "";
int serverPort = -1;
bool multicastServerIsStarted = false;
bool isInitialized = false;

WiFiUDP Udp;

WiFiClient client;

ESP8266WebServer server(80);

void printWifiStatus() {
  Serial.println("===============================");
  Serial.println("========= CHIP INFO ===========");
  Serial.println("===============================");
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);
  Serial.print("AP subnet mask: ");
  Serial.println(WiFi.subnetMask());
  Serial.print("AP gateway: ");
  Serial.println(WiFi.gatewayIP());
  Serial.print("Chip ID: ");
  Serial.println(ESP.getChipId());
  Serial.print("Flash Chip ID: ");
  Serial.println(ESP.getFlashChipId());
  Serial.println("===============================");
  WiFi.printDiag(Serial);
  Serial.println("===============================");
}

void setup()
{
  Serial.begin(115200);

  WiFiManager wifiManager;

  String apName = String(AUTOCONFIG_ACCESSPOINT_NAME) + String("_") + String(ESP.getChipId());
  char apNameBuffer[apName.length()];
  apName.toCharArray(apNameBuffer, apName.length());
  
  if(!wifiManager.autoConnect(apNameBuffer)) {
    Serial.println("failed to connect to WiFi and hit timeout");

    ESP.reset();
    delay(1000);
  }

  Serial.println("Connected to WiFi");
}

void startMulticastServer() {
  Serial.println("> startMulticastServer()");
  
  printWifiStatus();
  
  if (!Udp.beginMulticast(WiFi.localIP(), ipMulti, portMulti)) {
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
  int addressLength = serverAddress.length()+1;
  char address[addressLength];
  serverAddress.toCharArray(address, addressLength);
  
  IPAddress remote_addr;
  int error = WiFi.hostByName(address, remote_addr);
  if (error) {
    error = client.connect(remote_addr, serverPort);
  } else {
    error = 0;
    Serial.print("Unable to resolve hostname. ERR: ");
    Serial.println(error);
  } 
  
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

int registerHandler() { 
  Serial.println("> registerHandler();");

  int error = 0;

  if (connectToAPI()) {
    StaticJsonBuffer<512> jsonBuffer;
    JsonObject& root = jsonBuffer.createObject();
    char ipstr[26];
    IPAddress ip = WiFi.localIP();
    sprintf(ipstr, "%d.%d.%d.%d", ip[0], ip[1], ip[2], ip[3]);
    root["handler"] = ipstr;
    root["handlerID"] = ESP.getFlashChipId();
    root["handlerInfo"] = HANDLER_INFO;
    root["handlerNumberOfLights"] = NUMBER_OF_LIGHTS;
    root["handlerType"] = 0;
    root["handlerVersion"] = VERSION;
    root["handlerOffsetX"] = 0;
    root["handlerOffsetY"] = 0;
    root["handlerOffsetZ"] = 0;
    root["handlerGeometry"] = GEOMETRY;
    root["handlerGeometryWidth"] = GEOMETRY_WIDTH;
    root["handlerGeometryHeight"] = GEOMETRY_HEIGHT;
    root["handlerGeometryLength"] = GEOMETRY_LENGTH;
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

    while(client.available()) {
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

bool handlerIsRegistered() {
  Serial.println("> handlerIsRegistered()");
  
  bool result = false;
  
  Serial.println("trying to determine whether the handler is already registered");

  if (connectToAPI()) {
    client.print("GET /api/handlers/");
    client.print(ESP.getFlashChipId());
    client.println(" HTTP/1.1");
    sendHTTPHeader();
    client.println();

    delay(10);
    String line = client.readStringUntil('\r');
    /*Serial.println(line);

    while(client.available()) {
      String line = client.readStringUntil('\r');
      Serial.println(line);
    }*/

    if (line.startsWith("HTTP/1.1 404 Not Found")) {
      Serial.println("handler not yet registered");
      result = false;
    } else if (line.startsWith("HTTP/1.1 200 OK")) {
      // TODO check if light count has changed and delete existing and reregister if changed
      
      Serial.println("handler already registered");
      result = true;
    } else {
      Serial.println("unrecognized status code or error");
    }

    client.stop();

  }
  
  Serial.print("< ");
  Serial.println(result);
  
  return result;
}

void listenForServer()
{
  Serial.println("> listenForServer()");
  
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

    Udp.read(udpPacketBuffer, noBytes);
    for (int i=1;i<=noBytes;i++)
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
      Udp.stop();
    } else {
      Serial.print("Unknown Discovery Service ");
      Serial.println(name);
    }
  }
}

void handleServerRequest() {
  Serial.println("> handleServerRequest()");
  
  if(server.args() == 0) {
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

  //TODO control lights
  
  server.send(200, "text/plain", "done.");
  Serial.println("< done");
}

void handleNotFound() {
  Serial.println("> handleNotFound()");
  
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET)?"GET":"POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  for (uint8_t i=0; i<server.args(); i++){
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.send(404, "text/plain", message);
}

void startWebServer() {
  String hostname = String("esp8266_") + String(ESP.getChipId()) + String(DNS_POSTFIX);
  char hostnameBuffer[hostname.length()];
  hostname.toCharArray(hostnameBuffer, hostname.length());
  if (MDNS.begin(hostnameBuffer)) {
    Serial.print("MDNS responder started. Hostname: ");
    Serial.println(hostnameBuffer);
  }
  
  server.on("/", HTTP_POST, handleServerRequest); 
   server.on("/info", [](){
    Serial.println("> http request /info");
    server.send(200, "text/plain", String("ESPHandler v") + String(VERSION) + String(" Info: ") + String(HANDLER_INFO));
  });

  server.onNotFound(handleNotFound);
  
  server.begin();
  Serial.println("HTTP server started");
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
      startWebServer();
      isInitialized = true;
    }
  }
}
